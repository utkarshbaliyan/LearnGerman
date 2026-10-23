import assert from 'node:assert/strict';
import test from 'node:test';
import {createHash} from 'node:crypto';
import {createServer} from 'vite';

test('migration export is disabled by default, time bounded and cannot run arbitrary SQL or expose runtime secrets', async () => {
  const keys=['LESELAUT_EXPORT_TOKEN_SHA256','LESELAUT_EXPORT_EXPIRES'];
  const original=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
  for(const key of keys)delete process.env[key];
  let batches=0;
  globalThis.__migrationDb={prepare(sql){return sql;},async batch(statements){
    batches++; assert.deepEqual(statements,['SELECT * FROM users','SELECT * FROM user_progress','SELECT * FROM tutor_sessions','SELECT * FROM tutor_quotas']);
    return statements.map((_,i)=>({results:i===1?[{data:'ä'.repeat(20000)}]:[]}));
  }};
  const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false,watch:null},
    plugins:[{name:'migration-fixture',enforce:'pre',transform(_code,id){if(id.endsWith('/db/index.ts'))return 'export async function getD1(){return globalThis.__migrationDb;}';}}]});
  try {
    const {POST}=await vite.ssrLoadModule('/app/api/internal/migration/route.ts');
    const token='a'.repeat(64), request=value=>new Request('https://test.local/api/internal/migration?sql=DROP%20TABLE%20users',{method:'POST',headers:value?{authorization:`Bearer ${value}`}:{}});
    assert.equal((await POST(request(token))).status,404);assert.equal(batches,0);
    process.env.LESELAUT_EXPORT_TOKEN_SHA256=createHash('sha256').update(token).digest('hex');
    process.env.LESELAUT_EXPORT_EXPIRES=new Date(Date.now()+60000).toISOString();
    assert.equal((await POST(request())).status,401);assert.equal((await POST(request('b'.repeat(64)))).status,401);assert.equal(batches,0);
    const response=await POST(request(token));assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/private, no-store/);
    const snapshot=await response.json();assert.deepEqual(Object.keys(snapshot),['version','exportedAt','tables']);
    assert.equal(snapshot.tables.user_progress[0].data.length,20000);
    process.env.LESELAUT_EXPORT_EXPIRES=new Date(Date.now()-1000).toISOString();
    assert.equal((await POST(request(token))).status,404);assert.equal(batches,1);
  } finally {
    await vite.close();delete globalThis.__migrationDb;
    for(const key of keys){if(original[key]===undefined)delete process.env[key];else process.env[key]=original[key];}
  }
});
