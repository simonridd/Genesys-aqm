"""Read-only proof of the hourly tick: restore only known timestamps and match the full before hash.

The inherited snapshot normalization omitted review SLA's asOf timestamp.
Reconstruct its old millisecond value inside the recorded tick/update window by
matching the original full hash. Save hashes/timestamps only; documents stay in memory.
"""
import json,pathlib,subprocess,urllib.request,hashlib,copy
from datetime import datetime,timedelta
root=pathlib.Path(__file__).parent
before=json.loads((root/'before-collections.json').read_text())['operationalHealth']
after=json.loads((root/'after-collections.json').read_text())['operationalHealth']
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
url='https://firestore.googleapis.com/v1/projects/genesys-aqm-2026/databases/(default)/documents/operationalHealth?pageSize=100'
with urllib.request.urlopen(urllib.request.Request(url,headers={'Authorization':'Bearer '+token})) as response:documents=json.load(response)['documents']
documents.sort(key=lambda d:d['name'])
def digest(docs):return hashlib.sha256(json.dumps(docs,sort_keys=True,separators=(',',':')).encode()).hexdigest()
assert len(documents)==before['count']==after['count']==2
assert digest(documents)==after['sha256'], 'Health changed since after snapshot; capture again explicitly'
old=copy.deepcopy(documents)
for doc,timestamp in zip(old,before['timestamps']):
 doc['updateTime']=timestamp['updatedAt']
 if 'lastSuccessfulTickAt' in doc['fields']:
  doc['fields']['lastSuccessfulTickAt']['stringValue']=timestamp['lastSuccessfulTickAt']
review=next(d for d in old if 'asOf' in d['fields'])
new_asof=next(d for d in documents if 'asOf' in d['fields'])['fields']['asOf']['stringValue']
start=datetime.fromisoformat(next(t['lastSuccessfulTickAt'] for t in before['timestamps'] if t['lastSuccessfulTickAt']).replace('Z','+00:00'))
end=datetime.fromisoformat(review['updateTime'].replace('Z','+00:00'))
matched=None
for step in range(int((end-start).total_seconds()*1000)+2):
 timestamp=(start+timedelta(milliseconds=step)).isoformat(timespec='milliseconds').replace('+00:00','Z')
 review['fields']['asOf']['stringValue']=timestamp
 if digest(old)==before['sha256']:
  matched=timestamp;break
assert matched, 'Cannot reproduce full before hash by timestamp-only substitutions'
result={'originalBeforeSha256':before['sha256'],'observedAfterSha256':after['sha256'],'timestampRestoredBeforeSha256':digest(old),'fullBeforeHashReproduced':True,'countUnchanged':True,'changedFieldsOnly':['updateTime','lastSuccessfulTickAt','asOf'],'reviewSlaAsOfBefore':matched,'reviewSlaAsOfAfter':new_asof,'method':'Restore recorded updateTime and scheduler lastSuccessfulTickAt; find old asOf millisecond within recorded tick/update window by exact full SHA-256 match. No other field changed.'}
(root/'health-timestamp-proof.json').write_text(json.dumps(result,indent=2)+'\n')
print('Exact original health hash reproduced using only hourly timestamps:',matched,'->',new_asof)
