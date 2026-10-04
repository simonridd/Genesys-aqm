import json,pathlib,subprocess
root=pathlib.Path(__file__).parent;repo=root.parents[1]
base='c40bd3e09672995bc2d126e5b6b7433926599ad8'
old=subprocess.check_output(['git','show',base+':src/showcase/economics.ts'],cwd=repo,text=True)
new=(repo/'src/showcase/economics.ts').read_text()
assert old==new[:len(old)], 'Existing estimator, preset, bounds and price import changed'
checks=[]
for size in ['1440x900','1920x1080','390x844','1440x720']:
 for scenario in ['default','tiny']:
  b=json.loads((root/f'before/{scenario}-{size}.json').read_text());a=json.loads((root/f'after/{scenario}-{size}.json').read_text())
  fields=['inputs','cost','metrics'];assert all(b[k]==a[k] for k in fields)
  checks.append({'scenario':scenario,'viewport':size,'identicalFields':fields,'cost':a['cost'],'metrics':a['metrics']})
geometry=[]
for size in ['1440x900','1920x1080','390x844','1440x720']:
 b=json.loads((root/f'before/default-closed-{size}.json').read_text());a=json.loads((root/f'after/default-closed-{size}.json').read_text())
 geometry.append({'viewport':size,'beforeHeight':b['geometry']['height'],'afterHeight':a['geometry']['height'],'increase':a['geometry']['height']-b['geometry']['height'],'overflow':a['overflow']})
(root/'numerical-equality.json').write_text(json.dumps({'estimatorPresetBoundsByteIdentical':True,'default':{'selected':50000,'evaluations':50000,'requests':50000,'tokens':400000000,'cost':16.8},'tiny':{'selected':0,'evaluations':0,'requests':0,'tokens':0,'cost':0},'captures':checks,'defaultResultGeometry':geometry},indent=2)+'\n')
print('Estimator unchanged; 8 before/after default/tiny captures equal. Geometry:',geometry)
