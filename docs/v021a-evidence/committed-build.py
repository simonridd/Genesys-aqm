"""Rebuild an immutable Git archive and compare every accepted build input/output."""
import pathlib,subprocess,json,hashlib,sys
repo=pathlib.Path(__file__).resolve().parents[2];out=repo/'docs/v021a-evidence'
source=subprocess.check_output(['git','rev-parse',sys.argv[1] if len(sys.argv)>1 else 'HEAD'],cwd=repo,text=True).strip()
release=pathlib.Path('/private/tmp/aqm-v021a-release');release.mkdir(exist_ok=True)
archive=subprocess.check_output(['git','archive',source],cwd=repo)
subprocess.run(['tar','-x','-C',str(release)],input=archive,check=True)
if not (release/'node_modules').exists(): (release/'node_modules').symlink_to((repo/'node_modules').resolve(),target_is_directory=True)
with (out/'committed-build.txt').open('w') as log:subprocess.run(['npm','run','build'],cwd=release,stdout=log,stderr=subprocess.STDOUT,check=True)
def files(root):return {p.relative_to(root).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in root.rglob('*') if p.is_file()}
accepted=files(repo/'dist');committed=files(release/'dist')
assert len(committed)==12 and accepted==committed
inputs=subprocess.check_output(['git','ls-files','-z','src','public','.env.production','package.json','package-lock.json','vite.config.ts','tsconfig.json','index.html'],cwd=repo).decode().split('\0')
inputs=[p for p in inputs if p];assert all((repo/p).read_bytes()==(release/p).read_bytes() for p in inputs)
base='fadb73dac800cede26389fe883602967cf5b8784'
unchanged=subprocess.check_output(['git','diff','--name-only',base,source,'--','src/domain','src/server'],cwd=repo,text=True).splitlines();assert not unchanged
(out/'committed-build.json').write_text(json.dumps({'sourceSha':source,'acceptedBuildEqualsCommittedArchiveBuild':True,'publicFileCount':len(committed),'buildFiles':committed,'archiveBuildRoot':str(release/'dist')},indent=2)+'\n')
(out/'source-verification.json').write_text(json.dumps({'sourceSha':source,'baseSha':base,'buildInputCount':len(inputs),'allBuildInputsEqualCommittedArchive':True,'unexpectedSourceDifferences':[],'domainAndServerChanges':unchanged},indent=2)+'\n')
print('Verified',len(inputs),'build inputs and',len(committed),'output files for source',source)
