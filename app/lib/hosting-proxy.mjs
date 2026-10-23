// Preserve the original origin's bookmarks and local storage after cutover.
// Never fall back to the retired database when the AWS backend is unavailable.
export async function proxyToAws(request, origin, fetcher=fetch) {
  if(origin!=='https://d19k6l47v6hw3.cloudfront.net')return Response.json({error:'Hosting is temporarily unavailable.'},{status:503,headers:{'cache-control':'no-store'}});
  const source=new URL(request.url), target=new URL(source.pathname+source.search,origin);
  const headers=new Headers(request.headers);
  for(const key of [...headers.keys()])if(['host','cookie','forwarded','via','x-forwarded-for','x-forwarded-host'].includes(key)||/^(cf-|oai-|x-openai-)/i.test(key))headers.delete(key);
  if(headers.get('origin')===source.origin)headers.set('origin',origin);
  try{
    const response=await fetcher(new Request(target,{method:request.method,headers,
      ...(!['GET','HEAD'].includes(request.method)?{body:request.body,duplex:'half'}:{}),redirect:'manual'}));
    const outgoing=new Headers(response.headers), location=outgoing.get('location');
    if(location){const next=new URL(location,target);if(next.origin===origin)outgoing.set('location',new URL(next.pathname+next.search+next.hash,source.origin).href);}
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers:outgoing});
  }catch{return Response.json({error:'Hosting is temporarily unavailable. Please retry.'},{status:503,headers:{'cache-control':'no-store','retry-after':'30'}});}
}
