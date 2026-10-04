# Read-only runtime configuration proof. Values/secrets stay in memory; only hashes are saved.
import subprocess,json,hashlib,sys
project='genesys-aqm-2026'
def call(*args):return json.loads(subprocess.check_output(['gcloud',*args,'--project='+project,'--format=json'],text=True))
def digest(value):return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
service=call('run','services','describe','aqm-api','--region=europe-west2')
spec=service['spec']['template']['spec'];image=spec['containers'][0]['image']
configuration=json.loads(json.dumps(spec));configuration['containers'][0].pop('image',None)
job=call('scheduler','jobs','describe','aqm-hourly','--location=europe-west2')
scheduler_config={k:v for k,v in job.items() if k not in ['lastAttemptTime','status','scheduleTime','userUpdateTime']}
secrets={}
for name in ['aqm-genesys-client-id','aqm-genesys-client-secret','aqm-jev-api-key']:
 secrets[name]={'metadata':digest(call('secrets','describe',name)),'versions':digest(call('secrets','versions','list',name)),'iam':digest(call('secrets','get-iam-policy',name))}
result={'revision':service['status']['latestReadyRevisionName'],'image':image,'runtimeConfigSha256':digest(configuration),'serviceIamSha256':digest(call('run','services','get-iam-policy','aqm-api','--region=europe-west2')),'schedulerConfigSha256':digest(scheduler_config),'schedulerRuntime':{k:job.get(k) for k in ['lastAttemptTime','scheduleTime','status']},'secrets':secrets}
json.dump(result,open(sys.argv[1],'w'),indent=2)
print('Captured runtime configuration hashes, revision and Scheduler runtime.')
