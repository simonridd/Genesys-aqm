# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: definition-authority.spec.ts >> R05 exact review, saved/local libraries, routing and transitions 1440
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
    - generic [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]: ✦
        - strong [ref=e50]: Decision intelligence powered by Jev
        - paragraph [ref=e51]: Typed AI decisions, shaped into clear quality signals.
      - generic [ref=e52]: V0.19D SHOWCASE • 2026
  - main [ref=e53]:
    - generic [ref=e54]:
      - navigation "Breadcrumb" [ref=e55]:
        - text: Workspace /
        - strong [ref=e56]: Question Groups
      - generic [ref=e57]:
        - generic "Current role" [ref=e58]: ADMIN
        - text: Jev managed securely by automation service
    - generic [ref=e60]:
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]: CONFIGURATION
          - heading "Question Groups" [level=1] [ref=e64]
          - paragraph [ref=e65]: Reuse a set of related questions across multiple evaluation forms.
        - generic [ref=e66]:
          - generic [ref=e67]:
            - text: Import reusable group
            - button "Import reusable group" [ref=e68]
          - button "New reusable question group" [ref=e69] [cursor=pointer]
      - region "Saved Question Groups" [ref=e70]:
        - heading "Saved in AQM · 1 saved group" [level=2] [ref=e71]
        - button "Refresh saved groups" [ref=e72] [cursor=pointer]
      - generic [ref=e73]:
        - generic [ref=e74]:
          - text: Status
          - combobox "Library status" [ref=e75]:
            - option "All statuses" [selected]
            - option "Draft"
            - option "Published"
            - option "Retired"
        - generic [ref=e76]:
          - text: Version
          - combobox "Library version" [ref=e77]:
            - option "All versions" [selected]
            - option "Latest version per family"
        - generic [ref=e78]:
          - text: Usage
          - combobox "Library usage" [ref=e79]:
            - option "All usage" [selected]
            - option "Used"
            - option "Unused"
      - generic [ref=e80]:
        - generic [ref=e81]:
          - generic [ref=e82]:
            - text: Search
            - textbox "Search table" [ref=e83]:
              - /placeholder: Search visible fields
          - generic [ref=e84]: 1 results
        - region "Reusable question groups table" [ref=e85]:
          - table [ref=e86]:
            - rowgroup [ref=e87]:
              - row [ref=e88]:
                - columnheader [ref=e89]:
                  - button "Name ↓" [ref=e90] [cursor=pointer]
                - columnheader [ref=e91]:
                  - button "Version" [ref=e92] [cursor=pointer]
                - columnheader [ref=e93]:
                  - button "Status" [ref=e94] [cursor=pointer]
                - columnheader [ref=e95]:
                  - button "Questions" [ref=e96] [cursor=pointer]
                - columnheader [ref=e97]:
                  - button "Used by forms" [ref=e98] [cursor=pointer]
                - columnheader [ref=e99]:
                  - button "Last modified" [ref=e100] [cursor=pointer]
            - rowgroup [ref=e101]:
              - row [ref=e102] [cursor=pointer]:
                - cell [ref=e103]:
                  - button "Open reusable question group Saved group A v1" [ref=e104]: Saved group A
                - cell "v1" [ref=e105]
                - cell "PUBLISHED" [ref=e106]
                - cell "3" [ref=e107]
                - cell "1" [ref=e108]
                - cell "10/1/2026" [ref=e109]
      - group [ref=e110]:
        - generic "Local drafts & starter examples · 4 groups" [active] [ref=e111] [cursor=pointer]
        - paragraph [ref=e112]: Preserved in this browser. Not saved in AQM. Saved form authoring offers only published saved groups.
        - generic [ref=e113]:
          - strong [ref=e114]: Identity & Security Verification · v1
          - paragraph [ref=e115]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e116] [cursor=pointer]
          - button "Save as AQM draft" [ref=e117] [cursor=pointer]
        - generic [ref=e118]:
          - strong [ref=e119]: Customer Experience / Empathy · v1
          - paragraph [ref=e120]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e121] [cursor=pointer]
          - button "Save as AQM draft" [ref=e122] [cursor=pointer]
        - generic [ref=e123]:
          - strong [ref=e124]: Resolution & Next Steps · v1
          - paragraph [ref=e125]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e126] [cursor=pointer]
          - button "Save as AQM draft" [ref=e127] [cursor=pointer]
        - generic [ref=e128]:
          - strong [ref=e129]: Call Closing · v1
          - paragraph [ref=e130]: Not saved in AQM · local copy
          - button "Export local JSON" [ref=e131] [cursor=pointer]
          - button "Save as AQM draft" [ref=e132] [cursor=pointer]
```