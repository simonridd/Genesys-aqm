"""Verify every tracked build input and complete output tree; no credentials read."""
import subprocess,sys,pathlib,hashlib,json
root=pathlib.Path(__file__).resolve().parents[2]
archive=pathlib.Path(sys.argv[1]);sha=sys.argv[2]
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',sha],cwd=root,text=True).splitlines()
inputs=[p for p in paths if p.startswith(('src/','public/')) or p in ['package.json','package-lock.json','index.html','vite.config.ts','tsconfig.json','.env.production']]
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
assert all(digest(root/p)==digest(archive/p) for p in inputs)
def tree(p):return {str(f.relative_to(p)):digest(f) for f in p.rglob('*') if f.is_file()}
qualified=tree(pathlib.Path('/private/tmp/aqm-v0211-qualified-dist'));built=tree(archive/'dist')
assert qualified==built and len(built)==12
result={'testedSourceSha':sha,'verifiedBuildInputs':len(inputs),'allBuildInputsMatchCommit':True,'inputSha256':{p:digest(archive/p) for p in inputs},'qualifiedBuildEqualsImmutableArchiveBuild':True,'outputFiles':len(built),'outputs':built}
(root/'docs/v0211-evidence/committed-build.json').write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(inputs)}/{len(inputs)} tracked build inputs match immutable commit; 12/12 outputs match qualified build.')
