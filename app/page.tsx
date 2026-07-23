import type { Metadata } from "next";
import LandingPage from "@/components/marketing/LandingPage";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/config";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: "https://res.cloudinary.com/drh4ma3hj/image/upload/v1779473509/SabiNote_Purple_SVG_tlzlqm.svg",
    sameAs: [],
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
];

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
