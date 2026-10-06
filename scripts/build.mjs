import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Script } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = join(root, 'index.html');
const output = join(root, 'dist');
const html = await readFile(source, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (!html.startsWith('<!doctype html>') || scripts.length !== 1) {
  throw new Error('Expected one complete HTML document with one embedded script.');
}
new Script(scripts[0][1], { filename: 'index.html' });
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyFile(source, join(output, 'index.html'));
await copyFile(source, join(output, 'go-viet.html'));
await writeFile(join(output, '.nojekyll'), '');
console.log(`Built dist/index.html and dist/go-viet.html (${Buffer.byteLength(html)} bytes each).`);
