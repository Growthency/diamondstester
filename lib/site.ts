/**
 * Central brand + site configuration.
 * Rename the business or swap contact details here — nothing else needs editing.
 */
export const site = {
  name: 'CaratIQ',
  legalName: 'CaratIQ Gemological Services',
  tagline: 'Know if your diamond is real.',
  description:
    'CaratIQ is a precision diamond testing and verification service. Upload a photo or book a lab test and get a clear, expert-backed verdict on authenticity, carat, cut and clarity — in minutes, not weeks.',
  // Public-facing URL (used for canonical tags, sitemap, OG). Set in env for prod.
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://caratiq.com',
  locale: 'en_US',

  contact: {
    // The WhatsApp click-to-chat number — digits only, international format, no "+".
    // Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local; this is the fallback.
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801700000000',
    whatsappMessage: "Hi CaratIQ — I'd like to verify a diamond.",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@caratiq.com',
    phone: '+1 (555) 014-2278',
    address: '24 Hatton Garden, London EC1N 8BD, United Kingdom',
    hours: 'Mon–Sat · 9:00–18:00',
  },

  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    x: 'https://x.com/',
    linkedin: 'https://linkedin.com/',
    youtube: 'https://youtube.com/',
  },

  nav: [
    { label: 'Test a Diamond', href: '/#tester' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Services', href: '/services' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
} as const

export const whatsappHref = () => {
  const num = site.contact.whatsapp.replace(/[^\d]/g, '')
  const text = encodeURIComponent(site.contact.whatsappMessage)
  return `https://wa.me/${num}?text=${text}`
}
