# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: notifications.spec.ts >> AUTHOR notifications at 390
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
  - main [ref=e34]:
    - generic [ref=e35]:
      - navigation "Breadcrumb" [ref=e36]:
        - text: Workspace /
        - strong [ref=e37]: Settings
      - generic [ref=e38]:
        - generic "Current role" [ref=e39]: AUTHOR
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
        - button "Advanced / Development" [ref=e52] [cursor=pointer]
      - heading "Notifications" [active] [level=2] [ref=e53]
      - region "Governance" [ref=e54]
      - region "Notifications" [ref=e56]:
        - generic [ref=e57]:
          - generic [ref=e58]:
            - heading "Notifications" [level=2] [ref=e59]
            - button "Refresh notifications" [ref=e60] [cursor=pointer]
          - paragraph [ref=e61]: Route new operational alerts to email or HTTPS webhooks. Delivery runs after each scheduler tick; existing alerts are not backfilled.
          - heading "Destinations" [level=3] [ref=e63]
          - generic [ref=e64]:
            - generic [ref=e65]:
              - generic [ref=e66]:
                - text: Search
                - textbox "Search table" [ref=e67]:
                  - /placeholder: Search visible fields
              - generic [ref=e68]: 0 results
            - region "Notification destinations table" [ref=e69]:
              - table [ref=e70]:
                - rowgroup [ref=e71]:
                  - row [ref=e72]:
                    - columnheader [ref=e73]:
                      - button "Name ↓" [ref=e74] [cursor=pointer]
                    - columnheader [ref=e75]:
                      - button "Type" [ref=e76] [cursor=pointer]
                    - columnheader [ref=e77]:
                      - button "Status" [ref=e78] [cursor=pointer]
                    - columnheader [ref=e79]:
                      - button "Last delivery" [ref=e80] [cursor=pointer]
                    - columnheader [ref=e81]:
                      - button "Actions" [ref=e82] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e83]: No notification destinations configured.
          - heading "Rules" [level=3] [ref=e85]
          - generic [ref=e86]:
            - generic [ref=e87]:
              - generic [ref=e88]:
                - text: Search
                - textbox "Search table" [ref=e89]:
                  - /placeholder: Search visible fields
              - generic [ref=e90]: 0 results
            - region "Notification rules table" [ref=e91]:
              - table [ref=e92]:
                - rowgroup [ref=e93]:
                  - row [ref=e94]:
                    - columnheader [ref=e95]:
                      - button "Name ↓" [ref=e96] [cursor=pointer]
                    - columnheader [ref=e97]:
                      - button "Severity" [ref=e98] [cursor=pointer]
                    - columnheader [ref=e99]:
                      - button "Alert types" [ref=e100] [cursor=pointer]
                    - columnheader [ref=e101]:
                      - button "Destinations" [ref=e102] [cursor=pointer]
                    - columnheader [ref=e103]:
                      - button "Status" [ref=e104] [cursor=pointer]
                    - columnheader [ref=e105]:
                      - button "Actions" [ref=e106] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e107]: No notification rules configured.
          - heading "Delivery history" [level=3] [ref=e108]
          - generic [ref=e109]:
            - generic [ref=e110]:
              - generic [ref=e111]:
                - text: Search
                - textbox "Search table" [ref=e112]:
                  - /placeholder: Search visible fields
              - generic [ref=e113]: 0 results on this page
            - region "Notification delivery history table" [ref=e114]:
              - table [ref=e115]:
                - rowgroup [ref=e116]:
                  - row [ref=e117]:
                    - columnheader [ref=e118]:
                      - button "Destination ↓" [ref=e119] [cursor=pointer]
                    - columnheader [ref=e120]:
                      - button "Event" [ref=e121] [cursor=pointer]
                    - columnheader [ref=e122]:
                      - button "State" [ref=e123] [cursor=pointer]
                    - columnheader [ref=e124]:
                      - button "Attempts" [ref=e125] [cursor=pointer]
                    - columnheader [ref=e126]:
                      - button "Updated" [ref=e127] [cursor=pointer]
                    - columnheader [ref=e128]:
                      - button "Error code" [ref=e129] [cursor=pointer]
                - rowgroup
            - paragraph [ref=e130]: No notification deliveries yet.
```