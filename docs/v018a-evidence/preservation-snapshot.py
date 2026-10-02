import json, subprocess, urllib.request, urllib.parse, sys, hashlib
project='genesys-aqm-2026'
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
root=f'https://firestore.googleapis.com/v1/projects/{project}/databases/(default)/documents'
collections=['policies','schedules','policyRuns','evaluationRecords','humanReviews','evaluationForms','questionGroupAssets','roleAssignments','governanceSettings','operationalAlerts','notificationDestinations','notificationRules','operationalHealth','scheduleExecutionClaims','evaluationSlots','auditEvents','notificationDeliveries','notificationEvents','notificationDestinationHealth','notificationControl','operationalAlertKeys','formTestRuns','purgePlans']
data={}
for collection in collections:
    documents=[]; page=''
    while True:
        url=f'{root}/{collection}?pageSize=100'+('&pageToken='+urllib.parse.quote(page) if page else '')
        with urllib.request.urlopen(urllib.request.Request(url,headers={'Authorization':'Bearer '+token})) as response: result=json.load(response)
        documents.extend(result.get('documents',[]));page=result.get('nextPageToken','')
        if not page: break
    documents.sort(key=lambda d:d['name'])
    data[collection]={'count':len(documents),'sha256':hashlib.sha256(json.dumps(documents,sort_keys=True,separators=(',',':')).encode()).hexdigest()}
    if collection=='operationalHealth':
        data[collection]['timestamps']=[{'updatedAt':d.get('updateTime'),'lastSuccessfulTickAt':d.get('fields',{}).get('lastSuccessfulTickAt',{}).get('stringValue')} for d in documents]
# Never save document contents, identifiers, tokens, or personal information.
json.dump(data,open(sys.argv[1],'w'),indent=2)
print('Captured production counts and hashes only for',len(collections),'collections.')
