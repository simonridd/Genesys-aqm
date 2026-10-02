import json,subprocess,urllib.request,urllib.error,pathlib,hashlib
root=pathlib.Path(__file__).parent
source='11e8e36ebcc00a079a0e5dc3663d261def5c400f'
revision=json.loads(subprocess.check_output(['gcloud','run','revisions','describe','aqm-api-v018b-11e8e36','--project=genesys-aqm-2026','--region=europe-west2','--format=json'],text=True))
remote=subprocess.check_output(['git','ls-remote','origin','refs/heads/main','refs/heads/gh-pages'],text=True)
heads={line.split()[1]:line.split()[0] for line in remote.strip().splitlines()}
checks=[]
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',source,'src','Dockerfile','package.json','package-lock.json'],text=True).splitlines():
 committed=subprocess.check_output(['git','show',source+':'+name]);archived=(pathlib.Path('/private/tmp/aqm-v018b-deploy-11e8e36')/name).read_bytes()
 checks.append(committed==archived)
def request(url):
 try:
  with urllib.request.urlopen(url,timeout=30) as response:return {'status':response.status,'body':json.load(response)}
 except urllib.error.HTTPError as error:return {'status':error.code}
result={'sourceSha':source,'revision':revision['metadata']['name'],'imageDigest':revision['status']['imageDigest'],'ready':any(c.get('type')=='Ready' and c.get('status')=='True' for c in revision['status']['conditions']),'archiveCodeMatchesSourceCommit':all(checks),'mainHead':heads['refs/heads/main'],'pagesHead':heads['refs/heads/gh-pages'],'health':request('https://aqm-api-bd54ukouga-nw.a.run.app/health'),'anonymousEvaluationRequest':request('https://aqm-api-bd54ukouga-nw.a.run.app/api/evaluations?channel=voice&reviewQueue=active')}
(root/'deployment.json').write_text(json.dumps(result,indent=2))
print('Revision ready:',result['ready'],'archive matches source:',all(checks),'health:',result['health']['status'],'anonymous evaluation request:',result['anonymousEvaluationRequest']['status'])
