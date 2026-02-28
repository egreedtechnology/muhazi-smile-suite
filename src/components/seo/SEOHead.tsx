import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  type?: "website" | "article";
}

const SEOHead = ({
  title,
  description,
  canonical,
  ogImage = "https://muhazidentalclinic.org/mdc-logo.jpg",
  keywords = "dental clinic, dentist, Rwamagana, Rwanda, teeth cleaning, dental care, root canal, teeth whitening, dental implants",
  type = "website",
}: SEOHeadProps) => {
  const fullTitle = title.includes("Muhazi") ? title : `${title} | Muhazi Dental Clinic`;
  const siteUrl = "https://muhazidentalclinic.org";
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  useEffect(() => {
    document.title = fullTitle;

    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (!element) {
        element = document.createElement("meta");
        if (property) element.setAttribute("property", name);
        else element.setAttribute("name", name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    updateMeta("description", description);
    updateMeta("keywords", keywords);
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "Muhazi Dental Clinic", true);
    updateMeta("og:locale", "en_RW", true);
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);
    updateMeta("twitter:site", "@muhazidc");
    updateMeta("robots", "index, follow");
    updateMeta("author", "Muhazi Dental Clinic");
    updateMeta("geo.region", "RW-02");
    updateMeta("geo.placename", "Rwamagana");

    // BreadcrumbList structured data for inner pages
    if (canonical && canonical !== "/") {
      const breadcrumbId = "seo-breadcrumb-ld";
      let breadcrumbScript = document.getElementById(breadcrumbId) as HTMLScriptElement;
      if (!breadcrumbScript) {
        breadcrumbScript = document.createElement("script");
        breadcrumbScript.id = breadcrumbId;
        breadcrumbScript.type = "application/ld+json";
        document.head.appendChild(breadcrumbScript);
      }
      const pageName = title.split("|")[0].trim();
      breadcrumbScript.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
          { "@type": "ListItem", "position": 2, "name": pageName, "item": canonicalUrl },
        ],
      });
    }
  }, [fullTitle, description, canonicalUrl, ogImage, keywords, type, canonical]);

  return null;
};

export default SEOHead;
