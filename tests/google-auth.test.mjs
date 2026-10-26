import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createClient } from '@supabase/supabase-js';

test('Google OAuth uses PKCE, the production callback and provider availability without storing a client secret',async()=>{
  const values=new Map();
  const client=createClient('https://auth.example.test','public-test-key',{auth:{flowType:'pkce',persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,storage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)}}});
  globalThis.__googleAuthClient=client;
  const vite=await createServer({configFile:false,resolve:{alias:{'@':process.cwd()}},server:{middlewareMode:true,ws:false,watch:null},plugins:[{name:'isolated-google-client',enforce:'pre',transform(_code,id){
    if(id.endsWith('/app/lib/supabase-client.ts'))return `export const supabase=globalThis.__googleAuthClient;export const SUPABASE_URL='https://auth.example.test';export const SUPABASE_PUBLISHABLE_KEY='public-test-key';`;
  }}]});
  const oldFetch=globalThis.fetch;
  try{
    const google=await vite.ssrLoadModule('/app/lib/google-auth.ts');
    globalThis.fetch=async(url,init)=>{
      assert.equal(String(url),'https://auth.example.test/auth/v1/settings');
      assert.equal(init.headers.apikey,'public-test-key');
      return Response.json({external:{google:false}});
    };
    assert.equal(await google.googleProviderEnabled(),false,'do not expose a broken button while the provider is disabled');
    globalThis.fetch=async()=>Response.json({external:{google:true}});
    assert.equal(await google.googleProviderEnabled(),true);
    globalThis.fetch=async()=>Response.json({}, {status:503});
    assert.equal(await google.googleProviderEnabled(),false);
    const result=await google.signInWithGoogle();assert.equal(result.error,null);
    const url=new URL(result.data.url);
    assert.equal(url.pathname,'/auth/v1/authorize');
    assert.equal(url.searchParams.get('provider'),'google');
    assert.equal(url.searchParams.get('redirect_to'),'https://leselaut.com/auth/confirm');
    assert.equal(url.searchParams.get('code_challenge_method'),'s256');
    assert.ok(url.searchParams.get('code_challenge')?.length>=40);
    assert.equal(url.searchParams.has('client_secret'),false);
  }finally{globalThis.fetch=oldFetch;await vite.close();await client.auth.stopAutoRefresh();delete globalThis.__googleAuthClient;}
});

test('callback accepts SDK-completed OAuth once, preserves email verification, and rejects failed/expired sign-in',async()=>{
  const vite=await createServer({configFile:false,server:{middlewareMode:true,ws:false,watch:null}});
  try{
    const {confirmAuthSession}=await vite.ssrLoadModule('/app/lib/auth-confirm.ts');
    const calls=[];const session={user:{id:'stable-supabase-id'}};
    const auth={initialize:async()=>{calls.push('initialize');return{error:null};},verifyOtp:async input=>{calls.push(input);return{error:null};},getSession:async()=>{calls.push('session');return{data:{session},error:null};}};
    const empty={error:null,tokenHash:null,type:null};
    assert.equal((await confirmAuthSession(auth,empty)).user.id,'stable-supabase-id');
    assert.deepEqual(calls,['initialize','session'],'SDK initialization owns the single-use code exchange');
    calls.length=0;
    await confirmAuthSession(auth,{...empty,tokenHash:'email-token',type:'email'});
    assert.deepEqual(calls,['initialize',{token_hash:'email-token',type:'email'},'session']);
    await assert.rejects(()=>confirmAuthSession(auth,{...empty,error:'Provider denied sign-in'}),/Provider denied/);
    await assert.rejects(()=>confirmAuthSession({...auth,initialize:async()=>({error:new Error('invalid code')})},empty),/invalid code/);
    await assert.rejects(()=>confirmAuthSession({...auth,getSession:async()=>({data:{session:null},error:null})},empty),/expired/);
    await assert.rejects(()=>confirmAuthSession({...auth,initialize:()=>new Promise(()=>{})},empty,20),/taking too long/,'initialization cannot leave the callback spinning indefinitely');
    await assert.rejects(()=>confirmAuthSession({...auth,getSession:()=>new Promise(()=>{})},empty,20),/taking too long/,'a stalled session read has the same bounded failure');
    await assert.rejects(()=>confirmAuthSession({...auth,verifyOtp:()=>new Promise(()=>{})},{...empty,tokenHash:'email-token'},20),/taking too long/,'a stalled email verification is bounded too');
  }finally{await vite.close();}
});

test('new sign-ins use PKCE while already-issued implicit email callbacks remain usable',async()=>{
  const vite=await createServer({configFile:false,server:{middlewareMode:true,ws:false,watch:null}});
  try{
    const {authFlowForLocation}=await vite.ssrLoadModule('/app/lib/auth-flow.ts');
    assert.equal(authFlowForLocation(),'pkce');
    assert.equal(authFlowForLocation('/account'),'pkce');
    assert.equal(authFlowForLocation('/auth/confirm',''),'pkce');
    assert.equal(authFlowForLocation('/auth/confirm','#access_token=issued-access&refresh_token=issued-refresh'),'implicit');
    assert.equal(authFlowForLocation('/auth/confirm','#access_token=issued-access'),'pkce');
    assert.equal(authFlowForLocation('/account','#access_token=issued-access&refresh_token=issued-refresh'),'pkce');
  }finally{await vite.close();}
});
