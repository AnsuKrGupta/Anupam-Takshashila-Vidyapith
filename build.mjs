// Builds the static site into dist/: one real URL per section, each with its own
// title, description, canonical and structured data. Run: node build.mjs
// Edit content in src/site.html; static files (images, robots.txt, llms.txt) live in public/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';

const SITE = 'https://www.atvnirmali.org';
const TODAY = new Date().toISOString().slice(0, 10);
const NAME = 'Anupam Takshashila Vidyapith';

const PAGES = [
  { id: 'home', path: '/', name: 'Home',
    title: 'Anupam Takshashila Vidyapith (ATV) | School in Nirmali, Supaul',
    desc: 'Anupam Takshashila Vidyapith (ATV), Nirmali, Supaul, Bihar 847452 — CBSE-oriented Hindi & English medium school, Play School to Class VIII. Smart classes, Navodaya & Sainik School prep, IIT-IIM mentorship. Admissions open 2026-27. Call 9006308822.' },
  { id: 'about', path: '/about/', name: 'About',
    title: 'About ATV Nirmali — History, Principal & Teachers | Anupam Takshashila Vidyapith',
    desc: 'Anupam Takshashila Vidyapith, Nirmali was founded in 2020 and is registered with the Government of Bihar (Reg. No. 20811012024118185825). Meet Principal Sushil Kumar Sahu and our trained faculty.' },
  { id: 'admissions', path: '/admissions/', name: 'Admissions & Fees',
    title: 'Admission 2026-27 & Fee Structure | ATV Nirmali, Supaul',
    desc: 'Admissions open 2026-27 at Anupam Takshashila Vidyapith, Nirmali. Monthly fee ₹800–₹1,000, one-time admission ₹5,500, transport ₹600–₹1,500 by distance. Simple 4-step admission — enquire online or call 9006308822.' },
  { id: 'facilities', path: '/facilities/', name: 'Facilities',
    title: 'Facilities — Smart Classes, Library, Computer Lab & Bus | ATV Nirmali',
    desc: 'Smart classrooms, computer lab, library, sports ground, CCTV security, mineral water and safe school bus at Anupam Takshashila Vidyapith, Nirmali, Supaul.' },
  { id: 'gallery', path: '/gallery/', name: 'Gallery',
    title: 'School Photo Gallery | Anupam Takshashila Vidyapith, Nirmali',
    desc: 'Photos of Olympiad winners, Holi celebration, the library and the IIT-IIM mentorship programme at Anupam Takshashila Vidyapith (ATV), Nirmali.' },
  { id: 'notices', path: '/notices/', name: 'Notices',
    title: 'Notices & Updates 2026-27 | ATV Nirmali',
    desc: 'Latest notices from Anupam Takshashila Vidyapith, Nirmali: admissions 2026-27, exam schedule, PTM, events and Navodaya / Sainik School coaching registration.' },
  { id: 'blog', path: '/blog/', name: 'Navodaya & Sainik Prep',
    title: 'Navodaya, Sainik School & RIMC Coaching in Nirmali | ATV Blog',
    desc: 'Guides for JNV (Navodaya) 2026, Sainik School AISSEE 2026, RIMC and R.K. Mission entrance exams, and how ATV Nirmali prepares Class V–VII students for them.' },
  { id: 'contact', path: '/contact/', name: 'Contact',
    title: 'Contact ATV Nirmali — Address, Phone & Map | Anupam Takshashila Vidyapith',
    desc: 'Anupam Takshashila Vidyapith, Ward No. 4, Chawal Mandi, Sharma Gali, Nirmali, Supaul, Bihar 847452. Call 9006308822 / 8789724803, WhatsApp 8789724803, email atv.nirmali@gmail.com.' },
];

// Villages we serve. km = road distance from the school on Google Maps; leave it null
// when not verified, and the page will ask parents to call for route and fee instead.
const VILLAGES = [
  { slug: 'rasuar', en: 'Rasuar', hi: 'रसुआर', km: 4.0 },
  { slug: 'majhari', en: 'Majhari', hi: 'मझारी', km: 5.4 },
  { slug: 'chhajna', en: 'Chhajna', hi: 'छजना', km: 5.6 },
  { slug: 'basuari', en: 'Basuari', hi: 'बसुआरी', km: 11.7 },
  { slug: 'bhutha', en: 'Bhutha', hi: 'भुतहा', km: null },
  { slug: 'ithari', en: 'Ithari', hi: 'इटहरी', km: null },
  { slug: 'laxminiya', en: 'Laxminiya', hi: 'लक्ष्मीनिया', km: null },
];

// Transport fee slabs from the admissions page.
const busFee = km => km <= 5 ? '₹600–₹800' : km <= 8 ? '₹900' : km <= 10 ? '₹1,100' : km <= 15 ? '₹1,300' : '₹1,500';

function villageFaq(v) {
  const far = v.km != null;
  return [
    [`Which is a good school near ${v.en}?`, `${v.hi} के पास अच्छा स्कूल कौन सा है?`,
      `Anupam Takshashila Vidyapith (ATV), Ward No. 4, Chawal Mandi, Sharma Gali, Nirmali${far ? `, about ${v.km} km by road from ${v.en}` : `, close to ${v.en}`}. It is a Bihar Government registered school with a CBSE-oriented curriculum, from Play School to Class VIII, with smart classes, Navodaya and Sainik School preparation and IIT-IIM mentorship. Phone: 9006308822.`,
      `अनुपम तक्षशिला विद्यापीठ (ATV), वार्ड नं. 4, चावल मंडी, शर्मा गली, निर्मली${far ? ` — ${v.hi} से सड़क मार्ग से लगभग ${v.km} km` : ` — ${v.hi} के निकट`}। बिहार सरकार से पंजीकृत, CBSE-आधारित पाठ्यक्रम, प्ले स्कूल से कक्षा VIII, स्मार्ट क्लास, नवोदय व सैनिक स्कूल की तैयारी और IIT-IIM मेंटरशिप। संपर्क: 9006308822।`],
    [`Is there a school bus from ${v.en} to ATV Nirmali?`, `क्या ${v.hi} से ATV निर्मली के लिए स्कूल बस है?`,
      far ? `Yes. ${v.en} is about ${v.km} km from the school, so the transport fee is about ${busFee(v.km)} per month. Call 9006308822 to confirm the pick-up point and timing.`
        : `Yes, ATV runs school transport around Nirmali. The fee depends on distance (₹600 to ₹1,500 per month). Call 9006308822 to confirm the route, pick-up point and fee from ${v.en}.`,
      far ? `हाँ। ${v.hi} विद्यालय से लगभग ${v.km} km है, इसलिए परिवहन शुल्क लगभग ${busFee(v.km)} प्रति माह है। पिक-अप पॉइंट और समय के लिए 9006308822 पर कॉल करें।`
        : `हाँ, ATV निर्मली और आस-पास के क्षेत्रों में स्कूल बस चलाता है। शुल्क दूरी के अनुसार ₹600 से ₹1,500 प्रति माह है। ${v.hi} से रूट, पिक-अप पॉइंट और शुल्क के लिए 9006308822 पर कॉल करें।`],
    [`How can parents from ${v.en} take admission?`, `${v.hi} के अभिभावक प्रवेश कैसे लें?`,
      `Admissions for 2026-27 are open from Play School to Class VIII. Fill the inquiry form on atvnirmali.org/admissions/, or call/WhatsApp 9006308822 or 8789724803, and visit the campus in Nirmali (Mon–Sat, 7:30 AM–2:00 PM).`,
      `सत्र 2026-27 के लिए प्ले स्कूल से कक्षा VIII तक प्रवेश प्रारंभ है। atvnirmali.org/admissions/ पर पूछताछ फॉर्म भरें या 9006308822 / 8789724803 पर कॉल या WhatsApp करें, और निर्मली में विद्यालय आएं (सोम–शनि, सुबह 7:30–दोपहर 2:00)।`],
  ];
}

function villageSection(v) {
  const far = v.km != null;
  const others = VILLAGES.filter(o => o !== v).map(o => `<a href="/school-near-${o.slug}/"><span class="hi">${o.hi}</span><span class="en">${o.en}</span></a>`).join('');
  const faq = villageFaq(v).map(([qe, qh, ae, ah]) =>
    `    <details class="faqi"><summary><span class="hi">${qh}</span><span class="en">${qe}</span></summary><p class="hi">${ah}</p><p class="en">${ae}</p></details>`).join('\n');
  const wa = encodeURIComponent(`Admission Inquiry 2026-27 from ${v.en} - ATV Nirmali`);
  return `<div id="page-near-${v.slug}" class="page active">
<div class="phero"><div class="con">
  <span class="badge bi hi">प्रवेश प्रारंभ 2026-27</span><span class="badge bi en">Admissions Open 2026-27</span>
  <h1 class="hx mt1" style="color:#fff"><span class="hi" style="font-family:'Tiro Devanagari Hindi',serif">${v.hi} के पास<br><span style="color:var(--gb)">अच्छा स्कूल</span></span><span class="en">School near<br><span style="color:var(--gb);font-style:italic">${v.en}</span></span></h1>
  <div class="divl divc" style="background:linear-gradient(90deg,var(--g),var(--gb));margin-top:20px"></div>
</div></div>
<section class="sec" style="background:var(--cr2)"><div class="con">
  <div class="tc mb2">
    <span class="badge hi">अनुपम तक्षशिला विद्यापीठ, निर्मली</span><span class="badge en">Anupam Takshashila Vidyapith, Nirmali</span>
    <h2 class="hl mt1 hi" style="font-family:'Tiro Devanagari Hindi',serif">${v.hi} के बच्चों के लिए निर्मली का विश्वसनीय विद्यालय</h2>
    <h2 class="hl mt1 en">Nirmali's trusted school for children from ${v.en}</h2>
    <div class="divl divc"></div>
  </div>
  <p class="hi" style="max-width:820px;margin:0 auto;text-align:center;font-size:15px;color:var(--t2);line-height:1.9">${v.hi} ${far ? `से सिर्फ लगभग ${v.km} km (सड़क मार्ग)` : 'के निकट'} निर्मली में स्थित अनुपम तक्षशिला विद्यापीठ (ATV) बिहार सरकार से पंजीकृत विद्यालय है। यहाँ प्ले स्कूल से कक्षा VIII तक CBSE-आधारित पाठ्यक्रम, हिन्दी व अंग्रेज़ी माध्यम, स्मार्ट क्लास, और नवोदय व सैनिक स्कूल की विशेष तैयारी होती है। ${v.hi} से बच्चों के लिए सुरक्षित स्कूल बस उपलब्ध है।</p>
  <p class="en" style="max-width:820px;margin:0 auto;text-align:center;font-size:15px;color:var(--t2);line-height:1.9">Anupam Takshashila Vidyapith (ATV) is a Bihar Government registered school in Nirmali, ${far ? `about ${v.km} km by road from ${v.en}` : `close to ${v.en}`}. It teaches a CBSE-oriented curriculum from Play School to Class VIII in Hindi and English medium, with smart classes and special Navodaya and Sainik School preparation. A safe school bus is available for children from ${v.en}.</p>
  <div class="vfacts">
    <div class="vfact"><b>${far ? `~${v.km} km` : 'Nirmali'}</b><span class="hi">${far ? `${v.hi} से दूरी` : 'विद्यालय का स्थान'}</span><span class="en">${far ? `From ${v.en}` : 'School location'}</span></div>
    <div class="vfact"><b>${far ? busFee(v.km) : '₹600–₹1,500'}</b><span class="hi">बस शुल्क / माह</span><span class="en">Bus fee / month</span></div>
    <div class="vfact"><b>Play–VIII</b><span class="hi">कक्षाएं</span><span class="en">Classes</span></div>
    <div class="vfact"><b>7:30–2:00</b><span class="hi">सोम–शनि</span><span class="en">Mon–Sat</span></div>
  </div>
</div></section>
<section class="sec" style="background:#fff"><div class="con g2">
  <div>
    <span class="badge hi">${v.hi} के अभिभावक ATV क्यों चुनते हैं</span><span class="badge en">Why parents from ${v.en} choose ATV</span>
    <div class="vlist">
      <p><span class="hi">स्मार्ट क्लास और कंप्यूटर लैब</span><span class="en">Smart classrooms and computer lab</span></p>
      <p><span class="hi">नवोदय, सैनिक स्कूल, RMS, RIMC की तैयारी</span><span class="en">Navodaya, Sainik School, RMS and RIMC preparation</span></p>
      <p><span class="hi">IIT-IIM मेंटरशिप प्रोग्राम</span><span class="en">IIT-IIM mentorship programme</span></p>
      <p><span class="hi">प्रशिक्षित शिक्षक (B.Ed / D.El.Ed)</span><span class="en">Trained teachers (B.Ed / D.El.Ed)</span></p>
      <p><span class="hi">CCTV सुरक्षा और स्वच्छ पेयजल</span><span class="en">CCTV security and clean drinking water</span></p>
      <p><span class="hi">${v.hi} से सुरक्षित स्कूल बस</span><span class="en">Safe school bus from ${v.en}</span></p>
    </div>
  </div>
  <div>
    <span class="badge hi">शुल्क संरचना 2026-27</span><span class="badge en">Fees 2026-27</span>
    <div class="vlist" style="grid-template-columns:1fr">
      <p><span class="hi">नर्सरी–UKG: ₹800 / माह</span><span class="en">Nursery–UKG: ₹800 / month</span></p>
      <p><span class="hi">कक्षा I–V: ₹900 / माह</span><span class="en">Classes I–V: ₹900 / month</span></p>
      <p><span class="hi">कक्षा VI–VIII: ₹1,000 / माह</span><span class="en">Classes VI–VIII: ₹1,000 / month</span></p>
      <p><span class="hi">प्रवेश के समय एकमुश्त: ₹5,500</span><span class="en">One-time at admission: ₹5,500</span></p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:24px">
      <a class="btn bg" href="/admissions/"><span class="hi">प्रवेश फॉर्म भरें →</span><span class="en">Apply for Admission →</span></a>
      <a class="btn bom" href="tel:+919006308822">📞 9006308822</a>
      <a class="btn bom" href="https://wa.me/918789724803?text=${wa}" target="_blank" rel="noopener">📲 WhatsApp</a>
    </div>
  </div>
</div></section>
<section class="sec" style="background:var(--cr)"><div class="con">
  <div class="tc mb2">
    <span class="badge hi">प्रश्न</span><span class="badge en">FAQ</span>
    <h2 class="hl mt1 hi" style="font-family:'Tiro Devanagari Hindi',serif">${v.hi} के अभिभावकों के प्रश्न</h2>
    <h2 class="hl mt1 en">Questions from parents in ${v.en}</h2>
    <div class="divl divc"></div>
  </div>
  <div class="faql">
${faq}
  </div>
  <div class="tc" style="margin-top:40px">
    <p class="hi" style="font-size:13px;color:var(--t3);margin-bottom:12px">आस-पास के अन्य क्षेत्र</p><p class="en" style="font-size:13px;color:var(--t3);margin-bottom:12px">Other areas we serve</p>
    <div class="areas"><a href="/"><span class="hi">निर्मली</span><span class="en">Nirmali</span></a>${others}</div>
  </div>
</div></section>
</div>`;
}

for (const v of VILLAGES) PAGES.push({
  id: `near-${v.slug}`, path: `/school-near-${v.slug}/`, name: `School near ${v.en}`, village: v,
  title: `School near ${v.en} — Anupam Takshashila Vidyapith, Nirmali`,
  desc: `Looking for a good school near ${v.en}? Anupam Takshashila Vidyapith, Nirmali${v.km != null ? ` is ~${v.km} km away` : ' is close by'}: Play School to Class VIII, CBSE-oriented, smart classes, Navodaya & Sainik prep, school bus${v.km != null ? ` (${busFee(v.km)}/month)` : ''}. Admissions 2026-27 open. Call 9006308822.`,
});

const areaLinks = VILLAGES.map(v => `<a href="/school-near-${v.slug}/"><span class="hi">${v.hi}</span><span class="en">${v.en}</span></a>`).join('');
const AREAS_HOME = `<!-- AREAS WE SERVE -->
<section class="sec" id="areas" style="background:#fff"><div class="con">
  <div class="tc fu mb2">
    <span class="badge hi">हम कहाँ सेवा देते हैं</span><span class="badge en">Areas We Serve</span>
    <h2 class="hl mt1 hi" style="font-family:'Tiro Devanagari Hindi',serif">निर्मली और आस-पास के गाँवों का स्कूल</h2>
    <h2 class="hl mt1 en">School in Nirmali &amp; Nearby Villages</h2>
    <div class="divl divc"></div>
    <p class="hi" style="max-width:720px;margin:16px auto 0;font-size:15px;color:var(--t3)">निर्मली शहर और लगभग 20 km के दायरे के गाँवों से बच्चे ATV आते हैं। स्कूल बस की सुविधा उपलब्ध है।</p>
    <p class="en" style="max-width:720px;margin:16px auto 0;font-size:15px;color:var(--t3)">Children come to ATV from Nirmali town and villages within about 20 km. School bus available.</p>
  </div>
  <div class="areas fu">${areaLinks}</div>
</div></section>`;
const AREAS_FOOTER = `<div class="fareas"><span class="hi">आस-पास के क्षेत्र: </span><span class="en">Areas we serve: </span>${VILLAGES.map(v => `<a href="/school-near-${v.slug}/">School near ${v.en}</a>`).join(' ')}</div>`;

const school = {
  '@type': ['School', 'Preschool'],
  '@id': `${SITE}/#school`,
  name: NAME,
  alternateName: ['ATV Nirmali', 'अनुपम तक्षशिला विद्यापीठ', 'Anupam Takshashila Vidyapeeth', 'Anupam Takshshila Vidyapith'],
  url: `${SITE}/`,
  logo: `${SITE}/logo.png`,
  image: `${SITE}/og-image.jpg`,
  description: 'Bihar Government registered co-educational school in Nirmali, Supaul with a CBSE-oriented curriculum, offering Play School, Nursery, LKG, UKG and Classes I–VIII in Hindi and English medium, with smart classes, Navodaya (JNVST), Sainik School (AISSEE), RMS, RIMC and R.K. Mission entrance preparation, and mentorship from IIT and IIM alumni.',
  foundingDate: '2020',
  telephone: '+91-9006308822',
  email: 'atv.nirmali@gmail.com',
  address: { '@type': 'PostalAddress', streetAddress: 'Ward No. 4, Chawal Mandi, Sharma Gali', addressLocality: 'Nirmali',
    addressRegion: 'Bihar', postalCode: '847452', addressCountry: 'IN' },
  geo: { '@type': 'GeoCoordinates', latitude: 26.310858, longitude: 86.575209 },
  hasMap: 'https://maps.app.goo.gl/qR3qbDvkRSYq1WPu6',
  areaServed: [
    { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', latitude: 26.310858, longitude: 86.575209 }, geoRadius: '20000' },
    { '@type': 'City', name: 'Nirmali' },
    { '@type': 'AdministrativeArea', name: 'Supaul district' },
    ...VILLAGES.map(v => ({ '@type': 'Place', name: `${v.en}, Bihar` })),
  ],
  contactPoint: [
    { '@type': 'ContactPoint', telephone: '+91-9006308822', contactType: 'admissions', availableLanguage: ['Hindi', 'English'] },
    { '@type': 'ContactPoint', telephone: '+91-8789724803', contactType: 'customer support', availableLanguage: ['Hindi', 'English'] },
  ],
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '07:30', closes: '14:00' }],
  identifier: { '@type': 'PropertyValue', name: 'Bihar Government Registration No.', value: '20811012024118185825' },
  employee: { '@type': 'Person', name: 'Sushil Kumar Sahu', jobTitle: 'Director cum Principal',
    image: `${SITE}/images/sushil-kumar-sahu-principal-atv-nirmali.webp` },
  knowsLanguage: ['hi', 'en'],
  sameAs: ['https://www.instagram.com/atv_nirmali/', 'https://www.facebook.com/share/1ChEcXhxNf/'],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Classes and programmes', itemListElement: [
    'Play School, Nursery, LKG, UKG', 'Classes I to VIII', 'Navodaya Vidyalaya (JNVST) entrance preparation',
    'Sainik School (AISSEE), RMS, RIMC and R.K. Mission entrance preparation',
  ].map(n => ({ '@type': 'Offer', itemOffered: { '@type': 'Course', name: n, provider: { '@id': `${SITE}/#school` } } })) },
};

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = s => s.replace(/<[^>]+>/g, '').trim();

const tpl = readFileSync('src/site.html', 'utf8');
const mainStart = tpl.indexOf('<main>') + '<main>'.length;
const mainEnd = tpl.indexOf('</main>');
const before = tpl.slice(0, mainStart), after = tpl.slice(mainEnd);
const sections = {};
const re = /<!-- ===== [A-Z]+ ===== -->\s*<div id="page-([a-z]+)" class="page[^"]*">/g;
const marks = [...tpl.slice(mainStart, mainEnd).matchAll(re)];
marks.forEach((m, i) => {
  const end = i + 1 < marks.length ? marks[i + 1].index : mainEnd - mainStart;
  sections[m[1]] = tpl.slice(mainStart, mainEnd).slice(m.index, end).trim()
    .replace(/class="page[^"]*"/, 'class="page active"');
});
for (const p of PAGES) if (!p.village && !sections[p.id]) throw new Error(`section page-${p.id} not found in template`);

// FAQ schema is generated from the visible FAQ on the home page, so the two never drift apart.
const faq = [...sections.home.matchAll(/<summary><span class="hi">(.*?)<\/span><span class="en">(.*?)<\/span><\/summary><p class="hi">(.*?)<\/p><p class="en">(.*?)<\/p>/g)]
  .flatMap(([, qh, qe, ah, ae]) => [[qe, ae], [qh, ah]])
  .map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } }));
if (faq.length === 0) throw new Error('FAQ section not found on home page');

const urlOf = id => PAGES.find(p => p.id === id).path;

function render(page) {
  const url = SITE + page.path;
  const graph = [school,
    { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: NAME, inLanguage: ['hi-IN', 'en-IN'], publisher: { '@id': `${SITE}/#school` } },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: page.title, description: page.desc, inLanguage: ['hi-IN', 'en-IN'],
      isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#school` },
      ...(page.village && { spatialCoverage: { '@type': 'Place', name: `${page.village.en}, Bihar` } }) }];
  if (page.id === 'home') graph.push({ '@type': 'FAQPage', '@id': `${SITE}/#faq`, mainEntity: faq });
  else graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: page.name, item: url }] });
  if (page.village) graph.push({ '@type': 'FAQPage', '@id': `${url}#faq`, mainEntity: villageFaq(page.village)
    .flatMap(([qe, qh, ae, ah]) => [[qe, ae], [qh, ah]])
    .map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });

  const seo = `<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.desc)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#7B1D1D">
<meta name="geo.region" content="IN-BR">
<meta name="geo.placename" content="Nirmali, Supaul, Bihar">
<meta name="geo.position" content="26.310858;86.575209">
<meta name="ICBM" content="26.310858, 86.575209">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${NAME}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="hi_IN">
<meta property="og:locale:alternate" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;

  let html = (before.replace('<!--SEO-->', seo) + '\n' + (page.village ? villageSection(page.village) : sections[page.id]) + '\n' + after)
    .replace('<!--AREAS-HOME-->', AREAS_HOME).replace('<!--AREAS-FOOTER-->', AREAS_FOOTER);
  // Links become real URLs so search engines can crawl every page.
  html = html.replace(/<a ([^>]*?)onclick="go\('([a-z]+)'\)(;closeMob\(\))?"([^>]*)>/g, (_, a, id, close, b) => {
    const cls = `${a}${b}`.includes('class="nl') ? (id === page.id ? ' aria-current="page"' : '') : '';
    return `<a ${a}href="${urlOf(id)}"${close ? ' onclick="closeMob()"' : ''}${cls}${b}>`;
  });
  html = html.replace(/class="nl on"/g, 'class="nl"')
    .replace(/<a class="nl"([^>]*)aria-current="page"/g, '<a class="nl on"$1aria-current="page"');
  // Remaining go() callers are buttons; go() now navigates to the real URL.
  html = html.replace(/function go\(page\)\{[\s\S]*?\n\}\n/, `var URLS=${JSON.stringify(Object.fromEntries(PAGES.map(p => [p.id, p.path])))};
function go(page){if(URLS[page])location.href=URLS[page];}
`);
  return html;
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
for (const p of PAGES) {
  const dir = 'dist' + p.path;
  mkdirSync(dir, { recursive: true });
  writeFileSync(dir + 'index.html', render(p));
}

// 404 page: home shell with a short message, not indexed.
const notFound = render(PAGES[0])
  .replace(/<title>.*?<\/title>/, '<title>Page not found | ATV Nirmali</title>')
  .replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex">')
  .replace(/<link rel="canonical"[^>]*>\n/, '')
  .replace(/<script type="application\/ld\+json">.*?<\/script>/, '')
  .replace(/<div id="page-home" class="page active">[\s\S]*?(?=\n<\/main>)/, `<div id="page-home" class="page active"><section class="sec"><div class="con tc">
  <h1 class="hl">404</h1><p class="hi" style="margin:16px 0 28px">यह पेज नहीं मिला।</p><p class="en" style="margin:16px 0 28px">This page could not be found.</p>
  <a class="btn bg blg" href="/"><span class="hi">होम पेज पर जाएं →</span><span class="en">Go to Home →</span></a></div></section></div>`);
writeFileSync('dist/404.html', notFound);

writeFileSync('dist/llms.txt', readFileSync('public/llms.txt', 'utf8') +
  `\n## Areas served (school bus available)\n${VILLAGES.map(v => `- [School near ${v.en}](${SITE}/school-near-${v.slug}/)${v.km != null ? ` — about ${v.km} km by road` : ''}`).join('\n')}\n`);

writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url><loc>${SITE}${p.path}</loc><lastmod>${TODAY}</lastmod><priority>${p.id === 'home' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${PAGES.length} pages + 404, sitemap with ${PAGES.length} URLs, ${faq.length} FAQ entries.`);
