"""Compare backend bundles compiled from matching relative source entry points."""
from pathlib import Path
import hashlib,json,subprocess,tempfile
root=Path(__file__).resolve().parents[2]
base='b4a7212cc3480013e7a04d38f7b2120c51c600a2'
assert not subprocess.check_output(['git','diff',base,'--','src/server'],cwd=root), 'Backend source changed'
esbuild=root/'node_modules/.bin/esbuild'
with tempfile.TemporaryDirectory(prefix='aqm-v018a-backend-') as directory:
    baseline=Path(directory)
    archive=subprocess.Popen(['git','archive',base,'src','tsconfig.json','package.json'],cwd=root,stdout=subprocess.PIPE)
    subprocess.run(['tar','-x','-C',directory],stdin=archive.stdout,check=True)
    archive.stdout.close()
    if archive.wait():raise RuntimeError('Baseline archive failed')
    results={}
    for entry in ['main','releaseProof','digitalProof','seedGroupAssets']:
        contents=[]
        for checkout in [baseline,root]:
            output=baseline/f'{entry}-{len(contents)}.mjs'
            subprocess.run([str(esbuild),f'src/server/{entry}.ts','--bundle','--platform=node','--format=esm','--packages=external',f'--outfile={output}'],cwd=checkout,check=True,stdout=subprocess.DEVNULL)
                    contents.append(output.read_bytes())
        if contents[0]!=contents[1]:raise RuntimeError(f'Backend bundle changed: {entry}')
        results[entry]={'equal':True,'sha256':hashlib.sha256(contents[1]).hexdigest()}
    (root/'docs/v018a-evidence/backend.json').write_text(json.dumps({'base':base,'serverSourcesUnchanged':True,'bundleComparison':results},indent=2)+'\n')
