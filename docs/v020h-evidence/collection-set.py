# Read-only Firestore collection inventory; no document contents or credentials saved.
import subprocess,urllib.request,json,sys
root='https://firestore.googleapis.com/v1/projects/genesys-aqm-2026/databases/(default)/documents:listCollectionIds'
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
collections=[];page=''
while True:
 request=urllib.request.Request(root,data=json.dumps({'pageSize':1000,**({'pageToken':page} if page else {})}).encode(),headers={'Authorization':'Bearer '+token,'Content-Type':'application/json'},method='POST')
 with urllib.request.urlopen(request) as response:result=json.load(response)
 collections.extend(result.get('collectionIds',[]));page=result.get('nextPageToken','')
 if not page:break
json.dump(sorted(collections),open(sys.argv[1],'w'),indent=2)
print('Read collection inventory:',len(collections))
