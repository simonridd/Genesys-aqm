import json,pathlib
root=pathlib.Path(__file__).parent
def read(name):return json.loads((root/name).read_text())
a,b=read('before-collections.json'),read('after-collections.json')
c,d=read('before-runtime.json'),read('after-runtime.json')
collections={key:{'countBefore':value['count'],'countAfter':b[key]['count'],'equal':value['count']==b[key]['count'] and value['sha256']==b[key]['sha256']} for key,value in a.items()}
result={'sourceSha':'11e8e36ebcc00a079a0e5dc3663d261def5c400f','collections':collections,'allCollectionsEqual':all(v['equal'] for v in collections.values()),'changedCollections':[k for k,v in collections.items() if not v['equal']],'runtimeConfigEqual':c['runtimeConfigSha256']==d['runtimeConfigSha256'],'serviceIamEqual':c['serviceIamSha256']==d['serviceIamSha256'],'schedulerConfigEqual':c['schedulerConfigSha256']==d['schedulerConfigSha256'],'secretsMetadataVersionsAndIamEqual':c['secrets']==d['secrets'],'schedulerRuntimeEqual':c['schedulerRuntime']==d['schedulerRuntime'],'schedulerRuntimeBefore':c['schedulerRuntime'],'schedulerRuntimeAfter':d['schedulerRuntime'],'revisionBefore':c['revision'],'revisionAfter':d['revision'],'imageAfter':d['image']}
if 'operationalHealth' in result['changedCollections']:result['naturalHealthTimestamps']={'before':a['operationalHealth'].get('timestamps'),'after':b['operationalHealth'].get('timestamps')}
(root/'preservation.json').write_text(json.dumps(result,indent=2))
print('Collection preservation:',sum(v['equal'] for v in collections.values()),'/',len(collections),'changed:',result['changedCollections'])
print('Runtime/IAM/Scheduler/Secret Manager unchanged:',all(result[k] for k in ['runtimeConfigEqual','serviceIamEqual','schedulerConfigEqual','secretsMetadataVersionsAndIamEqual']))
