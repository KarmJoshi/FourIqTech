import fs from 'fs';
import path from 'path';

// 💡 STANDALONE DEMO FOR THE USER
const BLOG_DATA_PATH = path.join(process.cwd(), 'src/data/blogPosts.ts');
const blogDataFile = fs.readFileSync(BLOG_DATA_PATH, 'utf8');

const SERVICE_PAGES = [
  { keywords: ['saas', 'custom platform', 'product development', 'software architecture'], url: '/services/custom-saas-platform-development', title: 'Custom SaaS Platform Development' },
  { keywords: ['modernization', 'legacy', 'strangler fig', 'refactoring', 'technical debt'], url: '/services/legacy-web-application-modernization', title: 'Legacy Web Application Modernization' },
  { keywords: ['performance', 'optimization', 'latency', 'core web vitals', 'speed'], url: '/blog/nextjs-enterprise-performance-optimization-scalability-speed', title: 'Next.js Enterprise Performance Optimization' },
  { keywords: ['design system', 'ui/ux', 'atomic design', 'component library'], url: '/blog/enterprise-react-design-system-implementation', title: 'Enterprise React Design System Implementation' }
];

function spiderForwardLink(content, brief, blogDataFile) {
  let updatedContent = content;
  let linksAdded = 0;

  for (const service of SERVICE_PAGES) {
    if (linksAdded >= 1) break;
    const match = service.keywords.find(kw => updatedContent.toLowerCase().includes(kw));
    if (match && !updatedContent.includes(service.url)) {
      const regex = new RegExp(`(?<!<a[^>]*>)(${match})`, 'gi');
      updatedContent = updatedContent.replace(regex, `<a href="${service.url}">${service.title}</a>`);
      linksAdded++;
    }
  }

  const slugMatches = [...blogDataFile.matchAll(/slug:\s*'([^']+)'/g)];
  const titleMatches = [...blogDataFile.matchAll(/title:\s*'([^']+)'/g)];
  
  for (let i = 0; i < slugMatches.length; i++) {
    if (linksAdded >= 3) break;
    const slug = slugMatches[i][1];
    const title = titleMatches[i] ? titleMatches[i][1] : 'related article';
    const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const hasMatch = titleWords.some(w => updatedContent.toLowerCase().includes(w));

    if (hasMatch && !updatedContent.includes(`/blog/${slug}`) && slug !== brief.slug) {
      const pStarts = [...updatedContent.matchAll(/<p>/g)];
      if (pStarts.length >= 2) {
        const insertPos = updatedContent.indexOf('</p>', pStarts[1].index) + 4;
        const linkHtml = `\n<p>For more engineering context, see our deep-dive on <a href="/blog/${slug}">${title}</a>.</p>`;
        updatedContent = updatedContent.slice(0, insertPos) + linkHtml + updatedContent.slice(insertPos);
        linksAdded++;
      }
    }
  }
  return updatedContent;
}

const pillarBrief = {
  slug: 'enterprise-nextjs-performance-optimization-guide',
  keyword: 'nextjs enterprise performance optimization'
};

const pillarContent = `
<h1>Next.js Enterprise Performance Optimization: Beyond the Basics of Vercel Analytics</h1>
<p>Most enterprise teams think they've mastered performance when their Lighthouse score hits 90+. But for a global SaaS platform with 50,000+ hourly active users, a Lighthouse score is a vanity metric. What actually matters is <strong>TBT (Total Blocking Time)</strong> and <strong>INP (Interaction to Next Paint)</strong> at the 95th percentile. If your <strong>nextjs enterprise performance optimization</strong> strategy doesn't account for main-thread congestion from heavy tracking scripts and hydrated components, you're building a 'fast' site that feels sluggish to real users.</p>

<p>At FouriqTech, we've seen LCP drops of 60% not by changing the hosting, but by refactoring how the data layer interacts with the UI. The biggest bottleneck in modern Next.js apps isn't the server-side rendering; it's the client-side execution budget.</p>

<h2>The Client-Side Execution Budget: Why Hydration is Your Enemy</h2>
<p>The 'Hydration' phase in React is when a fast-loading static page becomes an interactive application. In complex enterprise dashboards, this is where the main thread dies. If you have 500ms of scripting time before a user can click a button, your INP is already failing. The solution? <strong>Selective Hydration</strong> and <strong>Server Components</strong>.</p>

<pre><code>// Example of an optimized Server Component
import { Suspense } from 'react';
import HeavyChart from './HeavyChart'; // Client component

export default function Dashboard() {
  return (
    <div>
      <h1>Enterprise Data Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        {/* Only this part hydrates when it enters the viewport */}
        <HeavyChart />
      </Suspense>
    </div>
  );
}</code></pre>

<h2>Negative Knowledge: What NOT to Do</h2>
<p>Stop overusing <code>useMemo</code> and <code>useCallback</code> unless you are dealing with computationally expensive loops or preventing unnecessary re-renders in massive lists. In 90% of cases, the overhead of the dependency array check is more expensive than the re-render itself. Performance optimization is about removing work, not just memoizing it.</p>

<h3>Avoiding the Layout Shift Trap</h3>
<p>CLS (Cumulative Layout Shift) is often caused by 'late' images or font loading. In enterprise apps, the primary culprit is 'late' dynamic data. Use CSS aspect-ratio on containers to reserve space before the data-heavy API response arrives. This is a critical part of a modern <a href="/services/legacy-web-application-modernization">Legacy Web Application Modernization</a> where old patterns of 'pop-in' content are replaced with stable, high-performance UI components.</p>
`;

const processedContent = spiderForwardLink(pillarContent, pillarBrief, blogDataFile);

console.log(JSON.stringify({
  title: "Next.js Enterprise Performance Optimization: Beyond the Basics of Vercel Analytics",
  slug: "enterprise-nextjs-performance-optimization-guide",
  content: processedContent
}, null, 2));
