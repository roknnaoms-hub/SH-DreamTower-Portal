import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import XLSX from 'xlsx';

const token = randomBytes(32).toString('base64url');
const hash = createHash('sha256').update(token).digest('hex');
const origin = 'https://roknnaoms-hub.github.io';
const directory = await mkdtemp(path.join(tmpdir(), 'sh-security-'));
process.env.DATA_PATH = path.join(directory, 'tenants.json');
await writeFile(process.env.DATA_PATH, JSON.stringify({buildingName:'Test',tenants:[]}));
const { createApp } = await import('../src/index.js');
const server = createApp({tokenHash: hash, origins: origin}).listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const auth = {Authorization: `Bearer ${token}`};
async function upload(bytes, name, headers = auth) {
  const body = new FormData(); body.append('file', new Blob([bytes]), name);
  return fetch(`${base}/api/admin/tenants/import`, { method:'POST',headers,body });
}
test('public reading remains available', async () => assert.equal((await fetch(`${base}/api/floors`)).status,200));
test('unauthenticated creation and upload are rejected before parsing', async () => {
  assert.equal((await fetch(`${base}/api/admin/tenants`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})).status,401);
  assert.equal((await upload('x','test.csv',{})).status,401);
  assert.equal(JSON.parse(await readFile(process.env.DATA_PATH)).tenants.length,0);
});
test('invalid token and hostile origin cannot authenticate', async () => {
  assert.equal((await fetch(`${base}/api/admin/session`,{headers:{Authorization:`Bearer ${'a'.repeat(43)}`}})).status,401);
  assert.equal((await fetch(`${base}/api/admin/session`,{headers:{...auth,Origin:'https://invalid.example'}})).status,403);
});
test('valid token accepted and CORS limited to exact configured origin', async () => {
  const response=await fetch(`${base}/api/admin/session`,{headers:{...auth,Origin:origin}});
  assert.equal(response.status,200); assert.equal(response.headers.get('access-control-allow-origin'),origin);
  assert.equal(response.headers.get('cache-control'),'no-store');
});
test('unsupported, malformed, oversized and excessive rows rejected', async () => {
  assert.equal((await upload('x','test.exe')).status,415);
  assert.equal((await upload('not a spreadsheet','bad.xlsx')).status,422);
  assert.equal((await upload(new Uint8Array(2*1024*1024+1),'large.csv')).status,413);
  assert.equal((await upload('floorCode,unit,name\n'+Array.from({length:2001},(_,i)=>`1F,${i},Name`).join('\n'),'many.csv')).status,422);
  assert.equal(JSON.parse(await readFile(process.env.DATA_PATH)).tenants.length,0);
});
test('validated CSV and XLSX imports succeed', async () => {
  assert.equal((await upload('floorCode,unit,name\n1F,101,Test','valid.csv')).status,200);
  const book=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet([{floorCode:'2F',unit:'201',name:'Second'}]),'Tenants');
  assert.equal((await upload(XLSX.write(book,{type:'buffer',bookType:'xlsx'}),'valid.xlsx')).status,200);
  assert.equal(JSON.parse(await readFile(process.env.DATA_PATH)).tenants.length,2);
});
test('active content website schemes fail validation', async () => {
  const response=await fetch(`${base}/api/admin/tenants`,{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({floorCode:'3F',unit:'301',name:'Unsafe',website:'javascript:alert(1)'})});
  assert.equal(response.status,422);
});
test('missing server credential disables administration', async () => {
  const disabled=createApp({tokenHash:''}).listen(0,'127.0.0.1');await new Promise(resolve=>disabled.once('listening',resolve));
  try { assert.equal((await fetch(`http://127.0.0.1:${disabled.address().port}/api/admin/session`,{headers:auth})).status,503); }
  finally { await new Promise(resolve=>disabled.close(resolve)); }
});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true});});
