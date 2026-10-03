// PWA: manifest, icons, and the service worker's offline behavior (run against a fake cache and network).
const {JSDOM}=require('jsdom');
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=__dirname, ORIGIN='https://zigzagmind.com';
const read=f=>fs.readFileSync(path.join(ROOT,f));
const HTML=read('index.html').toString('utf8');
const r=[];

// ---- manifest and icons ----
let man={}; try { man=JSON.parse(read('manifest.webmanifest').toString('utf8')); } catch(_){}
const pngSize=f=>{ const b=read(f); return b.slice(1,4).toString()==='PNG' ? b.readUInt32BE(16)+'x'+b.readUInt32BE(20) : null; };
const icons=man.icons||[];
r.push(['manifest names the app', man.name==='ZigZag Mind' && !!man.short_name]);
r.push(['manifest opens standalone at the app root', man.display==='standalone' && man.start_url==='./' && man.scope==='./']);
r.push(['manifest colors are warm paper', man.background_color==='#F6F4EF' && man.theme_color==='#F6F4EF']);
r.push(['icons: 192 and 512 any, 512 maskable', ['192x192 any','512x512 any','512x512 maskable'].every(k=>icons.some(i=>i.sizes+' '+i.purpose===k))]);
r.push(['every icon file exists at its stated size', icons.every(i=>fs.existsSync(path.join(ROOT,i.src)) && (i.type!=='image/png' || pngSize(i.src)===i.sizes))]);
r.push(['apple touch icon is 180x180', pngSize('apple-touch-icon.png')==='180x180']);
r.push(['index.html links manifest and icons', /<link rel="manifest" href="manifest.webmanifest">/.test(HTML) && /rel="apple-touch-icon" href="apple-touch-icon.png"/.test(HTML)]);

// The icon is Zags: same body, tuft, eyes and smile as zags-preview.html.
{ const svg=read('icon.svg').toString('utf8'), ref=read('zags-preview.html').toString('utf8');
  const parts=['M110 48 C160 48 186 84 186 128 C186 170 154 196 110 196 C66 196 34 170 34 128 C34 84 60 48 110 48 Z','M92 52 L102 30 L110 46 L120 24 L128 52','M100 140 Q110 148 120 140','cx="86" cy="118" rx="8" ry="10"','cx="134" cy="118" rx="8" ry="10"'];
  r.push(['icon is Zags from zags-preview.html', parts.every(p=>svg.includes(p) && ref.includes(p)) && /#7BC4BB/i.test(svg) && /#2F6F6A/i.test(svg) && /#F6F4EF/i.test(svg)]); }
// Maskable safe zone: every pixel outside the central circle (radius 40%) is plain warm paper.
function decodePng(buf){
  const zlib=require('zlib'); let i=8, w, h, type, idat=[];
  while(i<buf.length){ const len=buf.readUInt32BE(i), t=buf.toString('ascii',i+4,i+8), d=buf.slice(i+8,i+8+len);
    if(t==='IHDR'){ w=d.readUInt32BE(0); h=d.readUInt32BE(4); type=d[9]; if(d[8]!==8) throw new Error('bit depth'); }
    if(t==='IDAT') idat.push(d); i+=12+len; }
  const bpp=type===6?4:3, stride=w*bpp, raw=zlib.inflateSync(Buffer.concat(idat)), px=Buffer.alloc(h*stride);
  for(let y=0;y<h;y++){ const f=raw[y*(stride+1)];
    for(let x=0;x<stride;x++){ const v=raw[y*(stride+1)+1+x], a=x>=bpp?px[y*stride+x-bpp]:0, b=y?px[(y-1)*stride+x]:0, c=(x>=bpp&&y)?px[(y-1)*stride+x-bpp]:0;
      const p=a+b-c, pa=Math.abs(p-a), pb=Math.abs(p-b), pc=Math.abs(p-c);
      px[y*stride+x]=(v+[0,a,b,(a+b)>>1,(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c)][f])&255; } }
  return {w,h,at:(x,y)=>[...px.slice(y*stride+x*bpp,y*stride+x*bpp+3)]};
}
for(const f of ['icon-512.png','icon-192.png','apple-touch-icon.png']){
  const img=decodePng(read(f)), c=img.w/2, R=img.w*0.4; let ok=true, inside=false;
  for(let y=0;y<img.h;y++) for(let x=0;x<img.w;x++){ const [rr,gg,bb]=img.at(x,y), paper=Math.abs(rr-0xF6)+Math.abs(gg-0xF4)+Math.abs(bb-0xEF)<=6;
    if(Math.hypot(x+.5-c,y+.5-c)>R){ if(!paper) ok=false; } else if(!paper) inside=true; }
  r.push([`${f}: Zags fits the maskable safe zone`, ok && inside]);
}
r.push(['cache version bumped when the shell changes (v3: supporter guide)', /const CACHE = "zz-shell-v3";/.test(read('sw.js').toString('utf8'))]);

// ---- service worker harness ----
const FILES={}; ['index.html','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','apple-touch-icon.png'].forEach(f=>FILES['/'+f]=read(f));
FILES['/']=FILES['/index.html']; FILES['/data.json']=Buffer.from('{}');
FILES['/support/']=read('support/index.html');
function swEnv(){
  const net={mode:'online'};
  const fetch=async req=>{ const u=new URL(typeof req==='string'?req:req.url, ORIGIN);
    if(net.mode==='hang') return new Promise(()=>{});
    if(net.mode==='offline') throw new TypeError('Failed to fetch');
    const f=FILES[u.pathname]; return f ? new Response(f,{status:200}) : new Response('not found',{status:404}); };
  const store=new Map(), puts=[];
  const open=name=>{ if(!store.has(name)) store.set(name,new Map()); const m=store.get(name); return {
    addAll:async list=>{ for(const p of list){ const u=new URL(p,ORIGIN+'/sw.js').href; const res=await fetch(u); if(!res.ok) throw new Error('addAll '+u); m.set(u,res); } },
    put:async (k,res)=>{ const u=typeof k==='string'?k:k.url; puts.push(u); m.set(u,res); },
    match:async k=>{ const res=m.get(typeof k==='string'?k:k.url); return res ? res.clone() : undefined; } }; };
  const caches={ open:async n=>open(n), keys:async()=>[...store.keys()], delete:async n=>store.delete(n),
    match:async k=>{ for(const n of store.keys()){ const hit=await open(n).match(k); if(hit) return hit; } } };
  const on={};
  const self={ location:new URL(ORIGIN+'/sw.js'), addEventListener:(t,f)=>{ on[t]=f; }, skipWaiting:async()=>{}, clients:{ claim:async()=>{} } };
  vm.runInContext(read('sw.js').toString('utf8'), vm.createContext({ self, caches, fetch, URL, Response, Promise, setTimeout, clearTimeout, Error }));
  const life=async t=>{ let p; on[t]({ waitUntil:x=>{ p=x; } }); await p; };
  const req=(url,opts={})=>{ let out=null; on.fetch({ request:{ url:new URL(url,ORIGIN).href, mode:opts.mode||'no-cors', method:opts.method||'GET' }, respondWith:p=>{ out=p; } }); return out; };
  return { net, store, puts, life, req, cached:()=>[...store.values()].flatMap(m=>[...m.keys()]) };
}
const body=async p=>p ? Buffer.from(await (await p).arrayBuffer()) : null;
const bootOpts=(url,extra)=>({url,runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){ w.scrollTo=()=>{}; w.scrollBy=()=>{}; if(extra) extra(w); }});

(async()=>{
  const sw=swEnv();
  await sw.life('install');
  const cached=sw.cached();
  r.push(['install caches the page and every icon', ['/','/index.html','/manifest.webmanifest','/icon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png'].every(p=>cached.includes(ORIGIN+p))]);
  r.push(['install caches nothing outside the shell', cached.every(u=>FILES[new URL(u).pathname] && u!==ORIGIN+'/data.json')]);

  sw.net.mode='offline';
  const offline=await body(sw.req('/',{mode:'navigate'}));
  r.push(['offline: the app opens from the cache', !!offline && offline.equals(FILES['/index.html'])]);
  const offlineQ=await body(sw.req('/index.html?for=Sam',{mode:'navigate'}));
  r.push(['offline: any page address still opens the app', !!offlineQ && offlineQ.equals(FILES['/index.html'])]);
  const icon=await body(sw.req('/icon-192.png'));
  r.push(['offline: icons load from the cache', !!icon && icon.equals(FILES['/icon-192.png'])]);
  const guide=await body(sw.req('/support/',{mode:'navigate'}));
  r.push(['offline: the supporter guide opens from the cache (not the app)', !!guide && guide.equals(FILES['/support/'])]);

  // The cached page boots and the crisis screen works with no network.
  { const dom=new JSDOM(offline.toString('utf8'),bootOpts(ORIGIN+'/'));
    const w=dom.window; w.HTMLElement.prototype.scrollIntoView=()=>{};
    w.document.querySelector('[data-act="crisis"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true,cancelable:true}));
    const hrefs=[...w.document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href'));
    r.push(['offline: crisis screen opens with Call/Text 988', w.eval('session.screen')==='crisis' && hrefs.includes('tel:988') && hrefs.includes('sms:988')]);
    w.close(); }

  sw.net.mode='hang';
  const t0=Date.now(); const slow=await body(sw.req('/',{mode:'navigate'}));
  r.push(['slow network: falls back to the saved app within 4s', !!slow && slow.equals(FILES['/index.html']) && Date.now()-t0<4000]);

  sw.net.mode='online'; sw.puts.length=0;
  await body(sw.req('/',{mode:'navigate'}));
  r.push(['online: page comes from the network and refreshes the saved copy', sw.puts.length===1 && sw.puts[0]===ORIGIN+'/index.html']);
  sw.puts.length=0;
  await body(sw.req('/?for=Sam',{mode:'navigate'}));
  r.push(['addresses with query strings are never saved', sw.puts.length===0]);

  r.push(['other sites are not intercepted', sw.req('https://988lifeline.org/chat')===null]);
  r.push(['non-GET requests are not intercepted', sw.req('/index.html',{method:'POST'})===null]);
  r.push(['non-shell files are not intercepted', sw.req('/data.json')===null && !sw.cached().includes(ORIGIN+'/data.json')]);
  r.push(['service worker never reads saved user data', !/localStorage|sessionStorage|indexedDB|next\.v1/.test(read('sw.js').toString('utf8').replace(/^\s*\/\/.*$/gm,''))]);

  sw.store.set('zz-shell-old', new Map());
  await sw.life('activate');
  r.push(['activate removes old caches', !sw.store.has('zz-shell-old') && sw.store.size===1]);

  // Registration
  const withSW=(secure,register)=>w=>{ Object.defineProperty(w,'isSecureContext',{value:secure}); Object.defineProperty(w.navigator,'serviceWorker',{value:{ register }}); };
  { const calls=[]; const dom=new JSDOM(HTML,bootOpts(ORIGIN+'/',withSW(true,u=>{ calls.push(u); return Promise.resolve(); })));
    r.push(['page registers sw.js', calls.length===1 && calls[0]==='sw.js' && dom.window.eval('session.screen')==='ob-about']); dom.window.close(); }
  { const calls=[]; const dom=new JSDOM(HTML,bootOpts('http://example.com/',withSW(false,u=>{ calls.push(u); return Promise.resolve(); })));
    r.push(['no registration on insecure pages', calls.length===0 && dom.window.eval('session.screen')==='ob-about']); dom.window.close(); }
  { const dom=new JSDOM(HTML,bootOpts(ORIGIN+'/',withSW(true,()=>{ throw new Error('blocked'); })));
    r.push(['app still works if registration fails', dom.window.eval('session.screen')==='ob-about']); dom.window.close(); }

  console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n'));
  process.exit(0);
})().catch(e=>{ console.log(r.map(x=>(x[1]?'PASS ':'FAIL ')+x[0]).join('\n')); console.log('FAIL crashed: '+e.message); process.exit(1); });
