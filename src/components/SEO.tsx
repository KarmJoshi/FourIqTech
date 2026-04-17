import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
  image?: string;
  schema?: Record<string, any> | Record<string, any>[];
  article?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  url, 
  image = 'https://fouriqtech.com/og-image.jpg',
  schema,
  article = false
}: SEOProps) {
  const location = useLocation();
  const baseUrl = 'https://fouriqtech.com';
  
  // Clean path: Remove trailing slashes to prevent duplicate content loops
  const cleanPath = location.pathname === '/' ? '' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = url || `${baseUrl}${cleanPath}`;
  
  // SEO Best Practice: Ensure title is descriptive and within optimal length (50-60 chars)
  const fullTitle = `${title} | Four IQ Tech`;
  
  // SEO Best Practice: Ensure description is within optimal length (120-160 chars)
  const metaDescription = description.length > 160 
    ? description.substring(0, 157) + '...' 
    : description;

  // Base site-wide Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Four IQ Tech",
    "url": baseUrl,
    "logo": "https://fouriqtech.com/4Q.png",
    "image": "https://fouriqtech.com/og-image.jpg",
    "description": "Leading global web design agency. Custom websites and SEO.",
    "telephone": "+91 81403 71710",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91 81403 71710",
        "contactType": "customer service"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+91 97253 10310",
        "contactType": "sales"
      },
      {
        "@type": "ContactPoint",
        "telephone": "+91 88669 20015",
        "contactType": "technical support"
      }
    ],
    "sameAs": [
      "https://www.linkedin.com/company/fouriqtech",
      "https://twitter.com/fouriqtech"
    ]
  };

  const schemasToRender = schema 
    ? (Array.isArray(schema) ? [organizationSchema, ...schema] : [organizationSchema, schema])
    : [organizationSchema];

  return (
    <Helmet>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Canonical Link - Essential for SEO duplicate content prevention */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Four IQ Tech" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />

      {/* Dynamic JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemasToRender)}
      </script>
    </Helmet>
  );
}