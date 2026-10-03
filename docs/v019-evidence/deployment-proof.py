# Read-only release proof: no provider call, authenticated Genesys request, or product mutation.
import subprocess,json,pathlib,urllib.request,urllib.error,sys
source=sys.argv[1]
root=pathlib.Path(__file__).parent
release=pathlib.Path('/private/tmp/aqm-v019-release-'+source[:7])
def call(*args):return json.loads(subprocess.check_output(['gcloud',*args,'--project=genesys-aqm-2026','--format=json'],text=True))
revision=call('run','revisions','describe','aqm-api-v019-'+source[:7],'--region=europe-west2')
service=call('run','services','describe','aqm-api','--region=europe-west2')
inputs=json.loads((release/'source.json').read_text())
checks=[]
for kind in ['backend','frontend']:
 for name in subprocess.check_output(['git','ls-tree','-r','--name-only',source,*inputs[kind+'Inputs']],text=True).splitlines():
  checks.append(subprocess.check_output(['git','show',source+':'+name])==(release/kind/name).read_bytes())
def request(url):
 try:
  with urllib.request.urlopen(url,timeout=30) as response:return {'status':response.status,'body':json.load(response)}
 except urllib.error.HTTPError as error:return {'status':error.code}
origin='https://aqm-api-bd54ukouga-nw.a.run.app'
result={'sourceSha':source,'revision':revision['metadata']['name'],'imageDigest':revision['status']['imageDigest'],'ready':any(c.get('type')=='Ready' and c.get('status')=='True' for c in revision['status']['conditions']),'latestReadyRevision':service['status']['latestReadyRevisionName'],'traffic':service['status']['traffic'],'archiveCodeMatchesSourceCommit':all(checks),'health':request(origin+'/health'),'anonymousAnswerSets':request(origin+'/api/answer-sets?limit=1'),'anonymousForms':request(origin+'/api/forms?limit=1'),'authenticatedAuthoringProof':'Provider-free real API / MemoryStore fixtures; no production authoring write.'}
(root/'deployment.json').write_text(json.dumps(result,indent=2)+'\n')
print('Revision ready:',result['ready'],'archive matches source:',all(checks),'health:',result['health']['status'],'anonymous Answer Sets:',result['anonymousAnswerSets']['status'])
assert result['ready'] and all(checks) and result['health']['status']==200 and result['anonymousAnswerSets']['status']==401
