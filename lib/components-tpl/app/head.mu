<!DOCTYPE html>
<html {{& head.htmlAttributes }} data-route={{& appRoute }} data-lang={{& appLang }}>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1" />
  <meta name="referrer" content="origin-when-cross-origin" />
  <meta name="p:domain_verify" content="829a7514a90250a08cd66b051db8d60f"/>
  <meta name="msvalidate.01" content="BBAC15FA12DBA3AD3245881174758971" />
  {{# auth.jwt }}<meta name="apple-itunes-app" content="app-id=821068605">{{/ auth.jwt }}
  {{# auth.jwt }}<link rel="manifest" href="/manifest.json">{{/ auth.jwt }}
  {{# head.title }}{{& head.title }}{{/ head.title }}
  {{# head.meta }}{{& head.meta }}{{/ head.meta }}
  {{# head.link }}{{& head.link }}{{/ head.link }}
  {{# newRelicScriptTag }}{{& newRelicScriptTag }}{{/ newRelicScriptTag }}
  {{# smartling }}{{> smartling }}{{/ smartling }}
  {{> emarsys }}
  <script id="head-app"></script>
  {{# assetsCssEnabled }}<link id="assets-main-stylesheet" rel="stylesheet" href="{{& assetsUrl }}{{& assets.styles.css }}" />{{/ assetsCssEnabled }}
  {{# head.scripts }}{{& head.scripts }}{{/ head.scripts }}
  <script type="application/ld+json">
  {
    "@context" : "http://schema.org",
    "@type" : "Organization",
    "description": "Gaia is a video subscription service providing over 8,000 ad-free streaming titles in yoga, transformation and seeking truth. Gaia’s mission is to inspire a global community of seekers, dreamers, and doers to empower the evolution of consciousness. ",
    "url" : "https://www.gaia.com/",
    "contactPoint" : {
      "@type" : "ContactPoint",
      "telephone" : "+1-866-284-8058",
      "contactType" : "customer service",
      "numberOfEmployees" : "150",
      "name": "Gaia, Inc.",
      "naics": "519130",
      "address": {
        "@type": "PostalAddress",
        "addressLocality":
        "Louisville",
        "addressRegion": "CO",
        "postalCode":"80027",
        "streetAddress": "833 W South Boulder Rd"
      },
      "location": {
        "@type": "Place",
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "39.987684",
          "longitude": "-105.156735"
        }
      },
      "sameAs" : [
        "https://www.facebook.com/Gaia/",
        "https://www.facebook.com/yogaongaia",
        "https://www.instagram.com/yogaongaia/",
        "https://www.facebook.com/GaiaUnexplained/",
        "https://www.instagram.com/wearegaia/",
        "https://www.pinterest.com/yogaongaia/"
      ]
    }
  }
  </script>
  {{# head.inlineScripts }}{{& head.inlineScripts }}{{/ head.inlineScripts }}
</head>
<body>
  <div id="app">
    {{# config.gtmId }}{{> gtm }}{{/ config.gtmId }}

