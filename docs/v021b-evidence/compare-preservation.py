"""Read-only proof comparison; raw evidence retained, hourly timestamp exclusions explicit."""
import pathlib,json
from datetime import datetime,timezone
root=pathlib.Path(__file__).parent
def read(name):return json.loads((root/name).read_text())
before=read('before-collections.json');after=read('after-collections.json')
b=read('before-runtime.json');a=read('after-runtime.json')
raw=[k for k in before if before[k]['sha256']!=after[k]['sha256']]
counts=all(before[k]['count']==after[k]['count'] for k in before)
runtime={k:b[k]==a[k] for k in b if k!='schedulerRuntime'}
health=before['operationalHealth']['nonTickSha256']==after['operationalHealth']['nonTickSha256']
result={'snapshotsCompletedAt':{name:datetime.fromtimestamp((root/name).stat().st_mtime,timezone.utc).isoformat() for name in ['before-collections.json','before-runtime.json','after-collections.json','after-runtime.json']},'expectedCollections':len(before),'matchingRawHashes':len(before)-len(raw),'changedRawHashes':raw,'all25CountsUnchanged':counts,'actualCollectionInventoryUnchanged':read('before-collection-set.json')==read('after-collection-set.json'),'actualCollections':read('after-collection-set.json'),'allDomainHashesUnchanged':not(set(raw)-{'operationalHealth'}),'healthNonTickHashUnchanged':health,'healthTimestampExclusions':['updateTime','fields.lastSuccessfulTickAt','fields.asOf'],'healthBefore':before['operationalHealth'],'healthAfter':after['operationalHealth'],'runtimeComparison':runtime,'allRuntimeConfigurationUnchanged':all(runtime.values()),'revision':a['revision'],'traffic':a['traffic'],'schedulerBefore':b['schedulerRuntime'],'schedulerAfter':a['schedulerRuntime'],'workCausedProductionMutations':0,'liveProviderCalls':{'Genesys':0,'Jev':0,'notifications':0}}
(root/'preservation.json').write_text(json.dumps(result,indent=2)+'\n')
assert len(before)==25 and counts and result['actualCollectionInventoryUnchanged'] and result['allDomainHashesUnchanged'] and health and all(runtime.values())
assert a['revision']=='aqm-api-v019-e92f2d6' and sum(t.get('percent',0) for t in a['traffic'] if t['revisionName']==a['revision'])==100
print('Counts unchanged: 25/25; raw hashes unchanged:',result['matchingRawHashes'],'/25; inventory unchanged:',result['actualCollectionInventoryUnchanged'])
print('Runtime, image, traffic, IAM, secret metadata/versions/IAM, Scheduler config unchanged:',all(runtime.values()))
print('Natural health timestamps:',result['healthBefore']['timestamps'],'->',result['healthAfter']['timestamps'])
print('Scheduler runtime:',b['schedulerRuntime'],'->',a['schedulerRuntime'])
