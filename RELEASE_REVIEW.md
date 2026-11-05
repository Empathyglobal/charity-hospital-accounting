# Release review

This candidate contains only source code, unchanged third-party libraries/licenses,
synthetic tests and new documentation. No organization branding, logos, original
print templates, login screens, deployment metadata, record archives, secrets,
external-service configuration or version history are distributed.

Sixteen synthetic Node tests passed for exact money, table extraction and
review gates, CSV formula escaping, regional receipt/workflow logic, daily totals,
rate policy, real synthetic PDF extraction through the shipped parser/worker,
invalid PDF rejection, document/page/annotation script rejection, large monetary
aggregation/conversion bounds, signed differences and mixed tender, official-package
byte comparison, PDF input bounds and the static server's allowlist/write rejection.
First-party JavaScript syntax checks and identifying-string/secret-pattern scans
also passed. The scan is a best-effort check, not proof that all security defects
are absent. Checksums are recorded in the release manifest.

No browser was controlled or opened, so browser appearance, worker execution,
real PDF rendering, downloads and full UI flows remain unverified. No complete
accounting backend is present. No production deployment was performed. PDF.js 6.5.438 tarball integrity, bundled-byte equivalence, registry signatures
and attestations were verified. The npm audit reported zero known vulnerabilities
on 2026-11-05. Broader security assurance remains outstanding.

This is appropriate to review as an early source toolkit, not to advertise as a
production-ready accounting, pharmacy or globally compliant hospital system.

Independent re-review reproduced the original large-total and page-action failures
and verified they now fail closed. No remaining material blocker was identified
for the experimental synthetic-data-only source scope. Browser UI remains untested.
