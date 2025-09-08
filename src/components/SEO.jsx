// src/components/SEO.jsx
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Analizador de Instrumentos',
  description = 'Plataforma para analizar instrumentos financieros: fundamentales, volatilidad, correlaciones y más.',
  canonical,
  noindex = false,
  image = '/og-default.png',        // usa el que subas a /public
  imageAlt = 'Analizador de Instrumentos — vista previa',
  siteName = 'Analizador de Instrumentos',
  locale = 'es_AR',
  jsonLd,
}) {
  const robots = noindex ? 'noindex,nofollow' : 'index,follow';
  const href = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
  const origin = href ? new URL(href).origin : undefined;
  const toAbs = (p) => (!p || p.startsWith('http') ? p : (origin ? `${origin}${p}` : p));
  const imageUrl = toAbs(image);

  return (
    <Helmet>
      <html lang="es-AR" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      {href && <link rel="canonical" href={href} />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {href && <meta property="og:url" content={href} />}
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}

      {/* JSON-LD opcional */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
