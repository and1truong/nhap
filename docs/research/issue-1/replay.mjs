import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
const root=dirname(new URL(import.meta.url).pathname);
const require=createRequire(resolve(process.env.NHAP_REPO || root,'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
await page.goto(pathToFileURL(resolve(root,'nhap-baseline.html')).href);
await page.evaluate(()=>localStorage.clear()); await page.reload();
const editor=page.locator('#editor');
const corpus=JSON.parse(await readFile(resolve(root,'corpus.json'),'utf8'));
const rows=[];
for(const c of corpus.cases) {
  await editor.fill(''); await editor.pressSequentially(c.raw);
  const live=await editor.inputValue(); await editor.press('Space');
  const committed=(await editor.inputValue()).slice(0,-1);
  const row={...c,nhap:{live,committed,match:committed===c.expected},engines:{}};
  for(const binary of ['xunikey-replay','unikey-replay','openkey-replay']) for(const [label,spell,restore] of [['raw',0,0],['checked',1,0],['restore',1,1]]) {
    const child=spawnSync(resolve(root,binary),[c.raw+' ',String(spell),String(restore)],{encoding:'utf8'});
    if(child.status!==0) throw Error(`${binary} ${c.id}: ${child.status} ${child.stderr}`);
    const beforeCommit=spawnSync(resolve(root,binary),[c.raw,String(spell),String(restore)],{encoding:'utf8'});
    if(beforeCommit.status!==0) throw Error(`${binary} ${c.id}: ${beforeCommit.status} ${beforeCommit.stderr}`);
    const output=child.stdout.slice(0,-1);
    row.engines[`${binary}:${label}`]={live:beforeCommit.stdout,output,match:output===c.expected};
  }
  rows.push(row);
}
await writeFile(resolve(root,'results.json'),JSON.stringify({environment:{browser:browser.version(),node:process.version,platform:process.platform,nhapCommit:'54c97eb3b720439d5b519f80059bb261f2d3725d',measurement:'Nháp real Chromium DOM keyboard events; other engines portable C++ cores. No native OS IME integration tested.'},rows},null,2));
const summary={};
for(const group of new Set(rows.map(r=>r.group))) {
  const subset=rows.filter(r=>r.group===group);
  summary[group]={count:subset.length,nhapMismatches:subset.filter(r=>!r.nhap.match).length};
  for(const name of Object.keys(rows[0].engines)) summary[group][name]=subset.filter(r=>!r.engines[name].match).length;
}
await writeFile(resolve(root,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
await browser.close();
