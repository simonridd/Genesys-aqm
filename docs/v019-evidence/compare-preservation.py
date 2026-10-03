import json,pathlib
root=pathlib.Path(__file__).parent
before=json.loads((root/'before-collections.json').read_text());after=json.loads((root/'after-collections.json').read_text())
b=json.loads((root/'before-runtime.json').read_text());a=json.loads((root/'after-runtime.json').read_text())
changed={k:{'before':before.get(k),'after':after.get(k)} for k in sorted(set(before)|set(after)) if before.get(k)!=after.get(k)}
configuration={k:b.get(k)==a.get(k) for k in b if k not in ['revision','image','schedulerRuntime']}
result={'sourceSha':'e92f2d69c1d4cbe691f7e0ee82ea764ffb8e80af','matchingCollections':len(before)-len(changed),'totalCollections':len(before),'changedCollections':changed,'beforeCollections':before,'afterCollections':after,'runtimeComparison':configuration,'beforeRevision':b['revision'],'afterRevision':a['revision'],'schedulerRuntimeUnchanged':b['schedulerRuntime']==a['schedulerRuntime'],'schedulerBefore':b['schedulerRuntime'],'schedulerAfter':a['schedulerRuntime'],'answerSetAssetsBefore':before['answerSetAssets']['count'],'answerSetAssetsAfter':after['answerSetAssets']['count'],'answerSetFamiliesBefore':before['answerSetFamilies']['count'],'answerSetFamiliesAfter':after['answerSetFamilies']['count']}
(root/'preservation.json').write_text(json.dumps(result,indent=2)+'\n')
print('Matching collection counts/hashes:',result['matchingCollections'],'/',len(before));print('Changed collections:',list(changed));print('Runtime/IAM/secrets/Scheduler configuration unchanged:',all(configuration.values()));print('Scheduler runtime unchanged:',result['schedulerRuntimeUnchanged'])
assert result['answerSetAssetsBefore']==result['answerSetAssetsAfter']==0 and result['answerSetFamiliesBefore']==result['answerSetFamiliesAfter']==0
assert all(configuration.values())
assert set(changed)<=set(['operationalHealth','scheduleExecutionClaims'])
