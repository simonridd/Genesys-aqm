# Test info

- Name: role-navigation.spec.ts >> mobile Questions exact drill returns to same view and cohort; Coverage deep link
- Location: ../../../../../../../private/tmp/aqm-v020-clean/tests/role-navigation.spec.ts:65:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.coverage-funnel')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.coverage-funnel') with timeout 5000ms
  - waiting for locator('.coverage-funnel')

```

```yaml
- complementary:
  - img "IPI"
  - strong: IPI AQM
  - text: Automated Quality Management
  - navigation "Primary navigation":
    - group:
      - text: Interactions
      - button "Conversations"
    - group:
      - text: Monitor / Quality
      - button "Analytics"
      - button "Overview"
      - button "Evaluations"
      - button "Calibration"
    - group: Configuration
    - button "Settings"
    - button "About / product tour"
- main:
  - navigation "Breadcrumb":
    - text: Workspace
    - strong: Analytics
  - text: Connect Genesys Cloud
  - button "Sample / browser data"
  - button "Saved AQM analytics"
  - text: QUALITY SIGNALS
  - heading "Analytics" [level=1]
  - paragraph: Quality and coverage from evaluations saved in this browser. Connect to view Saved AQM analytics.
  - button "Load demo analytics data"
  - button "Remove prepared demo evaluations" [disabled]
  - button "Clear local evaluation and run history"
  - text: Show
  - combobox "Show":
    - option "Genesys Cloud" [selected]
    - option "Synthetic / Uploaded"
    - option "All sources"
  - strong: 0 Genesys Jev results
  - text: ·
  - strong: 0 synthetic / other records
  - text: From
  - textbox "From"
  - text: To
  - textbox "To"
  - text: Policy
  - combobox "Policy":
    - option "All policies" [selected]
  - text: Form version
  - combobox "Form version":
    - option "All versions" [selected]
  - text: Agent
  - combobox "Agent":
    - option "All agents" [selected]
  - text: Queue
  - combobox "Queue":
    - option "All queues" [selected]
  - text: Channel
  - combobox "Channel":
    - option "All channels" [selected]
  - text: Trigger
  - combobox "Trigger":
    - option "All" [selected]
    - option "Manual"
    - option "Scheduled"
  - paragraph: Production evaluations only. Coverage uses run observations and follows source, date and policy filters; agent, queue and form filters apply to quality only.
  - text: View
  - combobox "View":
    - option "Overview"
    - option "Agents"
    - option "Queues"
    - option "Forms"
    - option "Groups"
    - option "Questions"
    - option "Coverage" [selected]
  - heading "No monitoring runs for this source" [level=2]
  - paragraph: Coverage will appear after a monitoring policy run.
```

