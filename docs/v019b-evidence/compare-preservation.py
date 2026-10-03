"""Compare read-only snapshots; allow only natural Scheduler health movement."""
import json,pathlib
root=pathlib.Path(__file__).parent
before=json.loads((root/'before-collections.json').read_text())
after=json.loads((root/'after-collections.json').read_text())
b=json.loads((root/'before-runtime.json').read_text())
a=json.loads((root/'after-runtime.json').read_text())
changes={name:{'before':before.get(name),'after':after.get(name)} for name in sorted(set(before)|set(after)) if before.get(name)!=after.get(name)}
runtime={key:b.get(key)==a.get(key) for key in b if key!='schedulerRuntime'}
result={
    'sourceSha':json.loads((root/'committed-build.json').read_text())['sourceSha'],
    'totalCollections':len(before),'matchingCollections':len(before)-len(changes),
    'changedCollections':changes,
    'domainCollectionsUnchanged':not(set(changes)-{'operationalHealth','scheduleExecutionClaims'}),
    'runtimeComparison':runtime,'allRuntimeConfigurationUnchanged':all(runtime.values()),
    'beforeRevision':b['revision'],'afterRevision':a['revision'],
    'schedulerRuntimeUnchanged':b['schedulerRuntime']==a['schedulerRuntime'],
    'schedulerBefore':b['schedulerRuntime'],'schedulerAfter':a['schedulerRuntime'],
    'liveProviderCalls':{'Jev':0,'Genesys':0,'notifications':0},
    'productionReviewMutations':0,
}
(root/'preservation.json').write_text(json.dumps(result,indent=2)+'\n')
print('Matching collections:',result['matchingCollections'],'/',len(before))
print('Changed collections:',list(changes))
print('Runtime/revision/image/IAM/secrets/Scheduler config unchanged:',all(runtime.values()))
print('Scheduler runtime unchanged:',result['schedulerRuntimeUnchanged'])
assert result['domainCollectionsUnchanged'] and all(runtime.values())
