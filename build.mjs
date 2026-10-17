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
for (const p of PAGES) if (!sections[p.id]) throw new Error(`section page-${p.id} not found in template`);

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
      isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': `${SITE}/#school` } }];
  if (page.id === 'home') graph.push({ '@type': 'FAQPage', '@id': `${SITE}/#faq`, mainEntity: faq });
  else graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: page.name, item: url }] });

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

  let html = before.replace('<!--SEO-->', seo) + '\n' + sections[page.id] + '\n' + after;
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

writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(p => `  <url><loc>${SITE}${p.path}</loc><lastmod>${TODAY}</lastmod><priority>${p.id === 'home' ? '1.0' : '0.8'}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${PAGES.length} pages + 404, sitemap with ${PAGES.length} URLs, ${faq.length} FAQ entries.`);
