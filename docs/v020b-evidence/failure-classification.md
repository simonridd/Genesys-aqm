# Qualification failure classification

The initial harness attempted a full reload without repeating the fictional sign-in callback. Production authentication is held in memory; the fixture now simulates sign-in on each document load while retaining the tested investigation URL. This changes test authentication only.

Other corrected harness attempts: a rerun overlapped the earlier preview port; importing the sample library directly in Playwright needed JSON module attributes (replaced with the existing fictional conversation reference); unscoped From/table selectors matched the intentionally mounted hidden ConversationBrowser; native ArrowDown selection chose the preceding form (replaced with human-label type-to-select, as in the existing keyboard replay). Wrapping-select label lookup was made explicit with the same human aria-label as its visible label.

Visual review led to compact mobile metrics and mobile question cards. Final reports replace the failed exploratory reports. There are no unresolved failures in the focused Calibration or current-contract regression runs. The giant historical suite was neither run nor repaired. The adjacent exact-investigation test was updated to exercise the new human selector and visible question action; its filtering assertions remain intact.
