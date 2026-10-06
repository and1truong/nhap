import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const editorURL = pathToFileURL(resolve('dist/index.html')).href;

test.beforeEach(async ({ page }) => {
  await page.goto(editorURL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('Vietnamese Telex, tone placement, case and repeated-key escapes', async ({ page }) => {
  const pairs = {
    tieengs: 'tiếng', Vieetj: 'Việt', dduwowngf: 'đường', dduowngf: 'đường',
    DDUOWNGF: 'ĐƯỜNG', toanfs: 'toán', toansz: 'toan', aaa: 'aa', ddd: 'dd',
    ass: 'as', guitarr: 'guitar', hoaf: 'hòa', hoanf: 'hoàn', quas: 'quá',
    giaf: 'già', gias: 'giá', ngoaif: 'ngoài', nguyeenx: 'nguyễn',
    thuyr: 'thủy', quoocs: 'quốc', tuowngr: 'tưởng', ruowuj: 'rượu',
    huow: 'huơ', thuowr: 'thuở', muowif: 'mười', tuooir: 'tuổi',
  };
  for (const [raw, expected] of Object.entries(pairs)) {
    expect(await page.evaluate(raw => window.GoViet.telex(raw), raw)).toBe(expected);
  }
  expect(await page.evaluate(() => window.GoViet.telex('hoaf', 'modern'))).toBe('hoà');
  await page.locator('#editor').pressSequentially('Tieengs Vieetj dduwowngf');
  await expect(page.locator('#editor')).toHaveValue('Tiếng Việt đường');
});

test('Backspace removes raw input; undo and redo restore edits', async ({ page }) => {
  const editor = page.locator('#editor');
  await editor.pressSequentially('tieengs');
  await editor.press('Backspace');
  await expect(editor).toHaveValue('tiêng');
  await editor.press('Backspace');
  await expect(editor).toHaveValue('tiên');
  await editor.press('Control+z');
  await expect(editor).toHaveValue('tiêng');
  await editor.press('Control+Shift+z');
  await expect(editor).toHaveValue('tiên');
});

test('Editing a selection preserves the surrounding sentence', async ({ page }) => {
  const editor = page.locator('#editor');
  await editor.fill('Hôm nay tôi đi học.');
  await editor.evaluate(el => el.setSelectionRange(8, 11));
  await editor.pressSequentially('banj');
  await expect(editor).toHaveValue('Hôm nay bạn đi học.');
});

test('Escape returns a word to Latin and English disables Telex', async ({ page }) => {
  const editor = page.locator('#editor');
  await editor.pressSequentially('text');
  await editor.press('Escape');
  await editor.pressSequentially('s as');
  await expect(editor).toHaveValue('texts á');
  await page.locator('#en-mode').click();
  await editor.fill('');
  await editor.pressSequentially('text');
  await expect(editor).toHaveValue('text');
});

test('Text replacements trigger on space, punctuation and Enter', async ({ page }) => {
  const editor = page.locator('#editor');
  await editor.pressSequentially(';ty ');
  await expect(editor).toHaveValue('Cảm ơn bạn! ');
  await editor.press('Control+z');
  await expect(editor).toHaveValue(';ty');
  await editor.fill('');
  await editor.pressSequentially(';vn');
  await editor.press('Enter');
  await expect(editor).toHaveValue('Việt Nam\n');
  await editor.fill('');
  await editor.pressSequentially(';vn.');
  await expect(editor).toHaveValue('Việt Nam.');
});

test('Configuration JSON roundtrips and raw macros survive Telex', async ({ page }) => {
  await page.locator('#settings-btn').click();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#export-config').click();
  const download = await downloadEvent;
  const config = JSON.parse(await readFile(await download.path(), 'utf8'));
  config.settings.toneStyle = 'modern';
  config.replacements = [{ trigger: ';as', value: 'Xin chào\nDòng hai', enabled: true }];
  await page.locator('#config-file').setInputFiles({
    name: 'config.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(config)),
  });
  await expect(page.locator('#cfg-tone')).toHaveValue('modern');
  await page.locator('#save-config').click();
  await page.locator('#editor').pressSequentially('hoaf ;as ');
  await expect(page.locator('#editor')).toHaveValue('hoà Xin chào\nDòng hai ');
});

test('Pasted text and native Vietnamese composition are preserved', async ({ page }) => {
  const editor = page.locator('#editor');
  await editor.focus();
  await page.keyboard.insertText('Tieengs Vieetj');
  await expect(editor).toHaveValue('Tieengs Vieetj');
  for (const [raw, expected] of [['tieengs', 'tiếng'], ['Tiếng', 'Tiếng']]) {
    await editor.fill('');
    await editor.evaluate((el, raw) => {
      el.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
      el.value = raw;
      el.setSelectionRange(raw.length, raw.length);
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertCompositionText', data: raw, isComposing: true }));
      el.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: raw }));
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: raw }));
    }, raw);
    await expect(editor).toHaveValue(expected);
  }
});

test('Markdown preview is inert and document import/export preserves content', async ({ page }) => {
  const content = '# Xin chào\n\n**Đậm**\n\n<script>alert(1)</script>\n<img src="https://example.com/leak">\n[x](javascript:alert(1))';
  const requests = [];
  page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
  await page.locator('#text-file').setInputFiles({ name: 'note.md', mimeType: 'text/plain', buffer: Buffer.from(content) });
  await expect(page.locator('#editor')).toHaveValue(content);
  await page.locator('button[data-view="split"]').click();
  await expect(page.locator('#preview h1')).toHaveText('Xin chào');
  await expect(page.locator('#preview strong')).toHaveText('Đậm');
  await expect(page.locator('#preview img, #preview script, #preview a')).toHaveCount(0);
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download-btn').click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('note.md');
  expect(await readFile(await download.path(), 'utf8')).toBe(content);
  expect(requests).toHaveLength(0);
  await page.reload();
  await expect(page.locator('#editor')).toHaveValue(content);
});

test('Editor remains usable without localStorage', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } });
  });
  await page.reload();
  await page.locator('#editor').pressSequentially('Vieetj');
  await expect(page.locator('#editor')).toHaveValue('Việt');
  await expect(page.locator('#save-status')).toHaveText('Nháp chưa lưu — tải file');
});

test('Mobile layout fits 390 px and works without network', async ({ page, context }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.setOffline(true);
  await page.reload();
  await page.locator('#editor').pressSequentially('Chaof buooir sangs');
  await expect(page.locator('#editor')).toHaveValue('Chào buổi sáng');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#settings-btn').click();
  await expect(page.locator('#save-config')).toBeVisible();
});
