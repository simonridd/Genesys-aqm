# Qualification failure classification

The initial local history run passed 13/17 cases. Four fixture/assertion failures were corrected; no additional application code change was needed:

- v18 selected Claims, where the fixture deliberately has only v17 rows. Selecting Service provides the actual v18 scope.
- Explicit Back to Analytics correctly reconstructs all source parameter values but in canonical helper order. Its assertion now compares exact key/value maps; browser Back still asserts byte-for-byte source URL restoration.
- Keyboard native date entry was incorrectly supplied an ISO string through keyboard.type. Keyboard journey now uses all dates and types the remaining cohort controls; exact date restoration stays covered independently.
- Mobile keyboard selection checked visibility during cohort loading and chose a desktop control before the responsive switcher mounted. Wait for the actual switcher before native type-ahead.

The repaired four cases pass; the final full 46-case history/recovery/guard report supersedes the initial report. No failed test was skipped or retried to produce a flaky pass. Initial raw report is retained as `qualification-development.*`; final qualification has no failed, flaky or skipped tests.

A smoke command with an anchored title regex selected no tests because Playwright matches the full test path. Corrected title matching selects the intended ten tests. This was a command selection error, not a product failure.
