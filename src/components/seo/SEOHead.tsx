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
  ogImage = "https://storage.googleapis.com/gpt-engineer-file-uploads/70Oyqk3yS1aqTxNNtCZfKFXH8aC2/social-images/social-1767276802028-muhazi dc in previewing.png",
  keywords = "dental clinic, dentist, Rwamagana, Rwanda, teeth cleaning, dental care, root canal, teeth whitening, dental implants",
  type = "website",
}: SEOHeadProps) => {
  const fullTitle = title.includes("Muhazi") ? title : `${title} | Muhazi Dental Clinic`;
  const siteUrl = "https://muhazidental.rw";
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper function to update or create meta tag
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement("meta");
        if (property) {
          element.setAttribute("property", name);
        } else {
          element.setAttribute("name", name);
        }
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Update meta tags
    updateMeta("description", description);
    updateMeta("keywords", keywords);

    // Open Graph tags
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:url", canonicalUrl, true);
    updateMeta("og:image", ogImage, true);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", "Muhazi Dental Clinic", true);
    updateMeta("og:locale", "en_RW", true);

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", ogImage);
    updateMeta("twitter:site", "@muhazidc");

    // Additional SEO meta tags
    updateMeta("robots", "index, follow");
    updateMeta("author", "Muhazi Dental Clinic");
    updateMeta("geo.region", "RW-02");
    updateMeta("geo.placename", "Rwamagana");

  }, [fullTitle, description, canonicalUrl, ogImage, keywords, type]);

  return null;
};

export default SEOHead;
