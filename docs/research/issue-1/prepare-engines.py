"""Fetch pinned research references and build adapters. Requires git, curl, tar, g++."""
from pathlib import Path
import hashlib,subprocess
root=Path(__file__).resolve().parent
deps=root/'references'
deps.mkdir(exist_ok=True)
def run(*args): subprocess.run([str(a) for a in args],check=True,cwd=root)
archive=deps/'x-unikey.tar.bz2'
if not archive.exists(): run('curl','-fL','--max-time','120','https://downloads.sourceforge.net/unikey/x-unikey-1.0.4.tar.bz2','-o',archive)
if hashlib.sha256(archive.read_bytes()).hexdigest()!='aa7dd444853538bcba0f24c4c19692c34d4553a1df213a260c2628a7116b2dd9': raise RuntimeError('X-Unikey archive hash mismatch')
run('tar','--no-same-owner','-xjf',archive,'-C',deps)
def repo(name,url,sha):
    p=deps/name
    if not p.exists(): run('git','clone',url,p)
    run('git','-C',p,'checkout','--detach',sha)
    return p
ibus=repo('ibus-unikey','https://github.com/vn-input/ibus-unikey.git','ede78c312e8c6ed96d0f653a12880d4671c929fe')
ok=repo('openkey','https://github.com/tuyenvm/OpenKey.git','89c2fd3bf258562f2349f89b49d81e2f140c3fc3')
src=deps/'x-unikey-1.0.4'/'src'
flags=['g++','-std=c++11','-O2','-funsigned-char','-fpermissive','-include','cstring']
incs=[f'-I{src/p}' for p in ['ukinterface','ukengine','vnconv','byteio']]
files=[src/'ukinterface'/'unikey.cpp']+[f for p in ['ukengine','vnconv','byteio'] for f in (src/p).glob('*.cpp')]
run(*flags,*incs,root/'unikey-replay.cpp',*files,'-o',root/'xunikey-replay')
uk=ibus/'ukengine'
run('g++','-std=c++11','-O2','-funsigned-char',f'-I{uk}',root/'unikey-replay.cpp',*uk.glob('*.cpp'),'-o',root/'unikey-replay')
engine=ok/'Sources'/'OpenKey'/'engine'
run('g++','-std=c++14','-O2','-include','algorithm',f'-I{engine}',root/'openkey-replay.cpp',*engine.glob('*.cpp'),'-o',root/'openkey-replay')
print('Reference cores built; production Nháp code untouched.')
