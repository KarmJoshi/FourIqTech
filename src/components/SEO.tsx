import { Helmet } from 'react-helmet-async';

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
  url = 'https://fouriqtech.com', 
  image = 'https://fouriqtech.com/og-image.jpg',
  schema,
  article = false
}: SEOProps) {
  // Base site-wide Organization / LocalBusiness schema
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Four IQ Tech",
    "url": "https://fouriqtech.com",
    "logo": "https://fouriqtech.com/4Q.png",
    "image": "https://fouriqtech.com/og-image.jpg",
    "description": "Leading global web design agency. Custom websites and SEO.",
    "telephone": "+910000000000"
  };

  const schemasToRender = schema 
    ? (Array.isArray(schema) ? [baseSchema, ...schema] : [baseSchema, schema])
    : [baseSchema];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Canonical Link */}
      <link rel="canonical" href={url} />

      {/* Dynamic JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schemasToRender)}
      </script>
    </Helmet>
  );
}
