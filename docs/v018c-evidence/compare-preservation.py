import json,pathlib
root=pathlib.Path(__file__).parent
before=json.loads((root/'before-collections.json').read_text());after=json.loads((root/'after-collections.json').read_text())
b=json.loads((root/'before-runtime.json').read_text());a=json.loads((root/'after-runtime.json').read_text())
changed={k:{'before':before.get(k),'after':after.get(k)} for k in before if before[k]!=after.get(k)}
configuration={k:b.get(k)==a.get(k) for k in b if k!='schedulerRuntime'}
result={'matchingCollections':len(before)-len(changed),'totalCollections':len(before),'changedCollections':changed,'runtimeComparison':configuration,'schedulerRuntimeUnchanged':b['schedulerRuntime']==a['schedulerRuntime'],'schedulerBefore':b['schedulerRuntime'],'schedulerAfter':a['schedulerRuntime']}
(root/'preservation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
