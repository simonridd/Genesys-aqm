"""Read public Pages bytes and compare to the tested local build."""
import hashlib,json,subprocess,urllib.request,urllib.error
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source='fd26f4dad3a8ee666feaadf9cb7ba277f8c9cb9a'
site='https://simonridd.github.io/Genesys-aqm/'
files=sorted(path.relative_to(root/'dist').as_posix() for path in (root/'dist').rglob('*') if path.is_file())
proof={'source':source,'pagesHead':subprocess.check_output(['git','ls-remote','origin','refs/heads/gh-pages'],cwd=root,text=True).split()[0],'site':site,'files':{}}
for relative in files:
    local=(root/'dist'/relative).read_bytes()
    try:
        with urllib.request.urlopen(urllib.request.Request(site+relative+'?v='+source,headers={'Cache-Control':'no-cache'})) as response:remote=response.read()
        equal=remote==local
        proof['files'][relative]={'equal':equal,'localSha256':hashlib.sha256(local).hexdigest(),'remoteSha256':hashlib.sha256(remote).hexdigest()}
    except urllib.error.HTTPError as error:proof['files'][relative]={'equal':False,'httpStatus':error.code}
proof['allEqual']=all(value['equal'] for value in proof['files'].values())
(root/'docs/v018a-evidence/pages.json').write_text(json.dumps(proof,indent=2)+'\n')
print(json.dumps({'pagesHead':proof['pagesHead'],'allEqual':proof['allEqual'],'files':len(proof['files'])}))
if not proof['allEqual']:raise SystemExit(1)
