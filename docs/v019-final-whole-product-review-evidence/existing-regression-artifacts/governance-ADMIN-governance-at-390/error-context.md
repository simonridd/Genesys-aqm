# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: governance.spec.ts >> ADMIN governance at 390
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
  - main [ref=e34]:
    - generic [ref=e35]:
      - navigation "Breadcrumb" [ref=e36]:
        - text: Workspace /
        - strong [ref=e37]: Settings
      - generic [ref=e38]:
        - generic "Current role" [ref=e39]: ADMIN
        - text: Jev managed securely by automation service
    - generic [ref=e41]:
      - generic [ref=e43]:
        - heading "Settings" [level=1] [ref=e44]
        - paragraph [ref=e45]: Connect Genesys Cloud and manage your organization's AQM settings.
      - navigation "Settings sections" [ref=e46]:
        - button "Connection" [ref=e47] [cursor=pointer]
        - button "Access" [ref=e48] [cursor=pointer]
        - button "Reviews" [ref=e49] [cursor=pointer]
        - button "Privacy & retention" [ref=e50] [cursor=pointer]
        - button "Notifications" [ref=e51] [cursor=pointer]
        - button "Audit" [ref=e52] [cursor=pointer]
        - button "Advanced / Development" [ref=e53] [cursor=pointer]
      - heading "Audit" [level=2] [ref=e54]
      - region "Governance" [ref=e55]:
        - generic [ref=e56]:
          - heading "Audit history" [level=2] [ref=e57]
          - generic [ref=e58]:
            - generic [ref=e59]:
              - text: Audit from
              - textbox "Audit from" [ref=e60]
            - generic [ref=e61]:
              - text: Audit to
              - textbox "Audit to" [ref=e62]
            - generic [ref=e63]:
              - text: Actor user ID
              - textbox "Actor user ID" [ref=e64]
            - generic [ref=e65]:
              - text: Resource type
              - textbox "Resource type" [ref=e66]
            - generic [ref=e67]:
              - text: Audit action
              - textbox "Audit action" [ref=e68]
          - button "Load audit history" [ref=e69] [cursor=pointer]
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e72]:
                - text: Search
                - textbox "Search table" [ref=e73]:
                  - /placeholder: Search visible fields
              - generic [ref=e74]: 1 results on this page
            - region "Audit history table" [ref=e75]:
              - table [ref=e76]:
                - rowgroup [ref=e77]:
                  - row [ref=e78]:
                    - columnheader [ref=e79]:
                      - button "Time ↓" [ref=e80] [cursor=pointer]
                    - columnheader [ref=e81]:
                      - button "Actor" [ref=e82] [cursor=pointer]
                    - columnheader [ref=e83]:
                      - button "Action" [ref=e84] [cursor=pointer]
                    - columnheader [ref=e85]:
                      - button "Resource" [ref=e86] [cursor=pointer]
                    - columnheader [ref=e87]:
                      - button "Summary" [ref=e88] [cursor=pointer]
                - rowgroup [ref=e89]:
                  - row [ref=e90] [cursor=pointer]:
                    - cell "2026-10-01T12:00:00Z" [ref=e91]
                    - cell "Fixture operator" [ref=e92]
                    - cell [ref=e93]:
                      - 'button "Open audit event form.publish: form publish" [ref=e94]': form.publish
                    - 'cell "form: draft_fixture" [ref=e95]'
                    - cell "form publish" [ref=e96]
          - generic [ref=e97]:
            - generic [ref=e98]:
              - heading "Audit event detail" [active] [level=3] [ref=e99]
              - button "Close details" [ref=e100] [cursor=pointer]
            - paragraph [ref=e101]: audit_fixture · fixture
            - paragraph [ref=e102]: fixture-user · draft_fixture
            - generic [ref=e103]: "{ \"version\": 1 }"
```