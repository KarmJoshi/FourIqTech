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
  
  // Determine canonical URL: prefer explicit prop, otherwise fallback to current path
  const canonicalUrl = url || `${baseUrl}${location.pathname}${location.search}`;

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
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Dynamic JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemasToRender)}
      </script>
    </Helmet>
  );
}