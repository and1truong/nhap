# Nháp issue 1 research harness

Research date: 6 October 2026. Product baseline: 54c97eb3b720439d5b519f80059bb261f2d3725d.

Read REPORT.md first. corpus.json has 140 hand-labelled stress cases. results.json stores real Nháp Chromium DOM outputs plus portable core outputs before and after a final Space. action-results.json stores 25 isolated action sequences with value, caret and mode after every action. Synthetic composition is explicitly labelled. No native macOS, Windows or iPhone integration result is claimed.

The reference engines are independent research processes, never included in the Nháp editor. x-unikey is upstream Pham Kim Long source, archive version 1.0.4. ibus-unikey is a modified fork included as a cross-check. OpenKey is the source used by a macOS product; the portable harness uses its macOS key map, without the OS event tap or text replacement integration.

Requirements: Python 3, git, curl, tar, g++, Node 22 or later and Playwright 1.63.0. The prepare step needs network access. Replays need no network after dependencies and reference engines are prepared; the Nháp fixture itself is one offline HTML file.

Run python3 prepare-engines.py from this directory. It verifies the official archive SHA-256, checks out pinned reference commits, and compiles the three adapters. Upstream source is not modified. Old X-Unikey requires the compiler compatibility options -fpermissive and -include cstring. OpenKey requires -include algorithm under GCC 13.3.

Run npm install, then npx playwright install chromium. Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to your Chromium executable; its default in these research scripts is /tmp/chromium, the executable used for this run. Set NHAP_REPO to a pre-existing Nháp checkout to reuse its Playwright dependency, or omit it after installing dependencies here. Run npm run replay to regenerate both output files. Results include the actual browser version; equality is compared after the final Space is removed. The adapters reject non-ASCII input, and native Unicode preservation is tested separately in actions.mjs.

The native-recorder.html fixture is intentionally a plain textarea without web Telex. Open it on Windows/macOS to capture the real native engine result and event stream. For Nháp integration, replay the same cases in the actual editor separately. Always record OS, browser, keyboard source, exact engine version and settings; a macOS browser viewport or portable core run is not a native IME test.

Corpus labels deliberately contain both English-intent list and Vietnamese-intent list. The expected output is a declared test intention, not a ground truth inferred from the raw string. Some compatibility controls intentionally differ from the reference engines: standalone w stays w in Nháp, brackets remain literal, and checked guitar spelling can prevent the familiar guitarr escape. Nonstandard slang is explicitly labelled. Category mismatch counts are not estimated user error rates or a universal engine ranking.

No third-party engine source or binaries are included here. Fetch sources from their pinned upstreams; their license files remain with them. The research glue and report do not change the MIT product or its dependencies. Treat engine reuse in the product as a separate dependency and license decision.
