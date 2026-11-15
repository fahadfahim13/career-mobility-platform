import type { StaticImageData } from "next/image";
import dubai from "../../public/images/dubai.webp";
import frankfurt from "../../public/images/frankfurt.webp";
import london from "../../public/images/london.webp";
import rotterdam from "../../public/images/rotterdam.webp";
import singapore from "../../public/images/singapore.webp";
import toronto from "../../public/images/toronto.webp";

/** One public-domain city photo per country. Alt text names the city actually shown. */
export const COUNTRY_PHOTOS: Record<string, { img: StaticImageData; city: string }> = {
  Germany: { img: frankfurt, city: "Frankfurt" },
  Canada: { img: toronto, city: "Toronto" },
  "United Kingdom": { img: london, city: "London" },
  Singapore: { img: singapore, city: "Singapore" },
  "United Arab Emirates": { img: dubai, city: "Dubai" },
  Netherlands: { img: rotterdam, city: "Rotterdam" },
};

export function countryPhoto(country: string) {
  return COUNTRY_PHOTOS[country];
}
