# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: governance.spec.ts >> ADMIN governance at 1440
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
          - button "Evaluations" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ◷
          - button "Analytics" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ▥
          - button "Calibration" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◎
      - group [ref=e25]:
        - generic "Configuration" [ref=e26] [cursor=pointer]
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
        - generic "Current role" [ref=e45]: ADMIN
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
        - button "Notifications" [ref=e57] [cursor=pointer]
        - button "Audit" [ref=e58] [cursor=pointer]
        - button "Advanced / Development" [ref=e59] [cursor=pointer]
      - heading "Audit" [level=2] [ref=e60]
      - region "Governance" [ref=e61]:
        - generic [ref=e62]:
          - heading "Audit history" [level=2] [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - text: Audit from
              - textbox "Audit from" [ref=e66]
            - generic [ref=e67]:
              - text: Audit to
              - textbox "Audit to" [ref=e68]
            - generic [ref=e69]:
              - text: Actor user ID
              - textbox "Actor user ID" [ref=e70]
            - generic [ref=e71]:
              - text: Resource type
              - textbox "Resource type" [ref=e72]
            - generic [ref=e73]:
              - text: Audit action
              - textbox "Audit action" [ref=e74]
          - button "Load audit history" [ref=e75] [cursor=pointer]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]:
                - text: Search
                - textbox "Search table" [ref=e79]:
                  - /placeholder: Search visible fields
              - generic [ref=e80]: 1 results on this page
            - region "Audit history table" [ref=e81]:
              - table [ref=e82]:
                - rowgroup [ref=e83]:
                  - row [ref=e84]:
                    - columnheader [ref=e85]:
                      - button "Time ↓" [ref=e86] [cursor=pointer]
                    - columnheader [ref=e87]:
                      - button "Actor" [ref=e88] [cursor=pointer]
                    - columnheader [ref=e89]:
                      - button "Action" [ref=e90] [cursor=pointer]
                    - columnheader [ref=e91]:
                      - button "Resource" [ref=e92] [cursor=pointer]
                    - columnheader [ref=e93]:
                      - button "Summary" [ref=e94] [cursor=pointer]
                - rowgroup [ref=e95]:
                  - row [ref=e96] [cursor=pointer]:
                    - cell "2026-10-01T12:00:00Z" [ref=e97]
                    - cell "Fixture operator" [ref=e98]
                    - cell [ref=e99]:
                      - 'button "Open audit event form.publish: form publish" [ref=e100]': form.publish
                    - 'cell "form: draft_fixture" [ref=e101]'
                    - cell "form publish" [ref=e102]
          - generic [ref=e103]:
            - generic [ref=e104]:
              - heading "Audit event detail" [active] [level=3] [ref=e105]
              - button "Close details" [ref=e106] [cursor=pointer]
            - paragraph [ref=e107]: audit_fixture · fixture
            - paragraph [ref=e108]: fixture-user · draft_fixture
            - generic [ref=e109]: "{ \"version\": 1 }"
```