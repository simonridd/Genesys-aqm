# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: definition-authority.spec.ts >> R05 exact review, saved/local libraries, routing and transitions 390
- Location: tests/definition-authority.spec.ts:60:2

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
        - generic [ref=e27]:
          - button "Policies" [ref=e28] [cursor=pointer]:
            - generic [aria-hidden] [ref=e29]: ◇
          - button "Evaluation Forms" [ref=e31] [cursor=pointer]:
            - generic [aria-hidden] [ref=e32]: ▤
          - button "Question Groups" [ref=e34] [cursor=pointer]:
            - generic [aria-hidden] [ref=e35]: ▦
          - button "Answer Sets" [ref=e37] [cursor=pointer]:
            - generic [aria-hidden] [ref=e38]: ☷
      - group [ref=e40]:
        - generic "Interactions" [ref=e41] [cursor=pointer]
      - generic [ref=e42]:
        - button "Settings" [ref=e43] [cursor=pointer]:
          - generic [aria-hidden] [ref=e44]: ⚙
        - button "About / product tour" [ref=e46] [cursor=pointer]
  - main [ref=e47]:
    - generic [ref=e48]:
      - navigation "Breadcrumb" [ref=e49]:
        - text: Workspace /
        - strong [ref=e50]: Question Groups
      - generic [ref=e51]:
        - generic "Current role" [ref=e52]: ADMIN
        - text: Jev managed securely by automation service
    - generic [ref=e54]:
      - generic [ref=e55]:
        - generic [ref=e56]:
          - generic [ref=e57]: CONFIGURATION
          - heading "Question Groups" [level=1] [ref=e58]
          - paragraph [ref=e59]: Reuse a set of related questions across multiple evaluation forms.
        - generic [ref=e60]:
          - generic [ref=e61]:
            - text: Import reusable group
            - button "Import reusable group" [ref=e62]
          - button "New reusable question group" [ref=e63] [cursor=pointer]
      - region "Saved Question Groups" [ref=e64]:
        - heading "Saved in AQM · 1 saved group" [level=2] [ref=e65]
        - button "Refresh saved groups" [ref=e66] [cursor=pointer]
      - generic [ref=e67]:
        - generic [ref=e68]:
          - text: Status
          - combobox "Library status" [ref=e69]:
            - option "All statuses" [selected]
            - option "Draft"
            - option "Published"
            - option "Retired"
        - generic [ref=e70]:
          - text: Version
          - combobox "Library version" [ref=e71]:
            - option "All versions" [selected]
            - option "Latest version per family"
        - generic [ref=e72]:
          - text: Usage
          - combobox "Library usage" [ref=e73]:
            - option "All usage" [selected]
            - option "Used"
            - option "Unused"
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e76]:
            - text: Search
            - textbox "Search table" [ref=e77]:
              - /placeholder: Search visible fields
          - generic [ref=e78]: 1 results
        - region "Reusable question groups table" [ref=e79]:
          - table [ref=e80]:
            - rowgroup [ref=e81]:
              - row [ref=e82]:
                - columnheader [ref=e83]:
                  - button "Name ↓" [ref=e84] [cursor=pointer]
                - columnheader [ref=e85]:
                  - button "Version" [ref=e86] [cursor=pointer]
                - columnheader [ref=e87]:
                  - button "Status" [ref=e88] [cursor=pointer]
                - columnheader [ref=e89]:
                  - button "Questions" [ref=e90] [cursor=pointer]
                - columnheader [ref=e91]:
                  - button "Used by forms" [ref=e92] [cursor=pointer]
                - columnheader [ref=e93]:
                  - button "Last modified" [ref=e94] [cursor=pointer]
            - rowgroup [ref=e95]:
              - row [ref=e96] [cursor=pointer]:
                - cell [ref=e97]:
                  - button "Open reusable question group Saved group A v1" [ref=e98]: Saved group A
                - cell "v1" [ref=e99]
                - cell "PUBLISHED" [ref=e100]
                - cell "3" [ref=e101]
                - cell "1" [ref=e102]
                - cell "10/1/2026" [ref=e103]
      - group [ref=e104]:
        - generic "Local drafts & starter examples · 4 groups" [active] [ref=e105] [cursor=pointer]
        - paragraph [ref=e106]: Preserved in this browser. Not saved in AQM. Saved form authoring offers only published saved groups.
        - generic [ref=e107]:
          - strong [ref=e108]: Identity & Security Verification · v1
          - paragraph [ref=e109]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e110] [cursor=pointer]
          - button "Save as AQM draft" [ref=e111] [cursor=pointer]
        - generic [ref=e112]:
          - strong [ref=e113]: Customer Experience / Empathy · v1
          - paragraph [ref=e114]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e115] [cursor=pointer]
          - button "Save as AQM draft" [ref=e116] [cursor=pointer]
        - generic [ref=e117]:
          - strong [ref=e118]: Resolution & Next Steps · v1
          - paragraph [ref=e119]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e120] [cursor=pointer]
          - button "Save as AQM draft" [ref=e121] [cursor=pointer]
        - generic [ref=e122]:
          - strong [ref=e123]: Call Closing · v1
          - paragraph [ref=e124]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e125] [cursor=pointer]
          - button "Save as AQM draft" [ref=e126] [cursor=pointer]
```