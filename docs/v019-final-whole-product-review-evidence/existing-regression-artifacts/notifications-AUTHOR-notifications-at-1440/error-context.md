# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> AUTHOR notifications at 1440
- Location: tests/notifications.spec.ts:6:164

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
        - generic "Configuration" [ref=e11] [cursor=pointer]
        - generic [ref=e12]:
          - button "Evaluation Forms" [ref=e13] [cursor=pointer]:
            - generic [aria-hidden] [ref=e14]: ▤
          - button "Question Groups" [ref=e16] [cursor=pointer]:
            - generic [aria-hidden] [ref=e17]: ▦
          - button "Answer Sets" [ref=e19] [cursor=pointer]:
            - generic [aria-hidden] [ref=e20]: ☷
          - button "Policies" [ref=e22] [cursor=pointer]:
            - generic [aria-hidden] [ref=e23]: ◇
      - group [ref=e25]:
        - generic "Monitor / Quality" [ref=e26] [cursor=pointer]
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
        - generic "Current role" [ref=e45]: AUTHOR
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
        - button "Advanced / Development" [ref=e58] [cursor=pointer]
      - heading "Notifications" [active] [level=2] [ref=e59]
      - region "Governance" [ref=e60]
      - region "Notifications" [ref=e62]:
        - generic [ref=e63]:
          - generic [ref=e64]:
            - heading "Notifications" [level=2] [ref=e65]
            - button "Refresh notifications" [ref=e66] [cursor=pointer]
          - paragraph [ref=e67]: Route new operational alerts to email or HTTPS webhooks. Delivery runs after each scheduler tick; existing alerts are not backfilled.
          - heading "Destinations" [level=3] [ref=e69]
          - generic [ref=e70]:
            - generic [ref=e71]:
              - generic [ref=e72]:
                - text: Search
                - textbox "Search table" [ref=e73]:
                  - /placeholder: Search visible fields
              - generic [ref=e74]: 0 results
            - region "Notification destinations table" [ref=e75]:
              - table [ref=e76]:
                - rowgroup [ref=e77]:
                  - row [ref=e78]:
                    - columnheader [ref=e79]:
                      - button "Name ↓" [ref=e80] [cursor=pointer]
                    - columnheader [ref=e81]:
                      - button "Type" [ref=e82] [cursor=pointer]
                    - columnheader [ref=e83]:
                      - button "Status" [ref=e84] [cursor=pointer]
                    - columnheader [ref=e85]:
                      - button "Last delivery" [ref=e86] [cursor=pointer]
                    - columnheader [ref=e87]:
                      - button "Actions" [ref=e88] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e89]: No notification destinations configured.
          - heading "Rules" [level=3] [ref=e91]
          - generic [ref=e92]:
            - generic [ref=e93]:
              - generic [ref=e94]:
                - text: Search
                - textbox "Search table" [ref=e95]:
                  - /placeholder: Search visible fields
              - generic [ref=e96]: 0 results
            - region "Notification rules table" [ref=e97]:
              - table [ref=e98]:
                - rowgroup [ref=e99]:
                  - row [ref=e100]:
                    - columnheader [ref=e101]:
                      - button "Name ↓" [ref=e102] [cursor=pointer]
                    - columnheader [ref=e103]:
                      - button "Severity" [ref=e104] [cursor=pointer]
                    - columnheader [ref=e105]:
                      - button "Alert types" [ref=e106] [cursor=pointer]
                    - columnheader [ref=e107]:
                      - button "Destinations" [ref=e108] [cursor=pointer]
                    - columnheader [ref=e109]:
                      - button "Status" [ref=e110] [cursor=pointer]
                    - columnheader [ref=e111]:
                      - button "Actions" [ref=e112] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e113]: No notification rules configured.
          - heading "Delivery history" [level=3] [ref=e114]
          - generic [ref=e115]:
            - generic [ref=e116]:
              - generic [ref=e117]:
                - text: Search
                - textbox "Search table" [ref=e118]:
                  - /placeholder: Search visible fields
              - generic [ref=e119]: 0 results on this page
            - region "Notification delivery history table" [ref=e120]:
              - table [ref=e121]:
                - rowgroup [ref=e122]:
                  - row [ref=e123]:
                    - columnheader [ref=e124]:
                      - button "Destination ↓" [ref=e125] [cursor=pointer]
                    - columnheader [ref=e126]:
                      - button "Event" [ref=e127] [cursor=pointer]
                    - columnheader [ref=e128]:
                      - button "State" [ref=e129] [cursor=pointer]
                    - columnheader [ref=e130]:
                      - button "Attempts" [ref=e131] [cursor=pointer]
                    - columnheader [ref=e132]:
                      - button "Updated" [ref=e133] [cursor=pointer]
                    - columnheader [ref=e134]:
                      - button "Error code" [ref=e135] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e136]: No notification deliveries yet.
```