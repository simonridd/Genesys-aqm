"""Compare captured canonical/current counts and domain rates without recomputing them."""
import json,pathlib,collections
root=pathlib.Path(__file__).parent
results=[]
for width in [1440,390]:
 height=900 if width==1440 else 844
 before=json.loads((root/f'before/numbers-{width}.json').read_text())
 after=json.loads((root/f'after/mixed-numbers-{width}x{height}.json').read_text())
 keys=['candidate','eligible','sampled','evaluable','evaluated','failed','samplingCoverage','transcriptAvailability','sampleCompletion','evaluationCoverage']
 a={k:before['totals'][k] for k in keys};b={k:after['totals'][k] for k in keys}
 result={'viewport':f'{width}x{height}','before':a,'after':b,'allValuesExactlyEqual':a==b,'stepsExactlyEqual':before['steps']==after['steps'],'apiRequestCountsExactlyEqual':collections.Counter(before['apiRequests'])==collections.Counter(after['apiRequests'])}
 assert all(result[k] for k in ['allValuesExactlyEqual','stepsExactlyEqual','apiRequestCountsExactlyEqual'])
 results.append(result)
(root/'numerical-equality.json').write_text(json.dumps(results,indent=2)+'\n')
print('All six counts, four rates, funnel steps and API request counts exactly equal at both captured sizes.')
