/* Public website: content lives in site-data.js. No framework, cookies, trackers or backend. */
'use strict';
const fallback = { school: { phone:'6305060116', whatsapp:'916305060116' }, hero:{},programs:{},events:[],gallery:{items:[]} };
let SITE = window.LITTLE_DREAMZ_DATA || fallback;
const byId = id => document.getElementById(id);
const put = (id,value) => { const item=byId(id); if(item && value!==undefined && value!==null) item.textContent=String(value); };
const escapeHtml = input => String(input??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readableDate = d => { if(!/^\d{4}-\d{2}-\d{2}$/.test(d||'')) return d||''; const [y,m,day]=d.split('-').map(Number); return new Date(y,m-1,day).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); };
const todayISO = () => { const d = new Date(); return [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'); };
let selectedEvent = null;
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.navlinks');
menuButton.addEventListener('click',()=>{const open=navLinks.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'✕':'☰';});
document.querySelectorAll('.navlinks a').forEach(link=>link.addEventListener('click',()=>{navLinks.classList.remove('open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='☰';}));

function registerable(e){ return Boolean(e.registrationOpen && e.status!=='hidden' && e.status!=='past' && (!e.end || e.end>=todayISO()) && (!e.registrationDeadline || e.registrationDeadline>=todayISO())); }
function setupEventForm(e){
  selectedEvent=e;
  put('eventFormTitle',e.title+' Registration');
  put('eventFormSub',(e.price||'Event')+' · '+readableDate(e.start));
  const choices=byId('dayCamp');choices.replaceChildren();
  const first=document.createElement('option');first.value='';first.textContent='Select a day';choices.append(first);
  (e.registrationDays?.length ? e.registrationDays : [readableDate(e.start)]).forEach(text=>{const opt=document.createElement('option');opt.value=text;opt.textContent=text;choices.append(opt);});
}
function renderSite(model){
  SITE=model;
  const school=model.school||{},hero=model.hero||{}, programs=model.programs||{}, announcement=model.announcement||{}, gallery=model.gallery||{};
  document.documentElement.dataset.theme=model.theme||'default';
  put('heroEyebrow',hero.eyebrow);put('heroLine1',hero.line1);put('heroLine2',hero.line2);put('heroLine3',hero.line3);put('heroDescription',hero.description);
  put('nurseryDescription',programs.nursery);put('lkgDescription',programs.lkg);put('ukgDescription',programs.ukg);put('footerTagline',school.tagline ? school.tagline+' ☀️' : 'Where little dreams begin to shine. ☀️');
  put('contactAddress',school.address);put('contactPhone',school.phone);
  const phone=(school.phone||'').replace(/\D/g,'');
  byId('contactPhone').href='tel:+91'+phone.replace(/^91/,'');byId('callButton').href=byId('contactPhone').href;
  const mapURL=school.mapsUrl||'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(school.address||'Little Dreamz Preschool Meerpet Hyderabad');
  if(/^https:\/\//i.test(mapURL))byId('mapsButton').href=mapURL;
  const banner=byId('siteAnnouncement');banner.replaceChildren(); banner.hidden=!(announcement.enabled && announcement.text && (!announcement.expiresAt || announcement.expiresAt>=todayISO()));
  if(!banner.hidden){const span=document.createElement('span');span.textContent=announcement.text;banner.append(span);
    if(announcement.linkText){const link=document.createElement('a');link.href=['#events','#admissions','#contact','#moments'].includes(announcement.link)?announcement.link:'#events';link.textContent=announcement.linkText+' →';banner.append(link);}}
  const gallerySection=byId('moments'),galleryContainer=byId('galleryGrid');galleryContainer.replaceChildren();
  gallerySection.hidden=gallery.enabled===false;
  put('galleryIntro',gallery.intro);
  (gallery.items||[]).slice(0,6).forEach((it)=>{
    const card=document.createElement('article');card.className='gallery-card';const media=document.createElement('div');media.className='gallery-media';
    if(it.image && (/^data:image\/(png|jpeg|webp);base64,/.test(it.image) || /^https:\/\//.test(it.image) || /^images\/[a-z0-9_.-]+$/i.test(it.image))){const img=document.createElement('img');img.src=it.image;img.alt=it.title||'Little Dreamz school photo';img.loading='lazy';media.append(img);}
    else{const placeholder=document.createElement('span');placeholder.className='gallery-placeholder';placeholder.textContent=it.emoji||'🌈';media.append(placeholder);}
    const desc=document.createElement('div');desc.className='gallery-copy';const title=document.createElement('h3');title.textContent=it.title||'Little Dreamz';const p=document.createElement('p');p.textContent=it.description||'';desc.append(title,p);card.append(media,desc);galleryContainer.append(card);
  });
  const container=byId('eventCards');container.replaceChildren();const events=(Array.isArray(model.events)?model.events:[]).filter(e=>e.status!=='hidden').sort((a,b)=>(a.start||'').localeCompare(b.start||''));
  if(!events.length){const empty=document.createElement('div');empty.className='event-card';empty.innerHTML='<div class="event-icon">🎉</div><h3>More happy moments coming soon!</h3><p>Check back here for upcoming school celebrations and activities.</p>';container.append(empty);}
  events.forEach(e=>{
    const expired=Boolean(e.end && e.end<todayISO()),canRegister=registerable(e);
    const card=document.createElement('article');card.className='event-card';
    card.innerHTML=`<div class="event-icon">${escapeHtml(e.icon||'🎉')}</div><span class="event-pill">${expired||e.status==='past'?'PAST EVENT':canRegister?'REGISTRATION OPEN':'EVENT DETAILS'}</span><h3>${escapeHtml(e.title)}</h3><p>${escapeHtml(e.summary)}</p><div class="event-facts"><span>📅 ${escapeHtml(readableDate(e.start))}${e.end&&e.end!==e.start?' – '+escapeHtml(readableDate(e.end)):''}</span>${e.price?'<span>🎟️ '+escapeHtml(e.price)+'</span>':''}${canRegister&&e.registrationDeadline?'<span>⏰ Register by '+escapeHtml(readableDate(e.registrationDeadline))+'</span>':''}</div>${canRegister?'<a href="#camp-register" class="btn btn-small event-register">Register / Enquire →</a>':''}`;
    if(canRegister){card.querySelector('.event-register').addEventListener('click',()=>setupEventForm(e));}
    container.append(card);
  });
  const active=events.find(registerable),panel=byId('camp-register'),forms=byId('admissions').querySelector('.forms-grid');
  panel.hidden=!active;forms.classList.toggle('single-form',!active);selectedEvent=null;
  if(active)setupEventForm(active);
  const ld={"@context":"https://schema.org","@type":"Preschool","@id":"https://littledreamz.co.in/#school","name":"Little Dreamz Preschool","url":"https://littledreamz.co.in/","telephone":"+91"+phone.replace(/^91/,''),"address":{"@type":"PostalAddress","streetAddress":"No. 3-176/3/1/3/A/1, Road No. 15, Meerpet","addressLocality":"Hyderabad","addressRegion":"Telangana","postalCode":"500097","addressCountry":"IN"},"description":"Nursery, LKG and UKG preschool in Meerpet, Hyderabad."};
  byId('schoolJsonLd').textContent=JSON.stringify(ld);
  // Keep the SEO meta description authored in index.html stable across editor updates.
}
function openWhatsapp(message){
 const raw=(SITE.school?.whatsapp||'').replace(/\D/g,'');if(!raw){alert('Please call the school to enquire.');return;}
 const url='https://wa.me/'+raw+'?text='+encodeURIComponent(message);const w=window.open(url,'_blank','noopener,noreferrer');if(!w)window.location.href=url;
}
byId('campForm').addEventListener('submit',function(ev){ev.preventDefault();if(!this.reportValidity()||!selectedEvent||!registerable(selectedEvent))return;
 const name=byId('parentCamp').value.trim(),age=byId('ageCamp').value,day=byId('dayCamp').value;
 openWhatsapp(`Hello Little Dreamz! I would like to register/enquire for ${selectedEvent.title}.\nParent/guardian: ${name}\nChild's age: ${age}\nPreferred day: ${day}\nPlease confirm my registration and event timings. Thank you!`);
});
byId('admissionForm').addEventListener('submit',function(ev){ev.preventDefault();if(!this.reportValidity())return;
 const name=byId('parentAdmission').value.trim(),program=byId('programAdmission').value,question=byId('questionAdmission').value.trim();
 openWhatsapp(`Hello Little Dreamz! I am interested in admissions.\nParent/guardian: ${name}\nProgram: ${program}${question?'\nQuestion: '+question:''}\nPlease share the admission details. Thank you!`);
});
put('year',new Date().getFullYear());renderSite(SITE);
// Live preview is deliberately limited to locally opened website files.
window.addEventListener('message',ev=>{
 if(ev.source!==window.parent || ev.data?.type!=='LITTLE_DREAMZ_LOCAL_PREVIEW' || (location.protocol!=='file:' && ev.origin!==location.origin))return;
 if(ev.data.payload && typeof ev.data.payload==='object' && Array.isArray(ev.data.payload.events)) renderSite(ev.data.payload);
});
