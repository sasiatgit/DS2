const email = (
  process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "contact@durgasoftwaresolutions.com"
).trim();
const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
  /[^0-9]/g,
  "",
);
export const business = {
  name: "DurgaSoftwareSolutions",
  brand: "DS2",
  founder: "Sasikumar Karikalan",
  title: "Founder & Independent Tech Builder",
  phone: "+919043692020",
  phoneDisplay: "+91-9043692020",
  location: "Chennai, Tamil Nadu, India",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://durgasoftwaresolutions.com",
  email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : undefined,
  whatsapp: whatsapp && /^\d{8,15}$/.test(whatsapp) ? whatsapp : undefined,
  product: { name: "NammaTravelAssist", url: "https://nammatravelassist.com" },
};
export const navigation = [
  ["Services", "/#services"],
  ["Our approach", "/#approach"],
  ["Products", "/#products"],
  ["Clients", "/#clients"],
  ["About", "/#about"],
] as const;
