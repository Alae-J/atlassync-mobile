# Stripe Production-Grade Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the MVP Stripe integration shipped on `feat/stripe-payments` from "works for a demo" to "works like real payment apps do" — Stripe Customer per user (saved cards next time), idempotency keys (no duplicate charges from retries), PaymentIntent reuse within a session (no orphans), refund + dispute webhook handlers with new session states, Stripe Tax replacing the hardcoded 8.75%, and secrets pulled from HashiCorp Vault instead of plain env vars.

**Architecture:** Six independent phases that compose without overlapping. Phase A introduces the `payment_customers` correlation table in session-service so every payment is attached to a Stripe Customer (no more guest checkouts). Phase B adds `stripe_payment_intent_id` to the session row + idempotency keys, so retries and resumes never mint duplicate PaymentIntents. Phase C extends the session state machine with REFUNDED / DISPUTED / CHARGEBACK_LOST states driven by new webhook handlers. Phase D moves tax computation server-side via Stripe Tax. Phase E moves the two Stripe secrets from env vars into Vault (already running in `docker-compose.yml`). Phase F is the verification runbook.

**Tech Stack:**
- Backend: Spring Boot 3.x, Flyway, `stripe-java` 25.1.0, Spring Cloud Vault
- Mobile: Expo + `@stripe/stripe-react-native@0.50.3`
- Vault dev instance from `docker-compose.yml` (token `root`)
- Stripe CLI for local webhook forwarding (existing setup)

**Commit style:** lowercase, 1–9 words per commit, NO co-authored-by, NO AI signature footers. Granular commits — one per task.

**Branch:** Branch off `feat/stripe-payments` (both repos) with a new branch `feat/stripe-prod-grade`. Some tasks are mobile-only, some backend-only, some both.

**Prereqs:**
- `feat/stripe-payments` already merged or at least built on (it has the MVP foundation this plan extends)
- Stripe test account already in use
- HashiCorp Vault container already running locally (`vault` service in `docker-compose.yml`)
- Stripe CLI installed

---

## File Structure

**Backend (session-service):**

Files to create:
- `session-service/src/main/resources/db/migration/V3__payment_customers.sql` — `payment_customers` table
- `session-service/src/main/resources/db/migration/V4__session_payment_intent.sql` — `stripe_payment_intent_id` + `stripe_intent_status` columns on `shopping_sessions`
- `session-service/src/main/resources/db/migration/V5__session_status_refund_dispute.sql` — Hibernate enum needs no schema change but document new statuses
- `session-service/src/main/java/com/atlassync/session/payment/PaymentCustomer.java` — JPA entity
- `session-service/src/main/java/com/atlassync/session/payment/PaymentCustomerRepository.java`
- `session-service/src/main/java/com/atlassync/session/payment/StripeCustomerService.java` — `getOrCreate(userId, email)` lazy cache
- `session-service/src/main/java/com/atlassync/session/payment/RefundController.java` — admin refund endpoint
- `session-service/src/main/java/com/atlassync/session/dto/RefundRequest.java`
- `session-service/src/main/java/com/atlassync/session/dto/RefundResponse.java`
- `session-service/src/main/resources/bootstrap.yml` — Vault config for Spring Cloud Vault

Files to modify:
- `session-service/pom.xml` — add `spring-cloud-starter-vault-config`
- `session-service/src/main/resources/application.yml` — Vault property references, remove the env-var direct binding for Stripe secrets
- `session-service/src/main/java/com/atlassync/session/entity/SessionStatus.java` — add REFUNDED, PARTIAL_REFUND, DISPUTED, CHARGEBACK_LOST
- `session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java` — `transitionTo` allowed-transitions table extended
- `session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java` — new `stripe_payment_intent_id` + `stripe_intent_status` columns mapped
- `session-service/src/main/java/com/atlassync/session/payment/StripeService.java` — accept `customer` + idempotency key + automatic tax in createPaymentIntent; add retrievePaymentIntent + refund methods
- `session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java` — handle `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`
- `session-service/src/main/java/com/atlassync/session/service/SessionService.java` — `createPaymentIntent` now does intent-reuse + customer lookup; add `markRefundedFromWebhook`, `markDisputedFromWebhook`, `resolveDisputeFromWebhook`, `issueRefund`
- `session-service/src/main/java/com/atlassync/session/controller/SessionController.java` — wire customer email from `X-User-Email` header

**Mobile:**

Files to modify:
- `atlassync-mobile/src/types/index.ts` — extend `SessionInfo.status` union with new states; add `RefundInfo` if surfacing refund details
- `atlassync-mobile/app/shop/review.tsx` — remove hardcoded `TAX_RATE`; show "Tax calculated at checkout" until PaymentSheet returns
- `atlassync-mobile/app/order/[id].tsx` — render REFUNDED / DISPUTED badges on receipts

---

## Phase A — Stripe Customer per user

**Goal:** Every payment is attached to a long-lived Stripe Customer. Lazy-created on first checkout. Cached locally in `payment_customers` so we don't ask Stripe twice.

### Task A1 — Migration: payment_customers table

**Files:**
- Create: `session-service/src/main/resources/db/migration/V3__payment_customers.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Correlates an AtlasSync user to their long-lived Stripe Customer object.
-- One row per (user_id, stripe_customer_id) pair. Lazy-created on first
-- checkout — registration stays fast and offline-friendly.
--
-- session-service owns this table because Stripe customers are a
-- payment-flow concern; auth-service stays Stripe-unaware. The unique
-- constraint on user_id enforces "one customer per user" so we never
-- accidentally create a second customer mid-session.

CREATE TABLE payment_customers (
    user_id            BIGINT PRIMARY KEY,
    stripe_customer_id VARCHAR(64) NOT NULL UNIQUE,
    email_at_creation  VARCHAR(255),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_customers_stripe_id
        ON payment_customers (stripe_customer_id);
```

- [ ] **Step 2: Verify on a fresh DB**

```bash
cd /home/xichrome/Projects/Learning/Atlassync/atlassync-backend
mvn -pl session-service test -DskipTests -Dflyway.skip=false 2>/dev/null || true
# Or just rely on app startup: restart session-service and watch the Flyway log line
```

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/resources/db/migration/V3__payment_customers.sql
git commit -m "add payment customers table"
```

### Task A2 — PaymentCustomer entity + repository

**Files:**
- Create: `session-service/src/main/java/com/atlassync/session/payment/PaymentCustomer.java`
- Create: `session-service/src/main/java/com/atlassync/session/payment/PaymentCustomerRepository.java`

- [ ] **Step 1: Entity**

```java
package com.atlassync.session.payment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "payment_customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCustomer {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "stripe_customer_id", nullable = false, unique = true)
    private String stripeCustomerId;

    @Column(name = "email_at_creation")
    private String emailAtCreation;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
```

- [ ] **Step 2: Repository**

```java
package com.atlassync.session.payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentCustomerRepository extends JpaRepository<PaymentCustomer, Long> {
    Optional<PaymentCustomer> findByUserId(Long userId);
}
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/PaymentCustomer.java \
        session-service/src/main/java/com/atlassync/session/payment/PaymentCustomerRepository.java
git commit -m "model payment customer entity"
```

### Task A3 — StripeCustomerService

**Files:**
- Create: `session-service/src/main/java/com/atlassync/session/payment/StripeCustomerService.java`

- [ ] **Step 1: Service**

```java
package com.atlassync.session.payment;

import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Lazily creates a Stripe Customer for an AtlasSync user the first time they
 * check out, then caches the resulting {@code cus_…} id in
 * {@link PaymentCustomer}. Every subsequent PaymentIntent for that user is
 * attached to the same Customer — saved cards, dashboard history, and
 * refund/dispute correlation all flow from this one id.
 *
 * <p>We do NOT create Customers at sign-up because:
 * <ul>
 *   <li>Registration shouldn't depend on Stripe being reachable.</li>
 *   <li>Users who never check out shouldn't pollute the Stripe dashboard.</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StripeCustomerService {

    private final PaymentCustomerRepository repository;

    @Transactional
    public String getOrCreate(Long userId, String email) throws StripeException {
        return repository.findByUserId(userId)
                .map(PaymentCustomer::getStripeCustomerId)
                .orElseGet(() -> createAndPersistUnchecked(userId, email));
    }

    // Wrapper that turns StripeException into a runtime exception so
    // {@code orElseGet} accepts it. The caller of {@code getOrCreate}
    // still sees the original StripeException because we unwrap below.
    private String createAndPersistUnchecked(Long userId, String email) {
        try {
            return createAndPersist(userId, email);
        } catch (StripeException e) {
            throw new StripeRuntimeException(e);
        }
    }

    private String createAndPersist(Long userId, String email) throws StripeException {
        CustomerCreateParams params = CustomerCreateParams.builder()
                .setEmail(email)
                .putMetadata("atlassync_user_id", userId.toString())
                .build();
        Customer customer = Customer.create(params);
        PaymentCustomer row = new PaymentCustomer(
                userId, customer.getId(), email, Instant.now());
        repository.save(row);
        log.info("[stripe-customer] created customer={} for user={}",
                customer.getId(), userId);
        return customer.getId();
    }

    /** Internal: rewraps {@link StripeException} as unchecked so the lambda compiles. */
    static class StripeRuntimeException extends RuntimeException {
        StripeRuntimeException(StripeException cause) {
            super(cause);
        }
        public StripeException getStripeCause() { return (StripeException) getCause(); }
    }
}
```

- [ ] **Step 2: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/StripeCustomerService.java
git commit -m "lazy create stripe customers"
```

### Task A4 — Use customer in PaymentIntent creation

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/payment/StripeService.java` — add `customerId` param to `createPaymentIntent`
- Modify: `session-service/src/main/java/com/atlassync/session/service/SessionService.java` — call `stripeCustomerService.getOrCreate` and pass to StripeService
- Modify: `session-service/src/main/java/com/atlassync/session/controller/SessionController.java` — forward `X-User-Email` header through to the service layer

- [ ] **Step 1: Extend StripeService.createPaymentIntent**

Change the signature to accept the customer id and stamp it on the intent:

```java
public PaymentIntent createPaymentIntent(UUID sessionId, BigDecimal amount, String customerId) throws StripeException {
    long amountMinor = amount.setScale(2, RoundingMode.HALF_UP)
            .movePointRight(2)
            .longValueExact();

    PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
            .setAmount(amountMinor)
            .setCurrency(properties.currency())
            .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build())
            .putMetadata("session_id", sessionId.toString())
            .setDescription("AtlasSync · session " + sessionId);

    if (customerId != null && !customerId.isBlank()) {
        builder.setCustomer(customerId);
    }

    PaymentIntent intent = PaymentIntent.create(builder.build());
    log.info("[stripe] paymentIntent created session={} customer={} amount={} {} id={}",
            sessionId, customerId, amountMinor, properties.currency(), intent.getId());
    return intent;
}
```

- [ ] **Step 2: Wire in SessionService.createPaymentIntent**

Add `private final StripeCustomerService stripeCustomerService;` (Lombok ctor handles it). Extend method signature to take `email`. Inside:

```java
String customerId;
try {
    customerId = stripeCustomerService.getOrCreate(userId, email);
} catch (StripeException e) {
    throw new RuntimeException("Could not get Stripe customer: " + e.getMessage(), e);
} catch (StripeCustomerService.StripeRuntimeException e) {
    throw new RuntimeException("Could not get Stripe customer: " + e.getStripeCause().getMessage(), e);
}

PaymentIntent intent = stripeService.createPaymentIntent(sessionId, amount, customerId);
```

(`email` becomes a new parameter on `SessionService.createPaymentIntent(UUID sessionId, Long userId, String email)`.)

- [ ] **Step 3: Forward email from controller**

In `SessionController.createPaymentIntent`, add `@RequestHeader(value = "X-User-Email", required = false) String email` and pass to the service:

```java
@PostMapping("/{id}/pay/intent")
public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
        @PathVariable UUID id,
        @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
        @RequestHeader(value = "X-User-Email", required = false) String email,
        @RequestParam(value = "userId", required = false) Long paramUserId) {

    Long userId = headerUserId != null ? headerUserId : paramUserId;
    if (userId == null) {
        throw new IllegalArgumentException(
                "userId is required via X-User-Id header or userId param");
    }
    PaymentIntentResponse response = sessionService.createPaymentIntent(id, userId, email);
    return ResponseEntity.ok(response);
}
```

- [ ] **Step 4: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/StripeService.java \
        session-service/src/main/java/com/atlassync/session/service/SessionService.java \
        session-service/src/main/java/com/atlassync/session/controller/SessionController.java
git commit -m "attach stripe customer to payment intents"
```

---

## Phase B — Idempotency keys + PaymentIntent reuse

**Goal:** A retried request never creates a duplicate intent. A user backgrounding and resuming mid-checkout gets the SAME intent back. A completed session refuses new intents.

### Task B1 — Migration: stripe_payment_intent_id + stripe_intent_status on session

**Files:**
- Create: `session-service/src/main/resources/db/migration/V4__session_payment_intent.sql`

- [ ] **Step 1: Migration**

```sql
-- Track the live PaymentIntent attached to a session. Lets us reuse the
-- intent on retries and resume across app backgrounding, and lets us
-- refuse new intents when the session already has one open or has been
-- paid for. {@code stripe_intent_status} caches the last-seen status so
-- the reuse decision doesn't need a Stripe round-trip when the intent is
-- in a terminal local state.

ALTER TABLE shopping_sessions
    ADD COLUMN stripe_payment_intent_id VARCHAR(64),
    ADD COLUMN stripe_intent_status     VARCHAR(32);

CREATE INDEX idx_shopping_sessions_stripe_intent
        ON shopping_sessions (stripe_payment_intent_id);
```

- [ ] **Step 2: Commit**

```bash
git add session-service/src/main/resources/db/migration/V4__session_payment_intent.sql
git commit -m "add stripe intent columns to sessions"
```

### Task B2 — Map new columns on ShoppingSession entity

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java`

- [ ] **Step 1: Add columns**

In `ShoppingSession.java`, near the other Stripe-related fields (or near the bottom of the field list — match the file's style):

```java
@Column(name = "stripe_payment_intent_id", length = 64)
private String stripePaymentIntentId;

@Column(name = "stripe_intent_status", length = 32)
private String stripeIntentStatus;
```

Lombok `@Getter` `@Setter` are already on the class — getters/setters auto-generated.

- [ ] **Step 2: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java
git commit -m "map stripe intent fields on session"
```

### Task B3 — StripeService.retrievePaymentIntent + idempotency key support

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/payment/StripeService.java`

- [ ] **Step 1: Add idempotency key param + retrieve method**

Update `createPaymentIntent` to accept an optional idempotency key:

```java
public PaymentIntent createPaymentIntent(
        UUID sessionId,
        BigDecimal amount,
        String customerId,
        String idempotencyKey) throws StripeException {

    long amountMinor = amount.setScale(2, RoundingMode.HALF_UP)
            .movePointRight(2)
            .longValueExact();

    PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
            .setAmount(amountMinor)
            .setCurrency(properties.currency())
            .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build())
            .putMetadata("session_id", sessionId.toString())
            .setDescription("AtlasSync · session " + sessionId);

    if (customerId != null && !customerId.isBlank()) {
        builder.setCustomer(customerId);
    }

    RequestOptions options = idempotencyKey != null && !idempotencyKey.isBlank()
            ? RequestOptions.builder().setIdempotencyKey(idempotencyKey).build()
            : RequestOptions.getDefault();

    PaymentIntent intent = PaymentIntent.create(builder.build(), options);
    log.info("[stripe] paymentIntent created session={} customer={} idempotency={} amount={} {} id={}",
            sessionId, customerId, idempotencyKey, amountMinor, properties.currency(), intent.getId());
    return intent;
}

public PaymentIntent retrievePaymentIntent(String paymentIntentId) throws StripeException {
    return PaymentIntent.retrieve(paymentIntentId);
}
```

Add the import:
```java
import com.stripe.net.RequestOptions;
```

- [ ] **Step 2: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/StripeService.java
git commit -m "support idempotency and retrieve on stripe service"
```

### Task B4 — Intent reuse logic in SessionService.createPaymentIntent

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/service/SessionService.java`

- [ ] **Step 1: Rewrite createPaymentIntent**

Replace the existing body with this. The flow:
1. Reject if status is COMPLETED, REFUNDED, DISPUTED, CHARGEBACK_LOST (terminal — no more payment)
2. If a stripe_payment_intent_id is already set on the session, retrieve it from Stripe and decide:
   - `requires_payment_method`, `requires_confirmation`, `requires_action`, `processing` → REUSE — return existing client_secret
   - `succeeded` → call `markPaidFromWebhook` self-heal (the webhook didn't arrive yet but we have proof) and throw `IllegalStateException("session already paid")`
   - `canceled` → clear the stale id and fall through to create a fresh one
3. Otherwise mint a new intent with idempotency key `"session-{sessionId}-attempt-{counter}"`

```java
@Transactional
public PaymentIntentResponse createPaymentIntent(UUID sessionId, Long userId, String email) {
    ShoppingSession session = findSessionOrThrow(sessionId);
    verifyOwnership(session, userId);

    // Refuse new intents once the session has reached a terminal state.
    SessionStatus status = session.getStatus();
    if (status == SessionStatus.COMPLETED || status == SessionStatus.REFUNDED
            || status == SessionStatus.PARTIAL_REFUND || status == SessionStatus.DISPUTED
            || status == SessionStatus.CHARGEBACK_LOST) {
        throw new IllegalStateException(
                "Session " + sessionId + " has reached terminal status " + status
                        + " — no more payment intents.");
    }

    BigDecimal amount = cartSnapshotClient.fetch(sessionId).total();
    if (amount == null || amount.signum() <= 0) {
        throw new IllegalStateException(
                "Refusing to create payment intent for empty cart");
    }

    // Try to reuse an existing intent first.
    if (session.getStripePaymentIntentId() != null) {
        try {
            PaymentIntent existing = stripeService.retrievePaymentIntent(
                    session.getStripePaymentIntentId());
            String existingStatus = existing.getStatus();
            session.setStripeIntentStatus(existingStatus);

            switch (existingStatus) {
                case "requires_payment_method":
                case "requires_confirmation":
                case "requires_action":
                case "processing":
                    log.info("[stripe] reusing existing paymentIntent {} for session={} (status={})",
                            existing.getId(), sessionId, existingStatus);
                    sessionRepository.save(session);
                    return new PaymentIntentResponse(
                            sessionId,
                            existing.getId(),
                            existing.getClientSecret(),
                            amount,
                            existing.getCurrency().toUpperCase());

                case "succeeded":
                    // Self-heal: charge cleared but webhook is late.
                    log.warn("[stripe] paymentIntent {} already succeeded for session={}, self-healing",
                            existing.getId(), sessionId);
                    markPaidFromWebhook(sessionId);
                    throw new IllegalStateException("Session already paid");

                case "canceled":
                default:
                    // Stale or canceled — fall through to mint a new one.
                    session.setStripePaymentIntentId(null);
                    session.setStripeIntentStatus(null);
                    break;
            }
        } catch (StripeException e) {
            // Couldn't reach Stripe; treat as transient and rethrow.
            throw new RuntimeException(
                    "Could not retrieve existing paymentIntent: " + e.getMessage(), e);
        }
    }

    // Transition into PAYING (idempotent on PAYING).
    SessionStatus fromState = session.getStatus();
    if (fromState != SessionStatus.PAYING) {
        session.transitionTo(SessionStatus.PAYING);
        recordTransition(session, fromState, SessionStatus.PAYING,
                "user:" + userId, null);
    }

    // Resolve / create the Stripe customer.
    String customerId;
    try {
        customerId = stripeCustomerService.getOrCreate(userId, email);
    } catch (StripeException e) {
        throw new RuntimeException("Could not get Stripe customer: " + e.getMessage(), e);
    }

    String idempotencyKey = "session-" + sessionId + "-v" + session.getVersion();

    try {
        PaymentIntent intent = stripeService.createPaymentIntent(
                sessionId, amount, customerId, idempotencyKey);
        session.setStripePaymentIntentId(intent.getId());
        session.setStripeIntentStatus(intent.getStatus());
        sessionRepository.save(session);

        return new PaymentIntentResponse(
                sessionId,
                intent.getId(),
                intent.getClientSecret(),
                amount,
                intent.getCurrency().toUpperCase());
    } catch (StripeException e) {
        log.error("[stripe] failed to create paymentIntent session={}", sessionId, e);
        throw new RuntimeException("Could not create payment intent: " + e.getMessage(), e);
    }
}
```

(`session.getVersion()` is the JPA `@Version` field — different value per transactional save, makes the idempotency key bust naturally when we genuinely want a new intent.)

- [ ] **Step 2: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/service/SessionService.java
git commit -m "reuse stripe intents with idempotency"
```

---

## Phase C — Refunds & disputes

**Goal:** Stripe-side refunds and chargebacks propagate into our session state machine via webhooks. Admin can issue a refund programmatically.

### Task C1 — Extend SessionStatus + state machine

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/entity/SessionStatus.java`
- Modify: `session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java` (the `transitionTo` allowed-transitions logic)

- [ ] **Step 1: Add the new statuses**

```java
package com.atlassync.session.entity;

public enum SessionStatus {
    CREATED,
    ACTIVE,
    PAYING,
    COMPLETED,
    CANCELLED,
    REFUNDED,
    PARTIAL_REFUND,
    DISPUTED,
    CHARGEBACK_LOST
}
```

- [ ] **Step 2: Update `transitionTo` allowed transitions**

In `ShoppingSession.java`, find the `transitionTo` method (or wherever the state-machine map is built). Add these allowed edges:

- COMPLETED → REFUNDED, PARTIAL_REFUND, DISPUTED
- DISPUTED → COMPLETED (won), CHARGEBACK_LOST (lost)
- COMPLETED → CHARGEBACK_LOST (direct lost dispute, no preceding DISPUTED phase if Stripe finalizes fast)

Read the existing transition map first to mirror the style. If the map is a `Map<SessionStatus, Set<SessionStatus>>` or similar, append entries:

```java
ALLOWED.put(SessionStatus.COMPLETED,
        EnumSet.of(SessionStatus.REFUNDED, SessionStatus.PARTIAL_REFUND,
                SessionStatus.DISPUTED, SessionStatus.CHARGEBACK_LOST));
ALLOWED.put(SessionStatus.DISPUTED,
        EnumSet.of(SessionStatus.COMPLETED, SessionStatus.CHARGEBACK_LOST));
```

(Exact data structure depends on what's already in the file — match the existing style.)

- [ ] **Step 3: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/entity/SessionStatus.java \
        session-service/src/main/java/com/atlassync/session/entity/ShoppingSession.java
git commit -m "add refund and dispute session states"
```

### Task C2 — Webhook handlers for refund + dispute events

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java`
- Modify: `session-service/src/main/java/com/atlassync/session/service/SessionService.java`

- [ ] **Step 1: Add SessionService methods**

In `SessionService.java`, add three new methods modeled on `markPaidFromWebhook`:

```java
@Transactional
public void markRefundedFromWebhook(String paymentIntentId, long refundedAmountMinor, long originalAmountMinor) {
    ShoppingSession session = findSessionByPaymentIntentOrThrow(paymentIntentId);
    SessionStatus fromState = session.getStatus();
    SessionStatus toState = refundedAmountMinor >= originalAmountMinor
            ? SessionStatus.REFUNDED
            : SessionStatus.PARTIAL_REFUND;

    if (session.getStatus() == toState) {
        log.info("[stripe-webhook] session={} already {}, skipping", session.getId(), toState);
        return;
    }

    session.transitionTo(toState);
    recordTransition(session, fromState, toState, "stripe-webhook", null);
    sessionRepository.save(session);
    eventProducer.publishSessionRefunded(session.getId());
    log.info("[stripe-webhook] session={} marked {} (refunded {}/{} minor units)",
            session.getId(), toState, refundedAmountMinor, originalAmountMinor);
}

@Transactional
public void markDisputedFromWebhook(String paymentIntentId) {
    ShoppingSession session = findSessionByPaymentIntentOrThrow(paymentIntentId);
    if (session.getStatus() == SessionStatus.DISPUTED) return;

    SessionStatus fromState = session.getStatus();
    session.transitionTo(SessionStatus.DISPUTED);
    recordTransition(session, fromState, SessionStatus.DISPUTED, "stripe-webhook", null);
    sessionRepository.save(session);
    log.warn("[stripe-webhook] session={} entered DISPUTED state", session.getId());
}

@Transactional
public void resolveDisputeFromWebhook(String paymentIntentId, boolean won) {
    ShoppingSession session = findSessionByPaymentIntentOrThrow(paymentIntentId);
    SessionStatus targetState = won ? SessionStatus.COMPLETED : SessionStatus.CHARGEBACK_LOST;
    if (session.getStatus() == targetState) return;

    SessionStatus fromState = session.getStatus();
    session.transitionTo(targetState);
    recordTransition(session, fromState, targetState, "stripe-webhook", null);
    sessionRepository.save(session);
    log.warn("[stripe-webhook] session={} dispute resolved → {}", session.getId(), targetState);
}

private ShoppingSession findSessionByPaymentIntentOrThrow(String paymentIntentId) {
    return sessionRepository.findByStripePaymentIntentId(paymentIntentId)
            .orElseThrow(() -> new IllegalStateException(
                    "No session has paymentIntent " + paymentIntentId));
}
```

Add the repo method on `SessionRepository`:

```java
Optional<ShoppingSession> findByStripePaymentIntentId(String stripePaymentIntentId);
```

And the event-producer method (or skip if the eventProducer doesn't yet support it):

```java
public void publishSessionRefunded(UUID sessionId) { /* ... */ }
```

(If the existing eventProducer doesn't have publishSessionRefunded, either add it or call `publishSessionCompleted` for now and file a follow-up.)

- [ ] **Step 2: Wire webhook handlers in StripeWebhookController**

Add new branches inside `handle()` after the `payment_intent.succeeded` block:

```java
switch (event.getType()) {
    case "payment_intent.succeeded":
        // ... existing code ...
        break;

    case "charge.refunded": {
        Charge charge = unwrap(event, Charge.class);
        if (charge == null) return ResponseEntity.ok("ignored");
        try {
            sessionService.markRefundedFromWebhook(
                    charge.getPaymentIntent(),
                    charge.getAmountRefunded(),
                    charge.getAmount());
        } catch (IllegalStateException e) {
            log.warn("[stripe-webhook] refund could not be applied: {}", e.getMessage());
            return ResponseEntity.ok("not_applicable");
        } catch (Exception e) {
            log.error("[stripe-webhook] failed to apply refund", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("retry");
        }
        break;
    }

    case "charge.dispute.created": {
        Dispute dispute = unwrap(event, Dispute.class);
        if (dispute == null) return ResponseEntity.ok("ignored");
        try {
            sessionService.markDisputedFromWebhook(dispute.getPaymentIntent());
        } catch (Exception e) {
            log.error("[stripe-webhook] failed to apply dispute", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("retry");
        }
        break;
    }

    case "charge.dispute.closed": {
        Dispute dispute = unwrap(event, Dispute.class);
        if (dispute == null) return ResponseEntity.ok("ignored");
        boolean won = "won".equals(dispute.getStatus());
        try {
            sessionService.resolveDisputeFromWebhook(dispute.getPaymentIntent(), won);
        } catch (Exception e) {
            log.error("[stripe-webhook] failed to resolve dispute", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("retry");
        }
        break;
    }

    default:
        // unhandled event type — ack so Stripe stops retrying.
        break;
}
```

Add the helper at the bottom of the class:

```java
@SuppressWarnings("unchecked")
private <T extends StripeObject> T unwrap(Event event, Class<T> type) {
    StripeObject obj = event.getDataObjectDeserializer().getObject().orElse(null);
    return type.isInstance(obj) ? (T) obj : null;
}
```

Imports:
```java
import com.stripe.model.Charge;
import com.stripe.model.Dispute;
```

- [ ] **Step 3: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java \
        session-service/src/main/java/com/atlassync/session/service/SessionService.java \
        session-service/src/main/java/com/atlassync/session/repository/SessionRepository.java
git commit -m "handle refund and dispute webhooks"
```

### Task C3 — Admin refund endpoint

**Files:**
- Create: `session-service/src/main/java/com/atlassync/session/dto/RefundRequest.java`
- Create: `session-service/src/main/java/com/atlassync/session/dto/RefundResponse.java`
- Create: `session-service/src/main/java/com/atlassync/session/payment/RefundController.java`
- Modify: `session-service/src/main/java/com/atlassync/session/payment/StripeService.java` — add `refund` method
- Modify: `session-service/src/main/java/com/atlassync/session/service/SessionService.java` — add `issueRefund`

- [ ] **Step 1: DTOs**

```java
// RefundRequest.java
package com.atlassync.session.dto;

import jakarta.validation.constraints.Positive;

public record RefundRequest(
        // null = full refund. Otherwise partial refund of this amount in major units.
        @Positive Double amount,
        String reason
) {}
```

```java
// RefundResponse.java
package com.atlassync.session.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record RefundResponse(
        UUID sessionId,
        String stripeRefundId,
        BigDecimal amountRefunded,
        String currency,
        String status
) {}
```

- [ ] **Step 2: StripeService.refund**

```java
public Refund refund(String paymentIntentId, Long amountMinor, String reason) throws StripeException {
    RefundCreateParams.Builder builder = RefundCreateParams.builder()
            .setPaymentIntent(paymentIntentId);
    if (amountMinor != null) builder.setAmount(amountMinor);
    if (reason != null && !reason.isBlank()) {
        try {
            builder.setReason(RefundCreateParams.Reason.valueOf(reason.toUpperCase()));
        } catch (IllegalArgumentException ignored) {
            // Stripe reason enum is narrow — fall back to no reason on unknown values.
        }
    }
    return Refund.create(builder.build());
}
```

Imports: `com.stripe.model.Refund`, `com.stripe.param.RefundCreateParams`.

- [ ] **Step 3: SessionService.issueRefund**

```java
@Transactional
public RefundResponse issueRefund(UUID sessionId, Double amount, String reason) {
    ShoppingSession session = findSessionOrThrow(sessionId);
    if (session.getStripePaymentIntentId() == null) {
        throw new IllegalStateException("Session has no paid PaymentIntent");
    }

    Long amountMinor = amount != null
            ? BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP)
                    .movePointRight(2).longValueExact()
            : null;

    try {
        Refund refund = stripeService.refund(
                session.getStripePaymentIntentId(), amountMinor, reason);
        return new RefundResponse(
                sessionId,
                refund.getId(),
                BigDecimal.valueOf(refund.getAmount()).movePointLeft(2),
                refund.getCurrency().toUpperCase(),
                refund.getStatus());
    } catch (StripeException e) {
        throw new RuntimeException("Refund failed: " + e.getMessage(), e);
    }
}
```

- [ ] **Step 4: RefundController**

```java
package com.atlassync.session.payment;

import com.atlassync.session.dto.RefundRequest;
import com.atlassync.session.dto.RefundResponse;
import com.atlassync.session.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Admin-only refund endpoint. Gating to admin role is the gateway's job —
 * here we just trust the X-User-Role header forwarded by the gateway.
 * Bypasses the user-ownership check; admins refund on behalf of anyone.
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class RefundController {

    private final SessionService sessionService;

    @PostMapping("/{id}/refund")
    public ResponseEntity<RefundResponse> refund(
            @PathVariable UUID id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody @Valid RefundRequest request) {
        if (!"ROLE_ADMIN".equals(role) && !"ROLE_STAFF".equals(role)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(sessionService.issueRefund(id, request.amount(), request.reason()));
    }
}
```

- [ ] **Step 5: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/dto/RefundRequest.java \
        session-service/src/main/java/com/atlassync/session/dto/RefundResponse.java \
        session-service/src/main/java/com/atlassync/session/payment/RefundController.java \
        session-service/src/main/java/com/atlassync/session/payment/StripeService.java \
        session-service/src/main/java/com/atlassync/session/service/SessionService.java
git commit -m "expose admin refund endpoint"
```

### Task C4 — Mobile order detail — refund/dispute badges

**Files:**
- Modify: `atlassync-mobile/src/types/index.ts` — extend `SessionInfo.status` documentation (the type is `string` so no change to runtime; just add JSDoc listing new states)
- Modify: `atlassync-mobile/app/order/[id].tsx` — render badges

- [ ] **Step 1: Status badge component inline in order/[id].tsx**

Just below the trip-total header, add a badge that varies by status:

```tsx
function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
      <Text style={[styles.statusBadgeText, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const STATUS_CONFIG: Record<string, { label: string; fg: string; bg: string }> = {
  REFUNDED: { label: 'REFUNDED', fg: Colors.cream, bg: Colors.danger },
  PARTIAL_REFUND: { label: 'PARTIAL REFUND', fg: Colors.cream, bg: Colors.amber },
  DISPUTED: { label: 'DISPUTED', fg: Colors.cream, bg: Colors.amber },
  CHARGEBACK_LOST: { label: 'CHARGEBACK', fg: Colors.cream, bg: Colors.danger },
};
```

Add `<StatusBadge status={receipt.status} />` inline next to the trip total.

- [ ] **Step 2: Commit**

```bash
git add app/order/[id].tsx
git commit -m "show refund and dispute badges on receipt"
```

---

## Phase D — Stripe Tax

**Goal:** Stop hardcoding 8.75% in the mobile. Let Stripe compute the right Moroccan VAT (20% standard / 7% reduced for food staples) based on the customer location.

### Task D1 — Enable Stripe Tax on the dashboard (MANUAL)

- [ ] Open https://dashboard.stripe.com/test/settings/tax
- [ ] Click **Get started** under Stripe Tax
- [ ] Choose the **United States** OR keep test mode generic — for Morocco-only test, the default test mode works
- [ ] Save

This step is one-time per Stripe account. No code change.

### Task D2 — Pass automatic_tax to PaymentIntent

**Files:**
- Modify: `session-service/src/main/java/com/atlassync/session/payment/StripeService.java`

- [ ] **Step 1: Add `automatic_tax: enabled` to PaymentIntentCreateParams**

In the `createPaymentIntent` method, when building params:

```java
PaymentIntentCreateParams.Builder builder = PaymentIntentCreateParams.builder()
        .setAmount(amountMinor)
        .setCurrency(properties.currency())
        .setAutomaticPaymentMethods(
                PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build())
        .setAutomaticTax(  // <-- new
                PaymentIntentCreateParams.AutomaticTax.builder()
                        .setEnabled(true)
                        .build())
        .putMetadata("session_id", sessionId.toString())
        .setDescription("AtlasSync · session " + sessionId);
```

**Caveat:** Stripe Tax requires the Customer object to have a `shipping` or `address`. If the customer doesn't have one, the PaymentIntent will fail to compute tax. For the demo, set a default address on the customer at creation time (Task A3) or pass an address inline on the intent. Pick one:
- Default address on the customer (cleaner, reused across intents)
- Inline shipping/billing on the intent (per-checkout)

Update `StripeCustomerService.createAndPersist` to attach a default address:

```java
CustomerCreateParams params = CustomerCreateParams.builder()
        .setEmail(email)
        .setAddress(CustomerCreateParams.Address.builder()
                .setCountry("MA")  // Morocco
                .setCity("Casablanca")
                .build())
        .putMetadata("atlassync_user_id", userId.toString())
        .build();
```

(For production you'd capture this at checkout from the user; for the demo it's hardcoded.)

- [ ] **Step 2: Compile + commit**

```bash
mvn -pl session-service clean compile -DskipTests
git add session-service/src/main/java/com/atlassync/session/payment/StripeService.java \
        session-service/src/main/java/com/atlassync/session/payment/StripeCustomerService.java
git commit -m "enable stripe automatic tax"
```

### Task D3 — Mobile: remove hardcoded TAX_RATE

**Files:**
- Modify: `atlassync-mobile/app/shop/review.tsx`

- [ ] **Step 1: Replace the tax line**

Remove `const TAX_RATE = 0.0875;` and the `tax = subtotal * TAX_RATE;` calculation. Replace the totals block:

```tsx
const subtotal = cart?.total ?? 0;

// Tax is computed by Stripe Tax on the PaymentIntent — the PaymentSheet
// shows the final breakdown. Our local total is just the cart subtotal.
const displayTotal = subtotal;
```

Update the row that previously showed Tax:

```tsx
<View style={styles.totalsRow}>
  <Text style={styles.totalsLabel}>Tax</Text>
  <Text style={styles.totalsAmount}>Calculated at checkout</Text>
</View>
```

And change the YOU PAY line to use `displayTotal`:

```tsx
<Text style={styles.payAmount}>{formatPrice(displayTotal)}</Text>
```

- [ ] **Step 2: Commit**

```bash
git add app/shop/review.tsx
git commit -m "defer tax to stripe automatic tax"
```

---

## Phase E — Move secrets to Vault

**Goal:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` live in HashiCorp Vault (already running in `docker-compose.yml`), not in env vars. Spring Cloud Vault fetches them at startup.

### Task E1 — Add Spring Cloud Vault dependency

**Files:**
- Modify: `session-service/pom.xml`

- [ ] **Step 1: Add the dependency**

Inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-vault-config</artifactId>
</dependency>
```

`spring-cloud-dependencies` BOM should already be in the parent pom. If not, add it to `<dependencyManagement>`:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>2023.0.3</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

(Check what's already there first — the gateway pom uses `spring-cloud-starter-gateway` so a BOM is likely already in scope.)

- [ ] **Step 2: Compile**

```bash
mvn -pl session-service dependency:resolve -DskipTests
mvn -pl session-service clean compile -DskipTests
```

- [ ] **Step 3: Commit**

```bash
git add session-service/pom.xml
git commit -m "add spring cloud vault dependency"
```

### Task E2 — Configure Vault in bootstrap.yml

**Files:**
- Create: `session-service/src/main/resources/bootstrap.yml`

- [ ] **Step 1: Bootstrap file**

```yaml
spring:
  application:
    name: session-service
  config:
    import: vault://
  cloud:
    vault:
      uri: ${VAULT_ADDR:http://localhost:8200}
      token: ${VAULT_TOKEN:root}
      authentication: TOKEN
      kv:
        enabled: true
        backend: secret
        default-context: atlassync/stripe
        application-name: ''   # we only want the shared context, not service-scoped
      fail-fast: false   # tolerate Vault being down — fall back to env vars
```

(`fail-fast: false` is for dev convenience — if Vault is down at boot, Spring won't crash; the env var defaults in `application.yml` kick in.)

- [ ] **Step 2: Update application.yml**

The existing `atlassync.stripe.*` block stays the same — Vault will overlay the keys. But the env-var defaults are now the *fallback*, not the primary source:

```yaml
atlassync:
  stripe:
    api-key: ${STRIPE_SECRET_KEY:}        # fallback if Vault is empty
    webhook-secret: ${STRIPE_WEBHOOK_SECRET:}
    currency: ${STRIPE_CURRENCY:mad}
```

When Vault is populated, the values resolved from `secret/atlassync/stripe` will OVERRIDE these. Spring property resolution does this automatically.

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/resources/bootstrap.yml \
        session-service/src/main/resources/application.yml
git commit -m "wire vault for stripe secrets"
```

### Task E3 — Populate Vault and document the workflow

**Files:**
- (No code change — documentation in the plan / README)

- [ ] **Step 1: Put the secrets**

```bash
# Token is `root` for the dev Vault container
export VAULT_ADDR=http://localhost:8200
export VAULT_TOKEN=root

vault kv put secret/atlassync/stripe \
    atlassync.stripe.api-key='sk_test_...' \
    atlassync.stripe.webhook-secret='whsec_...'

vault kv get secret/atlassync/stripe
```

- [ ] **Step 2: Restart session-service**

Watch the startup logs for:
```
o.s.cloud.vault.client.VaultClient : Successfully retrieved secrets from secret/atlassync/stripe
```

Then your `[stripe]` init log should show the key prefix from the Vault-loaded value.

- [ ] **Step 3: Update the developer README**

Add a one-line doc in `atlassync-backend/README.md` (or wherever your dev runbook lives) pointing at the `vault kv put` command above.

```bash
git add atlassync-backend/README.md
git commit -m "document vault stripe setup"
```

---

## Phase F — Verification

Full end-to-end runbook covering every new feature. Manual; no commits.

### Task F1 — Stripe Customer flow

- [ ] Wipe `payment_customers` table: `DELETE FROM payment_customers;`
- [ ] Sign in as a test user, scan an item, pay with `4242 4242 4242 4242`
- [ ] In Stripe Dashboard → Customers, confirm a new Customer was created with the user's email
- [ ] Check `payment_customers` table — one row with the `cus_…` id

### Task F2 — Saved payment method on second checkout

- [ ] Complete the first purchase
- [ ] Start a new shopping session, scan items, hit Pay
- [ ] In the PaymentSheet, you should see the previously-used card listed as a saved option (no need to re-enter the number)

### Task F3 — Idempotency + intent reuse

- [ ] Start a session, add items, tap Pay → PaymentSheet opens
- [ ] Dismiss the sheet (user cancels)
- [ ] Tap Pay again — Stripe Dashboard should show **the same PaymentIntent** is re-used (don't create a new one)
- [ ] Confirm via `SELECT stripe_payment_intent_id FROM shopping_sessions WHERE id = '…'` — same id

### Task F4 — Reject re-pay on COMPLETED session

- [ ] Complete a purchase. Note the session id from logs.
- [ ] `curl -X POST http://localhost:8080/api/sessions/<id>/pay/intent` with appropriate auth headers
- [ ] Expect 5xx response with "terminal status COMPLETED" message in logs

### Task F5 — Refund webhook + admin endpoint

- [ ] Complete a purchase
- [ ] In Stripe Dashboard, find the charge → Refund it (full refund)
- [ ] Watch Stripe CLI: `charge.refunded → 200 OK`
- [ ] Watch session-service logs: `session=<uuid> marked REFUNDED`
- [ ] On mobile, open the Order Detail for that trip — the REFUNDED badge should render
- [ ] Try a partial refund via `POST /api/sessions/<id>/refund` body `{"amount": 5.00, "reason": "requested_by_customer"}` with an admin/staff X-User-Role header
- [ ] Confirm session status → PARTIAL_REFUND

### Task F6 — Dispute flow

- [ ] Complete a purchase using the test card `4000 0000 0000 0259` (this card triggers an "inquiry" on Stripe Test Mode)
- [ ] Wait a few seconds for Stripe to fire `charge.dispute.created`
- [ ] Watch logs: `session=<uuid> entered DISPUTED state`
- [ ] In Stripe dashboard → Disputes, accept the dispute (lose it)
- [ ] Confirm `session=<uuid> dispute resolved → CHARGEBACK_LOST`

### Task F7 — Stripe Tax

- [ ] Add an item priced 100 MAD
- [ ] Tap Pay
- [ ] In the PaymentSheet, expand the breakdown — Stripe should show the Moroccan VAT (20%) as a separate line item
- [ ] Final charged amount on Stripe Dashboard reflects the inclusive tax

### Task F8 — Vault secret rotation

- [ ] With session-service running: `vault kv put secret/atlassync/stripe atlassync.stripe.api-key='sk_test_rotated_value'`
- [ ] Restart session-service
- [ ] Startup log shows the new key prefix
- [ ] Run a payment — should still work (test mode keys are interchangeable within the same Stripe account)

---

## Out of Scope (filed as follow-up issues, not in this plan)

- **Live mode activation** — Stripe makes you fill in business details + banking info before you can charge real money. Manual one-time setup on the Stripe Dashboard; the code is identical.
- **Real Apple Pay merchant identifier** — requires registering a merchant ID on Apple Developer Portal + configuring it in Stripe Dashboard, then updating `StripeProvider`'s `merchantIdentifier` in `app/_layout.tsx`.
- **Stripe Receipt Emails** — one toggle on Stripe Dashboard: `Settings → Customer emails → Successful payments`. Stripe sends branded receipts automatically. No code change.
- **Customer-facing refund request flow** — currently only admins can refund. A "request a refund" button on the receipt screen → email to support → admin processes manually. Future scope.
- **Stripe Radar custom rules** — default Radar rules are sane; tune custom rules once you see real attack patterns in production.
- **Production webhook endpoint** — register your deployed prod URL on Stripe Dashboard → Developers → Webhooks. Use a separate `whsec_…` per environment.
- **Auth-service knowledge of Stripe** — kept session-service-only on purpose. If we ever need stripe data in the JWT, that's a future change.
