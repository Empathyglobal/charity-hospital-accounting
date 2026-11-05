# Charity Hospital Accounting

A small, local-first accounting toolkit designed for charity hospitals globally.
This is an early source release, not a complete hospital accounting system.
It contains reusable calculation modules and a standalone pharmacy PDF-to-CSV
review screen. It is not medical advice, medication management, dispensing,
inventory control, a ledger, or a financial approval system.

## Run a synthetic-data evaluation

Use Node.js 22.13 or newer. No provider account is needed. A clean install uses
the pinned npm lockfile; optional native canvas packages support Node PDF tests.
Installation scripts are not needed. The UI uses the checked-in matching parser
and worker, so serving it does not fetch packages or load a CDN.

```
npm ci --ignore-scripts
npm test
npm start
```

Open `http://127.0.0.1:8788` yourself. The server listens on loopback only and
serves an explicit list of static assets. Do not expose it as a production service.
No uploads, databases, authentication, cloud storage, telemetry or AI are configured.
Do not enter credentials. There is no live integration to enable.

## Included capabilities

- Pharmacy PDF table review: local selectable-text extraction, page preview,
  editable headings/cells, per-row review, reviewed CSV and optional review notes.
  Limits: 3 MiB, eight pages, 1,000 rows, 20 columns and bounded preview dimensions.
  Scanned/image-only PDFs have no OCR; manual entry is available.
  Scripts and embedded attachments are rejected. CSV formula prefixes are escaped.
  Check every row: geometric text extraction can misalign columns or omit content.
- `src/money.mjs`: exact nonnegative decimal parsing, formatting and cash difference
  calculations using BigInt. Choose the decimal scale for each currency yourself;
  currencies with 0, 2 or 3 decimal places are supported, up to six places.
  BigInt values require deliberate serialization before JSON storage.
- `src/accounting-usd-khr.mjs`: an explicitly regional, optional USD/KHR profile
  with receipt validation, draft review transitions, daily totals, cash counting,
  draft CSV export and verified dated exchange-rate inputs. This profile uses NBC
  reference URLs and Friday rates for weekends. It makes no network requests.
  It is not a universal exchange-rate or accounting policy. Adapt and validate
  local currency, rounding, tax, approval and reporting rules before adoption.
  This regional profile rejects negative/refund entries; it does not implement
  refund or reversal workflows. All monetary accumulations fail if they exceed
  safe integer minor-unit range instead of silently rounding; use the generic
  BigInt module for larger exact-money calculations. Signed cash differences
  remain supported. Its string-based review transitions are calculations, not authentication or
  enforceable separation of duties. Missing-rate and journal flags require review.

The standalone UI only exposes pharmacy table review. Accounting modules are
developer-facing functions; there is no receipt-entry UI or persistence backend.
Accounting-system CSV compatibility is unverified, and no export posts entries.

## Safety and privacy

Evaluate only with synthetic data until your organization completes security,
privacy, legal and operational review. Everything stays in browser memory unless
you download it. Closing the page loses edits. Downloaded CSV and review notes
contain entered data; notes also include source filename, hash and reviewer name.
Protect, retain and dispose of exports under your own policies. There is no secure
deletion claim. CSV quoting cannot replace security controls in the receiving app.

The Content Security Policy blocks outbound connections. Local modules and PDF
workers are bundled, with no CDN dependency. PDF rendering compatibility and
actual browser interaction have not been verified in this review. Some PDFs need
additional PDF.js fonts/CMaps/WASM not bundled here and may not render correctly.
Malformed PDFs can still exhaust resources. Do not treat the file-size cap as a
security boundary, and review future dependency advisories before real-world use.

Any future AI or cloud integration must be a separately reviewed implementation
using the operator's own provider account, explicit consent, secure server-side
credentials and a disabled-by-default gate. Never embed provider secrets in this UI.

## License

Original code: MIT, copyright 2026 Eric Gonzalez-Payne. See `LICENSE`.
PDF.js retains its Apache 2.0 license and notices. See `THIRD_PARTY_NOTICES.md`.
