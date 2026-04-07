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
  // location.pathname already omits search parameters (query strings)
  const cleanPath = location.pathname === '/' ? '' : location.pathname.replace(/\/+$/, '');
  const canonicalUrl = url || `${baseUrl}${cleanPath}`;

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
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical Link - Essential for SEO duplicate content prevention across parameterized URLs */}
      <link rel="canonical" href={canonicalUrl} />
      
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

      {/* Dynamic JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemasToRender)}
      </script>
    </Helmet>
  );
}