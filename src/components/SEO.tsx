import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
  url?: string;
  image?: string;
  schema?: Record<string, any>;
  noindex?: boolean;
}

export function SEO({ 
  title = "Madhus Fashion House | Luxury Class & Style", 
  description = "Discover our meticulously curated selection of modern luxury pieces.",
  name = "Madhus Fashion House",
  type = "website",
  url = "https://madhusfashion.com",
  image = "/logo.png",
  schema,
  noindex = false
}: SEOProps) {
  
  const formattedTitle = title.includes("Madhus Fashion") ? title : `${title} | Madhus Fashion House`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{formattedTitle}</title>
      <meta name='description' content={description} />
      
      {/* Canonical Tag */}
      <link rel="canonical" href={url} />

      {/* Indexing instructions */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* OpenGraph tags for Facebook, LinkedIn, WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content="@madhusfashion" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
