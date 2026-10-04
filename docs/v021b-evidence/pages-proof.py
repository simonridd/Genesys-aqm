# Read-only public asset comparison; no authentication or API writes.
import pathlib,urllib.request,urllib.error,hashlib,json,subprocess,sys,time
root=pathlib.Path(sys.argv[3]) if len(sys.argv)>3 else pathlib.Path('dist');repo=pathlib.Path(__file__).resolve().parents[2];base='https://simonridd.github.io/Genesys-aqm/'
source=sys.argv[2]
files=[p for p in root.rglob('*') if p.is_file()]
results=[]
for path in files:
 relative=path.relative_to(root).as_posix();local=path.read_bytes();remote=None
 for attempt in range(12):
  try:
   with urllib.request.urlopen(base+relative+'?v021b='+source,timeout=20) as response:remote=response.read()
   if remote==local:break
  except urllib.error.HTTPError as error:
   if error.code!=404:raise
  time.sleep(5)
 results.append({'path':relative,'sha256':hashlib.sha256(local).hexdigest(),'remoteSha256':hashlib.sha256(remote).hexdigest() if remote is not None else None,'equal':remote==local})
head=subprocess.check_output(['git','-C',str(repo),'ls-remote','origin','refs/heads/gh-pages'],text=True).split()[0]
tracked=subprocess.check_output(['git','-C',str(repo),'ls-tree','-r','--name-only',head],text=True).splitlines()
local_paths=sorted(p.relative_to(root).as_posix() for p in files)
assert len(files)==12, 'Expected exactly 12 qualified public files.'
assert sorted(tracked)==local_paths, 'Pages tree differs from committed build files.'
assert all(subprocess.check_output(['git','-C',str(repo),'show',head+':'+relative])==(root/relative).read_bytes() for relative in tracked)
json.dump({'pagesGitTreeMatchesBuild':True,'pagesTreeSha':subprocess.check_output(['git','-C',str(repo),'rev-parse',head+'^{tree}'],text=True).strip(),'buildRoot':str(root),'publicFileCount':len(files),'unexpectedPagesFiles':[],'sourceSha':source,'pagesHead':head,'url':base,'allBytesEqual':all(r['equal'] for r in results),'files':results},open(sys.argv[1],'w'),indent=2)
print('Pages files verified:',len(results),'all match:',all(r['equal'] for r in results),'HEAD:',head)
if not all(r['equal'] for r in results):sys.exit(1)
