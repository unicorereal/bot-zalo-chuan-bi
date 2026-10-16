const storePrefix=document.body.dataset.mode==='prep'?'bot24-prep-':'bot24-course-';
const get=(k)=>{try{return JSON.parse(localStorage.getItem(storePrefix+k))}catch{return null}};const set=(k,v)=>{try{localStorage.setItem(storePrefix+k,JSON.stringify(v))}catch{}};
const menu=document.querySelector('.menu');menu.addEventListener('click',()=>{const opened=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(opened))});
document.querySelectorAll('.side-links a').forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false')}));
function selectAI(name){if(!['codex','claude','anti'].includes(name))name='codex';set('ai',name);document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===name)));document.querySelectorAll('[data-ai]').forEach(e=>e.hidden=e.dataset.ai!==name);const code=document.querySelector('#install-prompt');if(code){const path=name==='claude'?'.claude/skills/':'.agents/skills/';code.textContent='Tôi chọn '+({codex:'Codex',claude:'Claude Code',anti:'Antigravity'}[name])+'. Hãy đọc skill hoc-bot-zalo-24-7 đã tải từ nguồn khóa học, kiểm nội dung và chép đúng thư mục skill vào '+path+'hoc-bot-zalo-24-7/ trong thư mục mã nền đang mở. Không ghi đè skill cùng tên nếu đã có; hãy so phiên bản trước. Chỉ cài skill, chưa cài bot, chưa deploy hoặc gọi API. Báo đường dẫn SKILL.md đã đặt. Sau đó chỉ tôi mở lượt mới để hỏi chính AI xác nhận nó nhận diện được skill và liệt kê đường dẫn thật đã đọc.';}}
document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',()=>selectAI(b.dataset.tool)));selectAI(get('ai')||'codex');
function progress(){const inputs=[...document.querySelectorAll('[data-check]')];const n=inputs.filter(x=>x.checked).length;document.querySelectorAll('[data-progress]').forEach(e=>e.textContent=n+'/'+inputs.length+' mục đã đánh dấu');document.querySelectorAll('.progress i').forEach(e=>e.style.width=(inputs.length?n*100/inputs.length:0)+'%');}
document.querySelectorAll('[data-check]').forEach(c=>{c.checked=!!get(c.dataset.check);c.addEventListener('change',()=>{set(c.dataset.check,c.checked);progress()})});progress();
document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',async()=>{
  const code=document.getElementById(b.dataset.copy),text=code.textContent;
  let copied=false;
  try{await navigator.clipboard.writeText(text);copied=true;}
  catch{
    const range=document.createRange();range.selectNodeContents(code);
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
    try{copied=document.execCommand('copy');}catch{}
  }
  b.setAttribute('aria-live','polite');
  b.textContent=copied?'Đã copy':'Chưa copy được';
}));
const skillPrompt=document.getElementById('verify-skill');
if(skillPrompt)skillPrompt.textContent=skillPrompt.textContent.replace('downloads/skill-hoc-bot-zalo-24-7.zip',new URL('downloads/skill-hoc-bot-zalo-24-7.zip',location.href).href);
let activeCourseLink=null;
function syncCourseNav(){
  if(document.body.dataset.mode!=='course')return;
  const entries=[...document.querySelectorAll('.side-links a[href^="#"]')].map(link=>({link,node:document.getElementById(link.hash.slice(1))})).filter(e=>e.node);
  const visible=entries.filter(e=>!e.node.closest('.page').hidden);
  const line=document.querySelector('.topbar').getBoundingClientRect().bottom+48;
  let current=visible[0];for(const e of visible)if(e.node.getBoundingClientRect().top<=line)current=e;
  if(!current)return;
  for(const e of entries){const active=e===current;e.link.classList.toggle('active',active);if(active)e.link.setAttribute('aria-current','location');else e.link.removeAttribute('aria-current');}
  if(activeCourseLink!==current.link){
    activeCourseLink=current.link;
    const sidebar=document.querySelector('.lesson-sidebar');
    const box=sidebar.getBoundingClientRect(),item=current.link.getBoundingClientRect();
    if(item.top<box.top+20||item.bottom>box.bottom-20){
      sidebar.scrollTop+=item.top-box.top-sidebar.clientHeight/3;
    }
  }
  const page=current.node.closest('.page');document.getElementById('page-title').textContent=page.dataset.title;
}
let courseNavQueued=false;
function queueCourseNav(){if(courseNavQueued)return;courseNavQueued=true;requestAnimationFrame(()=>{courseNavQueued=false;syncCourseNav();});}
function route(){
  const target=document.getElementById(location.hash.slice(1));
  const page=target?.closest('.page')||document.getElementById('lo-trinh');
  document.querySelectorAll('.page').forEach(node=>node.hidden=node!==page);
  document.getElementById('page-title').textContent=page.dataset.title;
  requestAnimationFrame(()=>{
    (target?.closest('.page')===page?target:page).scrollIntoView({block:'start',behavior:'instant'});
    syncCourseNav();
  });
}
if(document.body.dataset.mode==='course'){
  window.addEventListener('scroll',queueCourseNav,{passive:true});window.addEventListener('resize',queueCourseNav);window.addEventListener('load',queueCourseNav);window.addEventListener('hashchange',route);
  document.querySelectorAll('img').forEach(i=>i.addEventListener('load',queueCourseNav));route();
}

function syncPrepNav(){
  if(document.body.dataset.mode!=='prep')return;
  const entries=[...document.querySelectorAll('.side-links a[href^="#"]')].map(link=>({link,section:document.getElementById(link.getAttribute('href').slice(1))})).filter(x=>x.section);
  if(!entries.length)return;
  const line=document.querySelector('.topbar').getBoundingClientRect().bottom+24;
  let current=entries[0];
  for(const entry of entries)if(entry.section.getBoundingClientRect().top<=line)current=entry;
  if(window.scrollY>0&&window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2)current=entries[entries.length-1];
  for(const entry of entries){const active=entry===current;entry.link.classList.toggle('active',active);if(active)entry.link.setAttribute('aria-current','location');else entry.link.removeAttribute('aria-current');}
  document.getElementById('page-title').textContent=current.section.querySelector('h2').textContent;
}
let prepNavQueued=false;
function queuePrepNav(){if(prepNavQueued)return;prepNavQueued=true;requestAnimationFrame(()=>{prepNavQueued=false;syncPrepNav()});}
if(document.body.dataset.mode==='prep'){
  window.addEventListener('scroll',queuePrepNav,{passive:true});window.addEventListener('resize',queuePrepNav);window.addEventListener('hashchange',queuePrepNav);window.addEventListener('load',queuePrepNav);document.addEventListener('load',queuePrepNav,true);document.querySelectorAll('[data-tool]').forEach(b=>b.addEventListener('click',queuePrepNav));queuePrepNav();
}
