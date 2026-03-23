import fs from 'fs';
import path from 'path';

// 💡 Mocking dependencies for standalone test
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');

const SERVICE_PAGES = [
  { keywords: ['saas', 'custom platform', 'product development', 'software architecture'], url: '/services/custom-saas-platform-development', title: 'Custom SaaS Platform Development' },
  { keywords: ['modernization', 'legacy', 'strangler fig', 'refactoring', 'technical debt'], url: '/services/legacy-web-application-modernization', title: 'Legacy Web Application Modernization' },
  { keywords: ['performance', 'optimization', 'latency', 'core web vitals', 'speed'], url: '/blog/nextjs-enterprise-performance-optimization-scalability-speed', title: 'Next.js Enterprise Performance Optimization' },
  { keywords: ['design system', 'ui/ux', 'atomic design', 'component library'], url: '/blog/enterprise-react-design-system-implementation', title: 'Enterprise React Design System Implementation' }
];

function spiderForwardLink(content, brief, blogDataFile) {
  console.log(`\n🕸️ SPIDER: Forward-linking from new article...`);
  let updatedContent = content;
  let linksAdded = 0;

  // 1. Check for Service Page matches first (High Value)
  for (const service of SERVICE_PAGES) {
    if (linksAdded >= 1) break; // Max 1 service link per post
    const match = service.keywords.find(kw => updatedContent.toLowerCase().includes(kw));
    if (match && !updatedContent.includes(service.url)) {
      const regex = new RegExp(`(?<!<a[^>]*>)(${match})`, 'gi');
      updatedContent = updatedContent.replace(regex, `<a href="${service.url}">${service.title}</a>`);
      linksAdded++;
      console.log(`   🔗 SPIDER: Hard-linked to Service: "${service.title}"`);
    }
  }

  // 2. Check for Pillar/Related Blog matches
  const slugMatches = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)];
  const titleMatches = [...blogDataFile.matchAll(/title:\s*'([^']+)'/g)];
  
  for (let i = 0; i < slugMatches.length; i++) {
    if (linksAdded >= 3) break; // Max 3 total internal links
    const slug = slugMatches[i][1];
    const title = titleMatches[i] ? titleMatches[i][1] : 'related article';
    
    // Simple relevance check: does the title share words with this content?
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const hasMatch = titleWords.some(w => updatedContent.toLowerCase().includes(w));

    if (hasMatch && !updatedContent.includes(`/blog/${slug}`) && slug !== brief.slug) {
      // Find a good place to insert (end of second paragraph or so)
      const pStarts = [...updatedContent.matchAll(/<p>/g)];
      if (pStarts.length >= 2) {
        const insertPos = updatedContent.indexOf('</p>', pStarts[1].index) + 4;
        const linkHtml = `\n<p>For more engineering context, see our deep-dive on <a href="/blog/${slug}">${title}</a>.</p>`;
        updatedContent = updatedContent.slice(0, insertPos) + linkHtml + updatedContent.slice(insertPos);
        linksAdded++;
        console.log(`   🔗 SPIDER: Linked to Pillar: "${title}"`);
      }
    }
  }

  return updatedContent;
}

// 🧪 TEST DATA
const dummyBrief = {
  slug: 'test-new-article',
  keyword: 'saas software architecture'
};

const dummyContent = `
  <h1>The Future of SaaS Software Architecture</h1>
  <p>Building scalable products requires more than just code. You need a robust saas software architecture that can handle multi-tenant growth and high-performance demands.</p>
  <p>In this guide, we'll explore how modern web engineering patterns help startups scale without technical debt.</p>
  <p>We've found that performance is key to user retention. Optimizing for speed is no longer optional.</p>
`;

console.log('--- ORIGINAL CONTENT ---');
console.log(dummyContent);

const updatedContent = spiderForwardLink(dummyContent, dummyBrief, blogDataFile);

console.log('\n--- PROCESSED CONTENT (WITH LINKS) ---');
console.log(updatedContent);

if (updatedContent.includes('/services/custom-saas-platform-development')) {
  console.log('\n✅ TEST PASSED: Service page link injected correctly.');
} else {
  console.log('\n❌ TEST FAILED: Service page link missing.');
}

if (updatedContent.includes('/blog/')) {
  console.log('✅ TEST PASSED: Internal blog link injected correctly.');
} else {
  console.log('❌ TEST FAILED: Internal blog link missing.');
}
