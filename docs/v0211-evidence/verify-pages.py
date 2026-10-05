"""Compare complete remote Pages tree and HTTP bytes to the tested archive build."""
import pathlib,subprocess,hashlib,json,urllib.request,sys
root=pathlib.Path(__file__).resolve().parents[2]
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
def digest(b):return hashlib.sha256(b).hexdigest()
head=git('rev-parse','origin/gh-pages').decode().strip()
paths=git('ls-tree','-r','--name-only',head).decode().splitlines()
expected=json.loads((root/'docs/v0211-evidence/committed-build.json').read_text())['outputs']
assert set(paths)==set(expected) and len(paths)==12
rows={}
for path in paths:
 tree=git('show',f'{head}:{path}')
 assert digest(tree)==expected[path],path
 req=urllib.request.Request('https://simonridd.github.io/Genesys-aqm/'+path,headers={'Cache-Control':'no-cache'})
 with urllib.request.urlopen(req) as response:public=response.read()
 assert public==tree,f'Public bytes differ: {path}'
 rows[path]={'sha256':digest(public),'bytes':len(public),'treeEqualsTestedBuild':True,'publicEqualsTree':True}
result={'testedSourceSha':'43bc67f459508f8b319b093774bdd816ab6592a2','pagesHead':head,'pagesTree':git('rev-parse',head+'^{tree}').decode().strip(),'completeTreePathsMatchBuild':True,'publicFiles':len(rows),'allPublicBytesEqualTestedBuild':True,'files':rows}
(root/'docs/v0211-evidence/pages.json').write_text(json.dumps(result,indent=2)+'\n')
print('Pages HEAD',head,'— 12/12 tree and actual public files equal tested build byte-for-byte.')
