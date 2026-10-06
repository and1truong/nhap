import {createRequire} from 'node:module';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const root=dirname(new URL(import.meta.url).pathname);
const require=createRequire(resolve(process.env.NHAP_REPO||root,'package.json'));
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||'/tmp/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
const scenarios=[
 ['escape-active',[['type','list'],['key','Escape']], 'list'],
 ['escape-continued',[['type','lis'],['key','Escape'],['type','t']], 'list'],
 ['escape-next-word',[['type','list'],['key','Escape'],['type',' his']], 'list hí'],
 ['escape-after-space',[['type','list '],['key','Escape']], 'list '],
 ['escape-before-first-letter',[['key','Escape'],['type','list']], 'list'],
 ['toggle-after-conversion',[['type','list'],['key','F2']], 'list'],
 ['toggle-before',[['key','F2'],['type','list class foo']], 'list class foo'],
 ['toggle-back-midword',[['key','F2'],['type','lis'],['key','F2'],['type','t']], 'list'],
 ['escape-url-local-only',[['type','https://github'],['key','Escape'],['type','.com/list']], 'https://github.com/list'],
 ['pasted-url',[['paste','https://example.com/list']], 'https://example.com/list'],
 ['pasted-url-append',[['paste','https://example.com/li'],['type','st']], 'https://example.com/list'],
 ['escape-click-continue',[['type','lis'],['key','Escape'],['click','end'],['type','t']], 'list'],
 ['restore-undo-redo',[['type','list'],['key','Escape'],['key','Control+z'],['key','Control+Shift+z']], 'list'],
 ['repeat-list',[['type','lisst']], 'list'],
 ['repeat-guitar',[['type','guitarr']], 'guitar'],
 ['repeat-last-wrong-position',[['type','lasts']], 'last'],
 ['repeat-last-right-position',[['type','lasst']], 'last'],
 ['repeat-last-escape-raw',[['type','lasst'],['key','Escape']], 'lasst'],
 ['macro-in-inline-code',[['type','`;vn ']], '`;vn '],
 ['macro-in-fence',[['type','```\n;vn ']], '```\n;vn '],
 ['macro-in-English',[['key','F2'],['type',';vn ']], ';vn '],
 ['native-Vietnamese-paste',[['paste','Tiếng Việt']], 'Tiếng Việt'],
 ['Vietnamese-in-code',[['type','`tieengs Vieetj`']], '`tiếng Việt`'],
 ['composition-ascii',[['compose','list']], 'list'],
 ['composition-native',[['compose','Tiếng']], 'Tiếng'],
];
const results=[];
for(const [id,actions,expected] of scenarios) {
 const page=await browser.newPage(); await page.goto(pathToFileURL(resolve(root,'nhap-baseline.html')).href);
 const editor=page.locator('#editor'); await editor.focus(); const trace=[];
 for(const [kind,value] of actions) {
  if(kind==='type') await editor.pressSequentially(value);
  if(kind==='key') await editor.press(value);
  if(kind==='paste') await page.keyboard.insertText(value);
  if(kind==='click') {await editor.click();await editor.evaluate(el=>el.setSelectionRange(el.value.length,el.value.length));}
  if(kind==='compose') {
    await editor.evaluate((el,value)=>{el.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));el.value=value;el.setSelectionRange(value.length,value.length);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertCompositionText',data:value,isComposing:true}));el.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true,data:value}));el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:value}));},value);
    await page.waitForTimeout(20);
  }
  trace.push({kind,value,text:await editor.inputValue(),caret:await editor.evaluate(el=>[el.selectionStart,el.selectionEnd]),telex:await page.locator('#vi-mode').getAttribute('aria-pressed')});
 }
 const actual=await editor.inputValue();results.push({id,actions,expected,actual,match:actual===expected,trace,expectedIs:'Policy probe expectation; mismatch is not automatically a defect in current documented policy.'});
 await page.close();
}
await writeFile(resolve(root,'action-results.json'),JSON.stringify({environment:{browser:browser.version(),platform:process.platform,composition:'Synthetic event injection, not OS IME evidence'},results},null,2));
console.log(results.map(({id,expected,actual,match})=>({id,expected,actual,match})));
await browser.close();
