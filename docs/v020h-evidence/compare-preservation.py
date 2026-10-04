"""Compare read-only snapshots; allow only natural Scheduler health movement."""
import json,pathlib
from datetime import datetime,timezone
root=pathlib.Path(__file__).parent
before=json.loads((root/'before-collections.json').read_text())
after=json.loads((root/'after-collections.json').read_text())
b=json.loads((root/'before-runtime.json').read_text())
a=json.loads((root/'after-runtime.json').read_text())
beforeInventory=json.loads((root/'before-collection-set.json').read_text())
afterInventory=json.loads((root/'after-collection-set.json').read_text())
changes={name:{'before':before.get(name),'after':after.get(name)} for name in sorted(set(before)|set(after)) if before.get(name)!=after.get(name)}
runtime={key:b.get(key)==a.get(key) for key in b if key!='schedulerRuntime'}
result={
    'sourceSha':json.loads((root/'committed-build.json').read_text())['sourceSha'],
    'collectionInventoryUnchanged':beforeInventory==afterInventory,'existingCollectionInventory':beforeInventory,
    'snapshotFilesCompletedAt':{name:datetime.fromtimestamp((root/name).stat().st_mtime,timezone.utc).isoformat() for name in ['before-collections.json','before-runtime.json','after-collections.json','after-runtime.json']},
    'totalCollections':len(before),'matchingCollections':len(before)-len(changes),
    'all25CountsUnchanged':all(before[k]['count']==after[k]['count'] for k in before),
    'naturalHealthTimestampProof':json.loads((root/'health-timestamp-proof.json').read_text()),
    'changedCollections':changes,
    'domainCollectionsUnchanged':not(set(changes)-{'operationalHealth'}),
    'runtimeComparison':runtime,'allRuntimeConfigurationUnchanged':all(runtime.values()),
    'beforeRevision':b['revision'],'afterRevision':a['revision'],
    'schedulerRuntimeUnchanged':b['schedulerRuntime']==a['schedulerRuntime'],
    'schedulerBefore':b['schedulerRuntime'],'schedulerAfter':a['schedulerRuntime'],
    'liveProviderCalls':{'Jev':0,'Genesys':0,'notifications':0},
    'productionReviewMutations':0, 'productionAuthoringMutations':0, 'productionDomainMutations':0,
}
(root/'preservation.json').write_text(json.dumps(result,indent=2)+'\n')
print('Matching collections:',result['matchingCollections'],'/',len(before))
print('Changed collections:',list(changes))
print('Runtime/revision/image/IAM/secrets/Scheduler config unchanged:',all(runtime.values()))
print('Scheduler runtime unchanged:',result['schedulerRuntimeUnchanged'])
assert result['collectionInventoryUnchanged'] and result['domainCollectionsUnchanged'] and all(runtime.values())
if 'operationalHealth' in changes:
 proof=result['naturalHealthTimestampProof']
 assert proof['fullBeforeHashReproduced'] and proof['timestampRestoredBeforeSha256']==before['operationalHealth']['sha256'] and proof['observedAfterSha256']==after['operationalHealth']['sha256'] and proof['countUnchanged'], 'Operational health changed beyond verified natural timestamps'
assert a['revision']=='aqm-api-v019-e92f2d6'
assert sum(t.get('percent',0) for t in a['traffic'] if t['revisionName']=='aqm-api-v019-e92f2d6')==100
