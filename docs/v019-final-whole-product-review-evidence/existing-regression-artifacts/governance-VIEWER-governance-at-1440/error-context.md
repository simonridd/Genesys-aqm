# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: governance.spec.ts >> VIEWER governance at 1440
- Location: tests/governance.spec.ts:7:164

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - generic [ref=e5]:
      - img "IPI" [ref=e6]
      - generic [ref=e7]:
        - strong [ref=e8]: IPI AQM
        - text: Automated Quality Management
    - navigation "Primary navigation" [ref=e9]:
      - group [ref=e10]:
        - generic "Monitor / Quality" [ref=e11] [cursor=pointer]
        - generic [ref=e12]:
          - button "Overview" [ref=e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=e14]: ◌
          - button "Analytics" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ▥
          - button "Evaluations" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ◷
          - button "Calibration" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◎
      - group [ref=e25]:
        - generic "Reference configuration" [ref=e26] [cursor=pointer]
      - group [ref=e27]:
        - generic "Interactions" [ref=e28] [cursor=pointer]
      - generic [ref=e29]:
        - button "Settings" [ref=e30] [cursor=pointer]:
          - generic [aria-hidden] [ref=e31]: ⚙
        - button "About / product tour" [ref=e33] [cursor=pointer]
    - generic [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]: ✦
        - strong [ref=e37]: Decision intelligence powered by Jev
        - paragraph [ref=e38]: Typed AI decisions, shaped into clear quality signals.
      - generic [ref=e39]: V0.19D SHOWCASE • 2026
  - main [ref=e40]:
    - generic [ref=e41]:
      - navigation "Breadcrumb" [ref=e42]:
        - text: Workspace /
        - strong [ref=e43]: Settings
      - generic [ref=e44]:
        - generic "Current role" [ref=e45]: VIEWER
        - text: Jev managed securely by automation service
    - generic [ref=e47]:
      - generic [ref=e49]:
        - heading "Settings" [level=1] [ref=e50]
        - paragraph [ref=e51]: Connect Genesys Cloud and manage your organization's AQM settings.
      - navigation "Settings sections" [ref=e52]:
        - button "Connection" [ref=e53] [cursor=pointer]
        - button "Access" [ref=e54] [cursor=pointer]
        - button "Reviews" [ref=e55] [cursor=pointer]
        - button "Privacy & retention" [ref=e56] [cursor=pointer]
        - button "Advanced / Development" [ref=e57] [cursor=pointer]
      - heading "Access" [active] [level=2] [ref=e58]
      - region "Governance" [ref=e59]:
        - paragraph [ref=e61]: Your access follows your current role, shown in the top bar. Contact an administrator to change role assignments.
```