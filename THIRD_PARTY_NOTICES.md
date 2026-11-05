# Third-party software

Original application code is MIT licensed, copyright 2026 Eric Gonzalez-Payne.
That license does not replace the licenses of third-party components.

`src/vendor/pdf.min.mjs` and `pdf.worker.min.mjs` are the unchanged matching
legacy/minified builds from official npm `pdfjs-dist` 6.5.438, build 0a4153349.
Mozilla Foundation's Apache 2.0 notices remain in the bundles; the package's
complete license is retained at `src/vendor/pdfjs-license`.
Upstream: https://mozilla.github.io/pdf.js/ and https://github.com/mozilla/pdf.js

The official tarball's SHA-512 was verified against `package-lock.json`:
`sha512-vg8Pw1x+AFKy4AMDvhuWl5cOYV8d698UoEANoFFhc79hqXDnZQqnOXoxw3HG907WHOg1JYOvLhP756boddFxpA==`.
All three shipped vendor files were compared byte-for-byte with that tarball.
The test suite also compares their SHA-256 digests with the clean installed package.
On 2026-11-05 npm audit reported zero known vulnerabilities; npm audit signatures
verified registry signatures and attestations for all four installed packages in the clean install.
This is a point-in-time check, not a guarantee of security.

Node tests use the package's optional `@napi-rs/canvas` platform packages, installed
through the lockfile. Those dependencies retain their own package licenses and
are not included in the release archive. No installation scripts are required.
