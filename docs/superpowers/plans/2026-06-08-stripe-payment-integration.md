# Stripe Payment Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fake "Pay & walk out" flow with a real Stripe-backed checkout using Stripe Test Mode, server-authoritative PaymentIntent creation, webhook-driven session completion, and the Stripe React Native PaymentSheet on the mobile.

**Architecture:** Three-leg flow. (1) Mobile asks the server to create a PaymentIntent; server computes the amount from the cart snapshot and returns the `client_secret`. (2) Mobile uses Stripe's PaymentSheet to collect a card (or Apple Pay / Google Pay) and confirm against Stripe directly — raw card details never touch our servers. (3) Stripe POSTs a `payment_intent.succeeded` webhook back to session-service; the webhook handler is the *source of truth* that marks the session COMPLETED and generates the exit QR. Mobile polls `GET /sessions/{id}` until it sees `status=COMPLETED` and an `exitQr` on the response, then navigates to walkout. Old `/api/sessions/{id}/pay` endpoint stays in place for now as a deprecated fallback; remove in a follow-up.

**Tech Stack:**
- Backend: Spring Boot 3.x + `stripe-java` 26.x in session-service
- Mobile: Expo + `@stripe/stripe-react-native`
- Stripe Test Mode for the MVP (no business approval needed)
- Stripe CLI for local webhook forwarding during dev

**Commit style (per repo conventions):**
- Each task ends with a granular commit
- Messages: lowercase, 1–9 words, no co-authored-by lines

**Branch:** Both repos are currently on `feat/personal-details`. Create a new branch `feat/stripe-payments` off that for this work.

---

## Pre-Flight

Before starting, get test API keys from Stripe.

- [ ] **Step 0a: Create a Stripe account in Test Mode**

Go to https://dashboard.stripe.com/register. Skip business activation — Test Mode works without it. Confirm the dashboard shows the orange "Test mode" toggle in the top-right.

- [ ] **Step 0b: Grab three values from the dashboard**

From https://dashboard.stripe.com/test/apikeys:
- Publishable key (`pk_test_...`)
- Secret key (`sk_test_...`)

Webhook signing secret comes later from `stripe listen` (Step 7).

- [ ] **Step 0c: Install Stripe CLI**

```bash
# macOS:
brew install stripe/stripe-cli/stripe
# Linux:
# Follow https://docs.stripe.com/stripe-cli#install

stripe --version
# Expected: stripe version 1.x.x
```

- [ ] **Step 0d: Create feature branch in both repos**

```bash
cd ~/Projects/Learning/Atlassync/atlassync-backend
git checkout -b feat/stripe-payments

cd ~/Projects/Learning/Atlassync/atlassync-mobile
git checkout -b feat/stripe-payments
```

---

## File Structure

**Backend (session-service):**

Files to create:
- `session-service/src/main/java/com/atlassync/session/payment/StripeProperties.java` — `@ConfigurationProperties` for Stripe keys
- `session-service/src/main/java/com/atlassync/session/payment/StripeService.java` — wraps the Stripe SDK; creates and retrieves PaymentIntents, verifies webhook signatures
- `session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java` — `POST /api/sessions/webhooks/stripe`
- `session-service/src/main/java/com/atlassync/session/dto/PaymentIntentResponse.java` — DTO returned by `/pay/intent`

Files to modify:
- `session-service/pom.xml` — add `stripe-java` dependency
- `session-service/src/main/resources/application.yml` — add `atlassync.stripe.*` properties
- `session-service/src/main/java/com/atlassync/session/service/SessionService.java` — add `createPaymentIntent` and `markPaidFromWebhook` methods
- `session-service/src/main/java/com/atlassync/session/controller/SessionController.java` — add `POST /{id}/pay/intent`
- `session-service/src/main/java/com/atlassync/session/dto/SessionResponse.java` — add optional `exitQr` field so polling mobile sees the QR once status is COMPLETED
- `session-service/src/main/java/com/atlassync/session/service/SessionService.java#toSessionResponse` — populate `exitQr` when COMPLETED
- `gateway/src/main/java/com/atlassync/gateway/filter/JwtAuthenticationFilter.java` — open `/api/sessions/webhooks/`

**Mobile:**

Files to create: none (orchestration goes into existing files)

Files to modify:
- `package.json` — add `@stripe/stripe-react-native`
- `app/_layout.tsx` — wrap with `<StripeProvider>`
- `src/constants/api.ts` — new endpoint `sessions.payIntent`
- `src/api/sessions.ts` — `sessionsApi.createPaymentIntent`
- `src/types/index.ts` — `PaymentIntentResponse` and extend `SessionResponse` with optional `exitQr`
- `src/lib/waitForSessionStatus.ts` (new) — polling helper
- `app/shop/review.tsx` — replace `pay()` with PaymentSheet flow

---

## Task 1: Backend — add stripe-java dependency

**Files:**
- Modify: `atlassync-backend/session-service/pom.xml`

- [ ] **Step 1: Read current dependencies block**

```bash
cd ~/Projects/Learning/Atlassync/atlassync-backend
grep -n "<dependencies>" session-service/pom.xml | head -3
```

- [ ] **Step 2: Add stripe-java inside `<dependencies>`**

Add this entry just after the last `<dependency>` block inside `<dependencies>`:

```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>26.13.0</version>
</dependency>
```

- [ ] **Step 3: Resolve dependency**

```bash
cd ~/Projects/Learning/Atlassync/atlassync-backend
mvn -pl session-service dependency:resolve -DskipTests
```

Expected: BUILD SUCCESS, no missing-dependency errors.

- [ ] **Step 4: Compile to verify nothing broke**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add session-service/pom.xml
git commit -m "add stripe-java dependency"
```

---

## Task 2: Backend — Stripe properties

**Files:**
- Create: `atlassync-backend/session-service/src/main/java/com/atlassync/session/payment/StripeProperties.java`
- Modify: `atlassync-backend/session-service/src/main/resources/application.yml`
- Modify: `atlassync-backend/session-service/src/main/java/com/atlassync/session/SessionServiceApplication.java` — enable `@ConfigurationPropertiesScan` if not already

- [ ] **Step 1: Create StripeProperties**

```java
// session-service/src/main/java/com/atlassync/session/payment/StripeProperties.java
package com.atlassync.session.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Stripe Test Mode configuration. All three values are env-var driven so we
 * never commit real keys. {@code apiKey} is the server secret key
 * (sk_test_...), used to authenticate outbound Stripe API calls.
 * {@code webhookSecret} (whsec_...) signs incoming webhook payloads — we
 * verify it on every webhook request to be sure the call actually came from
 * Stripe and not an attacker. {@code currency} stays MAD for the Morocco
 * demo.
 */
@ConfigurationProperties(prefix = "atlassync.stripe")
public record StripeProperties(
        String apiKey,
        String webhookSecret,
        String currency
) {
    public StripeProperties {
        if (currency == null || currency.isBlank()) currency = "mad";
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
```

- [ ] **Step 2: Add Stripe block to application.yml**

Append to `session-service/src/main/resources/application.yml`:

```yaml
atlassync:
  stripe:
    api-key: ${STRIPE_SECRET_KEY:}
    webhook-secret: ${STRIPE_WEBHOOK_SECRET:}
    currency: ${STRIPE_CURRENCY:mad}
```

- [ ] **Step 3: Make sure ConfigurationProperties are scanned**

Read `session-service/src/main/java/com/atlassync/session/SessionServiceApplication.java`. If it does NOT have `@ConfigurationPropertiesScan`, add it:

```java
@SpringBootApplication
@ConfigurationPropertiesScan(basePackages = "com.atlassync.session")
public class SessionServiceApplication { ... }
```

Add the import:
```java
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
```

- [ ] **Step 4: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 5: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/payment/StripeProperties.java \
        session-service/src/main/resources/application.yml \
        session-service/src/main/java/com/atlassync/session/SessionServiceApplication.java
git commit -m "wire stripe properties from env"
```

---

## Task 3: Backend — StripeService

**Files:**
- Create: `atlassync-backend/session-service/src/main/java/com/atlassync/session/payment/StripeService.java`

- [ ] **Step 1: Create StripeService**

```java
// session-service/src/main/java/com/atlassync/session/payment/StripeService.java
package com.atlassync.session.payment;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;

/**
 * Thin wrapper around the Stripe SDK. All outbound calls flow through here so
 * tests and the rest of the codebase don't depend directly on {@code Stripe.*}
 * static state. Stripe's Java SDK is built around a process-wide
 * {@code Stripe.apiKey}, so we set it once at startup from
 * {@link StripeProperties}.
 *
 * <p>Two responsibilities:
 * <ul>
 *   <li>{@link #createPaymentIntent} — server-authoritative amount, returns
 *       the {@code client_secret} the mobile uses to confirm against
 *       Stripe directly.</li>
 *   <li>{@link #constructEvent} — verifies the signature on an inbound
 *       webhook payload so we can trust the event's source.</li>
 * </ul>
 */
@Service
@Slf4j
public class StripeService {

    private final StripeProperties properties;

    public StripeService(StripeProperties properties) {
        this.properties = properties;
    }

    @PostConstruct
    void init() {
        if (!properties.isConfigured()) {
            log.warn("[stripe] no API key configured — payment intents will fail");
            return;
        }
        Stripe.apiKey = properties.apiKey();
        log.info("[stripe] initialised with key prefix={}", properties.apiKey().substring(0, 8));
    }

    /**
     * Creates a PaymentIntent for the given session. Amount is in the smallest
     * currency unit (centimes for MAD). The {@code session_id} is stamped on
     * {@code metadata} so the webhook can route the event back to the right
     * session without trusting the client.
     */
    public PaymentIntent createPaymentIntent(UUID sessionId, BigDecimal amount) throws StripeException {
        long amountMinor = amount.setScale(2, RoundingMode.HALF_UP)
                .movePointRight(2)
                .longValueExact();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountMinor)
                .setCurrency(properties.currency())
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build())
                .putMetadata("session_id", sessionId.toString())
                .setDescription("AtlasSync · session " + sessionId)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        log.info("[stripe] paymentIntent created session={} amount={} {} id={}",
                sessionId, amountMinor, properties.currency(), intent.getId());
        return intent;
    }

    /**
     * Verifies the {@code Stripe-Signature} header against the configured
     * webhook secret. Throws if the signature is missing or wrong — DO NOT
     * fall back to trusting unsigned events.
     */
    public Event constructEvent(String payload, String sigHeader) throws SignatureVerificationException {
        if (properties.webhookSecret() == null || properties.webhookSecret().isBlank()) {
            throw new IllegalStateException("Stripe webhook secret not configured");
        }
        return Webhook.constructEvent(payload, sigHeader, properties.webhookSecret());
    }
}
```

- [ ] **Step 2: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/payment/StripeService.java
git commit -m "create stripe service for payment intents"
```

---

## Task 4: Backend — PaymentIntentResponse DTO

**Files:**
- Create: `atlassync-backend/session-service/src/main/java/com/atlassync/session/dto/PaymentIntentResponse.java`

- [ ] **Step 1: Create the DTO**

```java
// session-service/src/main/java/com/atlassync/session/dto/PaymentIntentResponse.java
package com.atlassync.session.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Returned from {@code POST /api/sessions/{id}/pay/intent}. The mobile uses
 * {@code clientSecret} to confirm the payment against Stripe directly via
 * the Stripe React Native SDK — raw card details never touch our servers.
 * {@code amount} and {@code currency} are echoed back so the mobile can
 * sanity-check what it's about to charge.
 */
public record PaymentIntentResponse(
        UUID sessionId,
        String paymentIntentId,
        String clientSecret,
        BigDecimal amount,
        String currency
) {}
```

- [ ] **Step 2: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/dto/PaymentIntentResponse.java
git commit -m "add payment intent response dto"
```

---

## Task 5: Backend — extend SessionResponse with exitQr

**Files:**
- Modify: `atlassync-backend/session-service/src/main/java/com/atlassync/session/dto/SessionResponse.java`
- Modify: `atlassync-backend/session-service/src/main/java/com/atlassync/session/service/SessionService.java` — populate `exitQr` in `toSessionResponse` when status is COMPLETED

- [ ] **Step 1: Update SessionResponse**

```java
// session-service/src/main/java/com/atlassync/session/dto/SessionResponse.java
package com.atlassync.session.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Session state surfaced to the mobile. {@code exitQr} is populated only
 * once the session is COMPLETED — the mobile polls this endpoint after
 * Stripe confirms payment and uses {@code exitQr} to render the walkout
 * gate pass.
 */
public record SessionResponse(
        UUID sessionId,
        Long userId,
        String status,
        Instant createdAt,
        QrData exitQr
) {}
```

- [ ] **Step 2: Populate exitQr in SessionService.toSessionResponse**

Find the `toSessionResponse(ShoppingSession session)` method and update it. The existing version returns a 4-field constructor — change it to include `exitQr` which is the EXIT QR token if one exists.

```java
// session-service/src/main/java/com/atlassync/session/service/SessionService.java
// Replace the existing toSessionResponse method body with:
private SessionResponse toSessionResponse(ShoppingSession session) {
    QrData exitQr = null;
    if (session.getStatus() == SessionStatus.COMPLETED) {
        exitQr = qrTokenRepository
                .findFirstBySessionIdAndTokenTypeOrderByCreatedAtDesc(
                        session.getId(), QrTokenType.EXIT)
                .map(token -> new QrData(
                        token.getCorrelationId(),
                        token.getPayload(),
                        token.getVaultSignature(),
                        token.getExpiresAt()))
                .orElse(null);
    }
    return new SessionResponse(
            session.getId(),
            session.getUserId(),
            session.getStatus().name(),
            session.getCreatedAt(),
            exitQr);
}
```

If `qrTokenRepository` doesn't already have `findFirstBySessionIdAndTokenTypeOrderByCreatedAtDesc`, add it:

```java
// session-service/src/main/java/com/atlassync/session/repository/QrTokenRepository.java
// Add this method declaration:
Optional<QrToken> findFirstBySessionIdAndTokenTypeOrderByCreatedAtDesc(
        UUID sessionId, QrTokenType tokenType);
```

(Check first whether an equivalent method already exists; if so use it. Otherwise add and re-compile.)

- [ ] **Step 3: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS. If you get errors about missing repo method, add the one shown above.

- [ ] **Step 4: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/dto/SessionResponse.java \
        session-service/src/main/java/com/atlassync/session/service/SessionService.java \
        session-service/src/main/java/com/atlassync/session/repository/QrTokenRepository.java
git commit -m "surface exit qr on session response"
```

---

## Task 6: Backend — createPaymentIntent and markPaidFromWebhook on SessionService

**Files:**
- Modify: `atlassync-backend/session-service/src/main/java/com/atlassync/session/service/SessionService.java`

- [ ] **Step 1: Inject StripeService into SessionService**

Add to the constructor and field list:

```java
private final StripeService stripeService;
private final CartSnapshotClient cartSnapshotClient; // assumed already present
```

(The constructor will need to accept and assign `StripeService stripeService` — match Lombok `@RequiredArgsConstructor` style if used, otherwise add it manually.)

- [ ] **Step 2: Add createPaymentIntent**

Add this new method to `SessionService`:

```java
/**
 * Creates a Stripe PaymentIntent for the session's current cart total.
 * Transitions the session into PAYING. The mobile confirms the intent
 * directly against Stripe; we wait for the webhook to mark the session
 * COMPLETED.
 *
 * <p>Amount is computed server-side from the live cart — never from the
 * client — so a tampered client can't pay 1 MAD for 200 MAD of stuff.
 */
@Transactional
public PaymentIntentResponse createPaymentIntent(UUID sessionId, Long userId) {
    ShoppingSession session = findSessionOrThrow(sessionId);
    verifyOwnership(session, userId);

    // CartSnapshotClient.fetch returns a CartSnapshot record with a
    // `total` (BigDecimal) field — use that directly.
    BigDecimal amount = cartSnapshotClient.fetch(sessionId).total();
    if (amount == null || amount.signum() <= 0) {
        throw new IllegalStateException(
                "Refusing to create payment intent for empty cart");
    }

    SessionStatus fromState = session.getStatus();
    if (fromState != SessionStatus.PAYING) {
        session.transitionTo(SessionStatus.PAYING);
        sessionRepository.save(session);
        recordTransition(session, fromState, SessionStatus.PAYING,
                "user:" + userId, null);
    }

    try {
        PaymentIntent intent = stripeService.createPaymentIntent(sessionId, amount);
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

Add these imports at the top of SessionService:
```java
import com.atlassync.session.dto.PaymentIntentResponse;
import com.atlassync.session.payment.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import java.math.BigDecimal;
```

`CartSnapshotClient.fetch(sessionId)` already returns a `CartSnapshot` record with a `total` field — no need to add a new method. If the cart-service is unreachable, `fetch` returns an empty snapshot with `BigDecimal.ZERO`, which the `signum() <= 0` guard catches and rejects cleanly.

- [ ] **Step 3: Add markPaidFromWebhook**

```java
/**
 * Mark a session COMPLETED from the Stripe webhook. Idempotent — re-delivery
 * is a noop. Snapshots the cart, generates the exit QR, publishes the
 * session-paid / session-completed events.
 *
 * <p>This is the source of truth for "payment cleared". Do NOT trust the
 * mobile to mark sessions paid — anyone can fake an HTTP call. The webhook
 * is signature-verified by {@link StripeService#constructEvent}.
 */
@Transactional
public void markPaidFromWebhook(UUID sessionId) {
    ShoppingSession session = sessionRepository.findById(sessionId)
            .orElseThrow(() -> new IllegalStateException(
                    "Session not found: " + sessionId));

    if (session.getStatus() == SessionStatus.COMPLETED) {
        log.info("[stripe-webhook] session={} already COMPLETED, skipping",
                sessionId);
        return;
    }

    SessionStatus fromState = session.getStatus();
    session.transitionTo(SessionStatus.COMPLETED);
    session.setCompletedAt(Instant.now());
    snapshotCartIntoSession(session);
    sessionRepository.save(session);

    recordTransition(session, fromState, SessionStatus.COMPLETED,
            "stripe-webhook", null);

    generateQr(session, QrTokenType.EXIT);

    eventProducer.publishSessionPaid(session.getId(), session.getUserId());
    eventProducer.publishSessionCompleted(session.getId());

    log.info("[stripe-webhook] session={} marked COMPLETED, exit QR generated",
            sessionId);
}
```

- [ ] **Step 4: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS. Fix any missing imports or signature mismatches.

- [ ] **Step 5: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/service/SessionService.java \
        session-service/src/main/java/com/atlassync/session/integration/CartSnapshotClient.java
git commit -m "add payment intent and webhook completion"
```

---

## Task 7: Backend — `/pay/intent` controller endpoint

**Files:**
- Modify: `atlassync-backend/session-service/src/main/java/com/atlassync/session/controller/SessionController.java`

- [ ] **Step 1: Add the endpoint**

In `SessionController`, just above the existing `@PostMapping("/{id}/pay")`, add:

```java
@PostMapping("/{id}/pay/intent")
public ResponseEntity<PaymentIntentResponse> createPaymentIntent(
        @PathVariable UUID id,
        @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
        @RequestParam(value = "userId", required = false) Long paramUserId) {

    Long userId = headerUserId != null ? headerUserId : paramUserId;
    if (userId == null) {
        throw new IllegalArgumentException(
                "userId is required via X-User-Id header or userId param");
    }
    PaymentIntentResponse response = sessionService.createPaymentIntent(id, userId);
    return ResponseEntity.ok(response);
}
```

Add the import:
```java
import com.atlassync.session.dto.PaymentIntentResponse;
```

- [ ] **Step 2: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/controller/SessionController.java
git commit -m "expose pay intent endpoint"
```

---

## Task 8: Backend — Stripe webhook controller

**Files:**
- Create: `atlassync-backend/session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java`

- [ ] **Step 1: Create the controller**

```java
// session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java
package com.atlassync.session.payment;

import com.atlassync.session.service.SessionService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Receives signed events from Stripe and routes them into the session
 * lifecycle. This endpoint is open at the gateway (no JWT) — Stripe doesn't
 * carry our bearer token. Trust comes from the {@code Stripe-Signature}
 * header, verified against {@code atlassync.stripe.webhook-secret}.
 *
 * <p>For local dev: run {@code stripe listen --forward-to
 * localhost:8080/api/sessions/webhooks/stripe} and feed the printed
 * {@code whsec_...} secret into the env var. In production this is a real
 * webhook endpoint configured on the Stripe dashboard.
 *
 * <p>We only act on {@code payment_intent.succeeded}. Other events
 * (created, processing, canceled, etc.) get logged and acknowledged but
 * don't drive state — we don't need them yet.
 */
@RestController
@RequestMapping("/api/sessions/webhooks")
@Slf4j
public class StripeWebhookController {

    private final StripeService stripeService;
    private final SessionService sessionService;

    public StripeWebhookController(StripeService stripeService, SessionService sessionService) {
        this.stripeService = stripeService;
        this.sessionService = sessionService;
    }

    @PostMapping("/stripe")
    public ResponseEntity<String> handle(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String signature) {

        Event event;
        try {
            event = stripeService.constructEvent(payload, signature);
        } catch (SignatureVerificationException e) {
            log.warn("[stripe-webhook] bad signature: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("invalid signature");
        }

        log.info("[stripe-webhook] received type={} id={}", event.getType(), event.getId());

        if ("payment_intent.succeeded".equals(event.getType())) {
            EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
            StripeObject obj = deserializer.getObject().orElse(null);
            if (!(obj instanceof PaymentIntent intent)) {
                log.warn("[stripe-webhook] payment_intent.succeeded with no intent payload");
                return ResponseEntity.ok("ignored");
            }
            String sessionIdStr = intent.getMetadata() != null
                    ? intent.getMetadata().get("session_id")
                    : null;
            if (sessionIdStr == null || sessionIdStr.isBlank()) {
                log.warn("[stripe-webhook] paymentIntent={} missing session_id metadata",
                        intent.getId());
                return ResponseEntity.ok("missing metadata");
            }
            try {
                UUID sessionId = UUID.fromString(sessionIdStr);
                sessionService.markPaidFromWebhook(sessionId);
            } catch (Exception e) {
                log.error("[stripe-webhook] failed to complete session={}", sessionIdStr, e);
                // Return 500 so Stripe retries — webhook re-delivery is fine,
                // markPaidFromWebhook is idempotent.
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("retry");
            }
        }

        return ResponseEntity.ok("ok");
    }
}
```

- [ ] **Step 2: Compile**

```bash
mvn -pl session-service clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add session-service/src/main/java/com/atlassync/session/payment/StripeWebhookController.java
git commit -m "add stripe webhook controller"
```

---

## Task 9: Gateway — open webhook path

**Files:**
- Modify: `atlassync-backend/gateway/src/main/java/com/atlassync/gateway/filter/JwtAuthenticationFilter.java`

- [ ] **Step 1: Add path to OPEN_PATHS**

Find the `OPEN_PATHS` list and add `/api/sessions/webhooks/`:

```java
private static final List<String> OPEN_PATHS = List.of(
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/auth/otp/",
        "/api/auth/password/reset/",
        "/api/sessions/webhooks/",
        "/actuator/",
        "/ws/"
);
```

- [ ] **Step 2: Compile**

```bash
mvn -pl gateway clean compile -DskipTests
```

Expected: BUILD SUCCESS.

- [ ] **Step 3: Commit**

```bash
git add gateway/src/main/java/com/atlassync/gateway/filter/JwtAuthenticationFilter.java
git commit -m "open gateway path for stripe webhooks"
```

---

## Task 10: Mobile — install Stripe React Native SDK

**Files:**
- Modify: `atlassync-mobile/package.json` (via expo install)

- [ ] **Step 1: Install via expo so the version matches the SDK**

```bash
cd ~/Projects/Learning/Atlassync/atlassync-mobile
npx expo install @stripe/stripe-react-native
```

Expected: package added to `package.json` with the correct Expo-compatible version.

- [ ] **Step 2: Verify it landed**

```bash
grep "@stripe/stripe-react-native" package.json
```

Expected: a version line like `"@stripe/stripe-react-native": "~0.45.0"` (exact version may vary).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "install stripe react native sdk"
```

---

## Task 11: Mobile — wrap root with StripeProvider

**Files:**
- Modify: `atlassync-mobile/app/_layout.tsx`

- [ ] **Step 1: Wrap the app with `<StripeProvider>`**

In `app/_layout.tsx`, add the import:

```tsx
import { StripeProvider } from '@stripe/stripe-react-native';
```

Then wrap the existing provider chain. Replace the return block with:

```tsx
return (
  <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}
        merchantIdentifier="merchant.com.atlassync.demo"
      >
        <AuthProvider>
          <SessionProvider>
            <StatusBar style="dark" />
            <View style={{ flex: 1, backgroundColor: Colors.background }}>
              <Slot />
            </View>
          </SessionProvider>
        </AuthProvider>
      </StripeProvider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
```

- [ ] **Step 2: Set the publishable key locally**

Create or update `atlassync-mobile/.env.local` (which `.gitignore` already covers under `.env*.local`):

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_KEY
```

Verify it's gitignored:
```bash
cd ~/Projects/Learning/Atlassync/atlassync-mobile
git status --short .env.local
```
Expected: empty output (file is ignored).

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "wrap root with stripe provider"
```

---

## Task 12: Mobile — types + endpoint + API client

**Files:**
- Modify: `atlassync-mobile/src/types/index.ts`
- Modify: `atlassync-mobile/src/constants/api.ts`
- Modify: `atlassync-mobile/src/api/sessions.ts`

- [ ] **Step 1: Add PaymentIntentResponse type and extend SessionResponse**

In `src/types/index.ts`, add:

```ts
/** Returned by POST /sessions/{id}/pay/intent. */
export interface PaymentIntentResponse {
  sessionId: string;
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}
```

Find the `SessionResponse` interface (or wherever the polled session shape is declared on the mobile) and add an optional `exitQr` field matching the backend's `QrData` shape:

```ts
export interface SessionResponse {
  sessionId: string;
  userId: number;
  status: string;
  createdAt: string;
  exitQr?: QrData | null;
}
```

(If `QrData` isn't imported here yet, import it from wherever it's defined or inline the fields: `correlationId, payload, signature, expiresAt`.)

- [ ] **Step 2: Add endpoint constant**

In `src/constants/api.ts`, find the `sessions` block under `Endpoints` and add:

```ts
sessions: {
  start: '/api/sessions/start',
  get: (id: string) => `/api/sessions/${id}`,
  pay: (id: string) => `/api/sessions/${id}/pay`,
  payIntent: (id: string) => `/api/sessions/${id}/pay/intent`,
  cancel: (id: string) => `/api/sessions/${id}/cancel`,
  receipt: (id: string) => `/api/sessions/${id}/receipt`,
  history: '/api/sessions/history',
},
```

- [ ] **Step 3: Add the API method**

In `src/api/sessions.ts`, import `PaymentIntentResponse` and add a new method on `sessionsApi`:

```ts
import type { PaymentIntentResponse } from '../types';

// ...inside the sessionsApi object:
createPaymentIntent(sessionId: string): Promise<PaymentIntentResponse> {
  return api
    .post<PaymentIntentResponse>(Endpoints.sessions.payIntent(sessionId))
    .then((r) => r.data);
},
```

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/constants/api.ts src/api/sessions.ts
git commit -m "add payment intent api method"
```

---

## Task 13: Mobile — session-status polling helper

**Files:**
- Create: `atlassync-mobile/src/lib/waitForSessionStatus.ts`

- [ ] **Step 1: Create the helper**

```ts
// atlassync-mobile/src/lib/waitForSessionStatus.ts
import { api } from '../api';
import { Endpoints } from '../constants/api';
import type { SessionResponse } from '../types';

/**
 * Polls {@code GET /sessions/{id}} until the session reaches the desired
 * status — used after Stripe PaymentSheet confirms, while we wait for
 * the webhook to mark the session COMPLETED. Webhook delivery from Stripe
 * is usually sub-second but can take a few seconds in dev.
 *
 * Returns the final session payload (which carries {@code exitQr} on
 * COMPLETED). Throws if the timeout elapses or the session lands in a
 * terminal non-target status (e.g. CANCELLED).
 */
export async function waitForSessionStatus(
  sessionId: string,
  targetStatus: string,
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<SessionResponse> {
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const intervalMs = opts.intervalMs ?? 1_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const res = await api.get<SessionResponse>(Endpoints.sessions.get(sessionId));
    const status = res.data.status;
    if (status === targetStatus) return res.data;
    if (status === 'CANCELLED') {
      throw new Error('Session was cancelled while waiting for payment.');
    }
    await sleep(intervalMs);
  }
  throw new Error(
    `Timed out waiting for session ${sessionId} to reach ${targetStatus}.`,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/waitForSessionStatus.ts
git commit -m "poll session status helper"
```

---

## Task 14: Mobile — wire Stripe PaymentSheet into review screen

**Files:**
- Modify: `atlassync-mobile/app/shop/review.tsx`

- [ ] **Step 1: Replace `handlePay` with the Stripe flow**

In `app/shop/review.tsx`, update the imports — add:

```tsx
import { useStripe } from '@stripe/stripe-react-native';
import { sessionsApi } from '../../src/api';
import { waitForSessionStatus } from '../../src/lib/waitForSessionStatus';
```

Inside the component, after the existing hooks, add:

```tsx
const { initPaymentSheet, presentPaymentSheet } = useStripe();
```

Find the existing `handlePay` function and replace its body with:

```tsx
const handlePay = async () => {
  if (!sessionId || paying) return;
  setError(null);
  setPaying(true);
  try {
    // 1. Server creates the PaymentIntent (server-authoritative amount).
    const intent = await sessionsApi.createPaymentIntent(sessionId);

    // 2. Hand the client_secret to Stripe SDK and present the sheet.
    const init = await initPaymentSheet({
      paymentIntentClientSecret: intent.clientSecret,
      merchantDisplayName: 'AtlasSync',
      // returnURL is required for some redirect-flow payment methods
      // (3DS, iDEAL, etc.). Use the Expo scheme so iOS comes back to the app.
      returnURL: 'atlassync://stripe-redirect',
      defaultBillingDetails: { name: user?.username },
    });
    if (init.error) throw new Error(init.error.message);

    const present = await presentPaymentSheet();
    if (present.error) {
      // Canceled = user dismissed the sheet — don't surface as an error.
      if (present.error.code === 'Canceled') {
        setPaying(false);
        return;
      }
      throw new Error(present.error.message);
    }

    // 3. Wait for the webhook to mark the session COMPLETED.
    await waitForSessionStatus(sessionId, 'COMPLETED');

    // 4. Walkout. SessionContext will pick up the exitQr from refreshCart's
    //    next pull, or you can route via /shop/walkout directly.
    router.replace('/shop/walkout');
  } catch (e: unknown) {
    setError(
      e instanceof Error && e.message
        ? e.message
        : 'Payment failed. Try again.',
    );
  } finally {
    setPaying(false);
  }
};
```

If `user` isn't already destructured from `useAuth()` in this file, add:

```tsx
import { useAuth } from '../../src/context/AuthContext';
// ...
const { user } = useAuth();
```

- [ ] **Step 2: Expose `applyCompletedSession` on SessionContext**

Open `src/context/SessionContext.tsx`. SessionContext already holds `setExitQr` internally but doesn't expose a setter. Add a new method that takes the polled session and pushes the `exitQr` into context state. Edit `SessionContextValue` to include it, mark the existing `pay` deprecated, and implement the new method.

Add to the `SessionContextValue` interface:

```ts
/** @deprecated Use the Stripe flow in review.tsx — this hits the fake
 *  /pay endpoint that bypasses the payment processor. */
pay: (paymentMethodId?: string) => Promise<QrData>;
/** Populates exitQr from a completed-session payload, so the walkout
 *  screen has the QR ready when it renders. Called by review.tsx after
 *  waitForSessionStatus returns COMPLETED. */
applyCompletedSession: (session: SessionResponse) => void;
```

Add the import for `SessionResponse` at the top:

```ts
import type { CartSnapshot, QrData, SessionResponse, StartSessionResponse } from '../types';
```

Inside the `SessionProvider`, after the existing `pay` callback, add:

```ts
const applyCompletedSession = useCallback((session: SessionResponse) => {
  if (session.exitQr) setExitQr(session.exitQr);
}, []);
```

And include `applyCompletedSession` in the provider's `value` object alongside `pay`:

```tsx
<SessionContext.Provider
  value={{
    sessionId,
    entryQr,
    exitQr,
    cart,
    isActive: !!sessionId,
    isStarting,
    startSession,
    refreshCart,
    scanItem,
    removeItem,
    pay,
    applyCompletedSession,
    cancel,
    validateExit,
    reset,
  }}
>
```

- [ ] **Step 3: Use `applyCompletedSession` from review.tsx**

In `app/shop/review.tsx`, destructure the new helper from `useSession()`:

```tsx
const { cart, refreshCart, pay, sessionId, applyCompletedSession } = useSession();
```

Replace the `await waitForSessionStatus(...)` line in the `handlePay` body with:

```tsx
const completed = await waitForSessionStatus(sessionId, 'COMPLETED');
applyCompletedSession(completed);
router.replace('/shop/walkout');
```

That way `<WalkoutScreen>` reads `exitQr` from `useSession()` without an extra round trip.

- [ ] **Step 3: Commit**

```bash
git add app/shop/review.tsx src/context/SessionContext.tsx
git commit -m "wire payment sheet into review"
```

---

## Task 15: Verification — local end-to-end with Stripe CLI

**Files:** none (manual runbook)

- [ ] **Step 1: Boot the stack**

```bash
cd ~/Projects/Learning/Atlassync/atlassync-backend
docker compose up -d
# Then start auth, gateway, product, session, cart services in IntelliJ
```

- [ ] **Step 2: Set env vars for session-service**

In the IntelliJ Run Configuration for session-service, add Environment Variables:

```
STRIPE_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_KEY
STRIPE_WEBHOOK_SECRET=<filled in next step>
STRIPE_CURRENCY=mad
```

Restart session-service.

- [ ] **Step 3: Start Stripe CLI listener**

In a fresh terminal:

```bash
stripe login   # one-time
stripe listen --forward-to localhost:8080/api/sessions/webhooks/stripe
```

Expected output:
```
Ready! Your webhook signing secret is whsec_abcdef... (^C to quit)
```

Copy the `whsec_...` value. Paste it into the IntelliJ `STRIPE_WEBHOOK_SECRET` env var. Restart session-service one more time.

- [ ] **Step 4: Set the publishable key on the mobile**

In `~/Projects/Learning/Atlassync/atlassync-mobile/.env.local`:

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_REPLACE_WITH_YOUR_KEY
```

Restart Metro with cache clear:

```bash
cd ~/Projects/Learning/Atlassync/atlassync-mobile
npx expo start --clear
```

- [ ] **Step 5: Run a happy-path purchase**

1. Open the app on iPhone, sign in
2. Tap "Start shopping" → arrive at the scan screen
3. Scan a barcode from `tools/test-barcodes.html` (e.g. `2345678901` = Whole milk)
4. Tap the totals strip → land on Review
5. Tap **Pay & walk out** → Stripe PaymentSheet should appear
6. Enter test card: `4242 4242 4242 4242` — any future expiry — any 3-digit CVV — any postal
7. Tap **Pay**

Expected:
- PaymentSheet shows "Payment successful" → dismisses
- Mobile waits a beat then navigates to `/shop/walkout`
- Walkout shows the exit QR
- In the Stripe CLI window you'll see `payment_intent.succeeded → 200 OK`
- In session-service logs: `[stripe-webhook] session=<uuid> marked COMPLETED, exit QR generated`
- In Stripe dashboard → Test Mode → Payments: the charge appears

- [ ] **Step 6: Run failure-path tests**

Card `4000 0000 0000 0002` triggers a "card declined" decline. Expected: PaymentSheet shows the decline reason inline; tapping Pay doesn't navigate; mobile error string shows.

Card `4000 0027 6000 3184` triggers a 3DS challenge. Expected: a webview opens for the auth step; on approval the flow completes as happy path.

- [ ] **Step 7: Confirm idempotency**

Trigger a webhook redelivery from Stripe CLI:

```bash
stripe events resend <event_id>   # use the event id from a prior payment_intent.succeeded
```

Expected: session-service logs `[stripe-webhook] session=<uuid> already COMPLETED, skipping`. No state change, returns 200.

- [ ] **Step 8: Commit the env file template**

Create an `.env.example` in the mobile repo (no real key, just a placeholder):

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

```bash
cd ~/Projects/Learning/Atlassync/atlassync-mobile
git add .env.example
git commit -m "document stripe env var"
```

---

## Out of Scope (Follow-up Tickets)

These were considered and deliberately excluded from this plan:

1. **Remove the old `/api/sessions/{id}/pay` endpoint and `SessionContext.pay()`** — leave the deprecated fallback in place for now; clean up once the Stripe flow has soaked.
2. **Customer object reuse** — currently we create a fresh PaymentIntent each time. For saved-card UX, we'd create a Stripe `Customer` per user and reuse the `customer` field on PaymentIntents. Adds a row on `users` for `stripe_customer_id`.
3. **Apple Pay merchant ID** — the `merchantIdentifier` in StripeProvider needs a real Apple Pay merchant ID for production. Test Mode works without it.
4. **WebSocket completion signal** — replace polling with an STOMP message published when `markPaidFromWebhook` runs. The current 1s poll is fine for the demo.
5. **Refunds** — Stripe dashboard supports manual refunds; programmatic refund flow not built.
6. **Production webhook endpoint** — register the real prod URL on the Stripe dashboard and pin the production `whsec_...` in a secret manager (Vault).

File these as issues #15–#20 when the time comes.
