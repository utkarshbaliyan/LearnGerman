import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';

test('real JWT verification rejects forged identity, wrong issuer/audience, expired and incomplete tokens', async () => {
  const keys=await generateKeyPair('ES256');
  globalThis.__backendJwks=createLocalJWKSet({keys:[{...await exportJWK(keys.publicKey),kid:'fixture'}]});
  const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false,watch:null},plugins:[{name:'local-auth-key-only',enforce:'pre',transform(code,id){
    if(id.endsWith('/db/index.ts'))return `export async function getD1(){return {prepare(){return {bind(id){return {async first(){if(globalThis.__authDbFailed)throw new Error('private');return globalThis.__deletedTestUser===id?{deleting:1}:null;}};}};}};}`;
    if(id.endsWith('/app/lib/supabase-auth.ts'))return code.replace(/^const JWKS = .+;$/m,'const JWKS = globalThis.__backendJwks;');
  }}]});
  const issuer='https://npnzojbbwwdtujuurkmx.supabase.co/auth/v1';
  const token=async(overrides={},privateKey=keys.privateKey)=>{
    const claims={sub:'test-user',email:'learner@example.test',role:'authenticated',aud:'authenticated',iss:issuer,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+3600,...overrides};
    return new SignJWT(claims).setProtectedHeader({alg:'ES256',kid:'fixture'}).sign(privateKey);
  };
  const request=value=>new Request('http://test.local/api/account',{headers:{...(value?{authorization:`Bearer ${value}`}:{'oai-authenticated-user-id':'test-user','x-user-id':'test-user'})}});
  try{
    const {getAuthenticatedUser}=await vite.ssrLoadModule('/app/lib/supabase-auth.ts');
    assert.equal((await getAuthenticatedUser(request(await token()))).id,'test-user');
    assert.equal(await getAuthenticatedUser(request()),null);
    assert.equal(await getAuthenticatedUser(request('forged')),null);
    assert.equal(await getAuthenticatedUser(request('x'.repeat(20_000))),null);
    for(const claims of [{iss:'https://foreign.test/auth/v1'},{aud:'anon'},{exp:1},{exp:undefined},{sub:undefined},{email:''},{role:'anon'}]){
      assert.equal(await getAuthenticatedUser(request(await token(claims))),null,JSON.stringify(claims));
    }
    globalThis.__deletedTestUser='test-user';
    assert.equal(await getAuthenticatedUser(request(await token())),null,'deleted identities cannot use unexpired JWTs');
    assert.equal((await getAuthenticatedUser(request(await token()),{includeDeleting:true})).id,'test-user','deletion retries still verify the JWT');
    delete globalThis.__deletedTestUser;globalThis.__authDbFailed=true;
    assert.equal(await getAuthenticatedUser(request(await token())),null,'deletion lookup failures fail closed');
    delete globalThis.__authDbFailed;
    assert.equal((await getAuthenticatedUser(request(await token({amr:[{method:'password',timestamp:123},{method:'token_refresh',timestamp:999}]})))).authenticatedAt,123,'refreshing a token is not fresh authentication');
    const other=await generateKeyPair('ES256');
    assert.equal(await getAuthenticatedUser(request(await token({},other.privateKey))),null);
    const google=await getAuthenticatedUser(request(await token({user_metadata:{full_name:'A Google Learner',avatar_url:'https://example.test/avatar'}})));
    assert.equal(google.displayName,'A Google Learner');
    assert.equal(google.id,'test-user','Google metadata must never replace the stable Supabase subject');
  }finally{await vite.close();delete globalThis.__backendJwks;delete globalThis.__deletedTestUser;delete globalThis.__authDbFailed;}
});

test('request byte limits stop unknown-length streams before parsing and release the reader',async()=>{
  const vite=await createServer({configFile:false,server:{middlewareMode:true,ws:false,watch:null}});
  try{
    const {boundedBody}=await vite.ssrLoadModule('/app/lib/request-body.ts');
    let canceled=false,pulls=0;
    const body=new ReadableStream({pull(controller){pulls++;controller.enqueue(new Uint8Array(6));},cancel(){canceled=true;}});
    const request=new Request('http://test.local/',{method:'POST',body,duplex:'half'});
    assert.equal(await boundedBody(request,10),null);assert.equal(canceled,true);assert.ok(pulls<=3);
    const valid=new Request('http://test.local/',{method:'POST',body:'Grüße'});
    assert.equal(new TextDecoder().decode(await boundedBody(valid,8)),'Grüße');
    assert.equal(await boundedBody(new Request('http://test.local/',{method:'POST',body:'Grüße'}),6),null,'limits count UTF-8 bytes, not characters');
    const declared=new Request('http://test.local/',{method:'POST',headers:{'content-length':'100'},body:'small'});
    assert.equal(await boundedBody(declared,10),null);
  }finally{await vite.close();}
});
