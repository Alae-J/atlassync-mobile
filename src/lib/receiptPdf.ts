import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import type { ReceiptResponse } from '../types';
import { formatPrice } from './formatPrice';

const TAX_RATE = 0.0875;

interface DownloadOpts {
  storeLabel: string;
  customerName: string;
}

/**
 * Renders the receipt to a styled HTML page, hands it to expo-print to
 * produce a PDF on disk, then opens the native share sheet so the user can
 * save, AirDrop, email, or print it. The HTML mirrors the in-app receipt
 * aesthetic — cream paper, ink text, serif title — so the saved file feels
 * branded rather than a generic dump.
 */
export async function downloadReceiptPdf(
  receipt: ReceiptResponse,
  opts: DownloadOpts,
): Promise<void> {
  const html = renderReceiptHtml(receipt, opts);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    // Best effort: at least surface the file URI in dev so we can verify it
    // landed somewhere. Production would also alert here.
    console.warn('[receipt] Sharing not available, file saved at', uri);
    return;
  }

  await Sharing.shareAsync(uri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'AtlasSync receipt',
  });
}

function renderReceiptHtml(
  receipt: ReceiptResponse,
  { storeLabel, customerName }: DownloadOpts,
): string {
  const total = receipt.totalAmount ?? 0;
  const subtotal = +(total / (1 + TAX_RATE)).toFixed(2);
  const tax = +(total - subtotal).toFixed(2);

  const created = formatDate(receipt.createdAt);
  const completed = receipt.completedAt ? formatDate(receipt.completedAt) : null;
  const shortId = receipt.sessionId.slice(0, 8).toUpperCase();

  const lineRows = receipt.items
    .map(
      (item) => `
        <tr>
          <td class="qty">${item.quantity}×</td>
          <td class="name">
            <div class="name-main">${escape(item.productName)}</div>
            <div class="name-meta">${escape(item.barcode)}</div>
          </td>
          <td class="unit">${formatPrice(item.unitPrice)}</td>
          <td class="line">${formatPrice(item.lineTotal)}</td>
        </tr>
      `,
    )
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 36pt 32pt; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, sans-serif;
      color: #15140f;
      background: #f4ede0;
      margin: 0;
      padding: 28pt 30pt;
      font-size: 11pt;
      line-height: 1.45;
    }
    .eyebrow {
      font-size: 9pt;
      letter-spacing: 1.6pt;
      color: #7a7163;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 6pt;
    }
    h1 {
      font-family: Georgia, "Times New Roman", serif;
      font-size: 34pt;
      line-height: 1.05;
      letter-spacing: -0.8pt;
      font-weight: 400;
      margin: 0 0 6pt;
    }
    h1 em {
      font-style: italic;
      color: #c87a3a;
    }
    .meta {
      font-size: 10.5pt;
      color: #7a7163;
      margin-bottom: 22pt;
    }
    .meta strong { color: #15140f; font-weight: 600; }
    .panel {
      background: #fffaf0;
      border: 1px solid rgba(21,20,15,0.10);
      border-radius: 10pt;
      padding: 14pt 16pt;
      margin-bottom: 14pt;
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      text-align: left;
      font-size: 8.5pt;
      letter-spacing: 1.4pt;
      color: #7a7163;
      font-weight: 600;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(21,20,15,0.10);
      padding-bottom: 8pt;
    }
    td {
      vertical-align: top;
      padding: 9pt 0;
      border-bottom: 1px dashed rgba(21,20,15,0.10);
    }
    td.qty {
      font-family: Georgia, serif;
      width: 36pt;
      color: #7a7163;
    }
    td.name .name-main { font-weight: 500; }
    td.name .name-meta { font-size: 9pt; color: #7a7163; margin-top: 2pt; }
    td.unit, td.line { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    td.line { font-weight: 600; padding-left: 14pt; }
    .totals { margin-top: 18pt; }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 4pt 0;
      font-size: 11pt;
    }
    .totals-row.bold { font-weight: 700; font-size: 14pt; margin-top: 6pt; padding-top: 10pt; border-top: 1pt solid #15140f; }
    .totals-label { color: #7a7163; }
    .footer {
      margin-top: 24pt;
      padding-top: 14pt;
      border-top: 1px solid rgba(21,20,15,0.10);
      font-size: 9pt;
      color: #7a7163;
      line-height: 1.6;
    }
    .footer .ref { font-family: ui-monospace, "SF Mono", Menlo, monospace; color: #15140f; }
  </style>
</head>
<body>
  <div class="eyebrow">Receipt · ${escape(storeLabel)}</div>
  <h1>Thanks <em>${escape(firstName(customerName))}</em>.</h1>
  <div class="meta">
    <strong>${receipt.itemCount ?? receipt.items.length}</strong> items
    · paid ${escape(completed ?? created)}
    · ${formatPrice(total)}
  </div>

  <div class="panel">
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Item</th>
          <th style="text-align:right">Unit</th>
          <th style="text-align:right">Line</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span class="totals-label">Subtotal</span>
        <span>${formatPrice(subtotal)}</span>
      </div>
      <div class="totals-row">
        <span class="totals-label">Tax (8.75%)</span>
        <span>${formatPrice(tax)}</span>
      </div>
      <div class="totals-row bold">
        <span>Total</span>
        <span>${formatPrice(total)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    Trip started ${escape(created)}${completed ? ` · paid ${escape(completed)}` : ''}.<br />
    Reference: <span class="ref">${escape(shortId)}</span> · AtlasSync · ${escape(storeLabel)}
  </div>
</body>
</html>`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function firstName(full: string): string {
  const trimmed = full.trim();
  if (!trimmed) return 'there';
  return trimmed.split(/\s+/)[0];
}

function escape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
