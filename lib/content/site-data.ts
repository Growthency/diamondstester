/**
 * Real, business-ready marketing content for Diamonds Tester. Pages import from here so
 * copy stays consistent and there is never a "lorem ipsum" / demo line anywhere.
 */

export const stats = [
  { value: '120k+', label: 'Diamonds verified' },
  { value: '38s', label: 'Average photo verdict' },
  { value: '99.4%', label: 'Lab-match accuracy' },
  { value: '60+', label: 'Countries served' },
]

export const services = [
  {
    id: 'photo',
    name: 'Photo Verification',
    tagline: 'A first-pass verdict in under a minute.',
    price: 'Free',
    description:
      'Upload sharp photos of your stone — table, profile and girdle. Our gemologist-trained model reads facet geometry, light return and surface tells to flag whether it behaves like a natural diamond, a lab-grown, or a simulant such as moissanite or cubic zirconia.',
    features: [
      'Instant brilliance & dispersion read',
      'Moissanite / CZ simulant screening',
      'Facet symmetry & cut-grade hints',
      'Shareable PDF summary',
    ],
    icon: 'Camera',
  },
  {
    id: 'lab',
    name: 'Lab Certification',
    tagline: 'Independent, gradeable, insurance-ready.',
    price: 'from $79',
    description:
      'Ship your stone to our partner laboratory for instrument testing — thermal and electrical conductivity, refractive index, UV fluorescence and spectroscopy. You receive a numbered certificate covering the full 4Cs, origin (natural vs. lab-grown) and a plotted clarity map.',
    features: [
      'Conductivity + spectroscopy testing',
      'Full 4C grading report',
      'Natural vs. lab-grown origin call',
      'Tamper-proof numbered certificate',
    ],
    icon: 'BadgeCheck',
  },
  {
    id: 'mail-in',
    name: 'Mail-in Testing',
    tagline: 'Insured, tracked, back in your hands fast.',
    price: 'from $39',
    description:
      'Prefer a quick verdict without full certification? Send your piece in our insured, tamper-evident mailer. A certified gemologist tests it by hand and returns a concise authenticity report — typically within three business days of arrival.',
    features: [
      'Prepaid insured shipping label',
      'Hand-tested by a certified gemologist',
      'Authenticity + estimated value',
      '3-day average turnaround',
    ],
    icon: 'Package',
  },
]

export const process = [
  {
    step: '01',
    title: 'Snap or send',
    body: 'Upload well-lit photos from your phone, or request an insured mailer for hands-on lab testing. No appointment, no jeweller markup.',
  },
  {
    step: '02',
    title: 'We test',
    body: 'Our model and gemologists read brilliance, dispersion, facet geometry and — for lab tests — conductivity and spectroscopy to separate natural, lab-grown and simulant.',
  },
  {
    step: '03',
    title: 'Clear verdict',
    body: 'You get a plain-English result: real, lab-grown or fake, with confidence, the 4Cs where measurable, and an estimated market value.',
  },
  {
    step: '04',
    title: 'Certify & protect',
    body: 'Upgrade to a numbered certificate for insurance, resale or peace of mind — recognised by jewellers and insurers worldwide.',
  },
]

export const differentiators = [
  {
    title: 'Gemologist-trained, not guesswork',
    body: 'Every model decision is benchmarked against GIA-graded reference stones and reviewed by certified gemologists.',
    icon: 'GraduationCap',
  },
  {
    title: 'Simulants don’t slip through',
    body: 'Moissanite passes cheap diamond pens. We screen for thermal, optical and electrical tells those pens miss entirely.',
    icon: 'ShieldCheck',
  },
  {
    title: 'You own the report',
    body: 'Download a clean PDF for insurance, resale or your own records — yours forever, no subscription required.',
    icon: 'FileCheck2',
  },
  {
    title: 'Privacy by default',
    body: 'Your photos and stones are never shared or sold. Lab samples are tracked and insured end to end.',
    icon: 'Lock',
  },
]

export const fourCs = [
  {
    c: 'Cut',
    summary: 'How well the diamond returns light.',
    body: 'Cut is the only C controlled by human hands and the biggest driver of sparkle. We assess proportions, symmetry and polish to estimate where a stone falls from Excellent to Poor.',
  },
  {
    c: 'Colour',
    summary: 'How close to colourless it is.',
    body: 'Graded D (colourless) to Z (light yellow). The difference between neighbouring grades is subtle but moves price sharply — we benchmark against master stones.',
  },
  {
    c: 'Clarity',
    summary: 'Inclusions and surface blemishes.',
    body: 'From Flawless to Included (I3). We map inclusions and note whether they’re eye-clean — the practical question most buyers actually care about.',
  },
  {
    c: 'Carat',
    summary: 'The diamond’s weight, not its size.',
    body: 'One carat is 0.20 grams. Because price jumps at round weights, a 0.90ct can be far better value than a 1.00ct that looks identical face-up.',
  },
]

export const realVsFake = [
  {
    test: 'Fog test',
    real: 'Clears almost instantly — diamond disperses heat fast.',
    fake: 'Stays fogged for a few seconds (glass, CZ).',
  },
  {
    test: 'Sparkle (brilliance vs. fire)',
    real: 'Grey-white brilliance with crisp rainbow flashes.',
    fake: 'Moissanite throws excessive, almost disco-like rainbow fire.',
  },
  {
    test: 'Heat / conductivity probe',
    real: 'Diamond conducts heat exceptionally — passes a thermal tester.',
    fake: 'Moissanite also passes heat pens — needs an electrical tester too.',
  },
  {
    test: 'Reflections (read-through)',
    real: 'You can’t read newsprint through a properly cut diamond.',
    fake: 'Glass and quartz let text show through clearly.',
  },
]

export const testimonials = [
  {
    quote:
      'Inherited my grandmother’s ring and had no paperwork. Diamonds Tester confirmed it was a natural 1.2ct and the certificate got it insured the same week.',
    name: 'Priya N.',
    role: 'London, UK',
  },
  {
    quote:
      'The photo check flagged my “diamond” as moissanite in under a minute. Saved me from overpaying a private seller by thousands.',
    name: 'Marcus T.',
    role: 'Austin, TX',
  },
  {
    quote:
      'As a small jeweller I use the mail-in service for estate pieces. Fast, insured, and the reports are genuinely trusted by my buyers.',
    name: 'Elena R.',
    role: 'Antwerp, BE',
  },
  {
    quote:
      'Clear, honest, no upselling. They told me my stone was lab-grown and still worth keeping. That kind of straight answer earns trust.',
    name: 'David K.',
    role: 'Toronto, CA',
  },
]

export const faqs = [
  {
    q: 'Can you really tell if a diamond is real from a photo?',
    a: 'A good photo lets us screen the obvious cases — most simulants like cubic zirconia and glass reveal themselves through brilliance, dispersion and facet geometry. For a definitive natural-vs-lab-grown call, or anything you’ll insure or resell, we recommend our instrument-based lab test.',
  },
  {
    q: 'What’s the difference between a fake and a lab-grown diamond?',
    a: 'A lab-grown diamond is a real diamond — same carbon crystal, same hardness — just made in a lab rather than the earth. A “fake” (simulant) like moissanite or CZ only looks similar. We identify all three so you know exactly what you own.',
  },
  {
    q: 'Will a cheap diamond tester pen tell me everything?',
    a: 'No. Most pens test thermal conductivity only, and moissanite passes that test. You need an electrical-conductivity stage (or proper lab testing) to separate diamond from moissanite reliably — which is exactly what our lab service does.',
  },
  {
    q: 'How long does certification take?',
    a: 'Photo verification is near-instant. Mail-in testing averages three business days from arrival. Full lab certification typically takes five to seven business days, plus insured shipping each way.',
  },
  {
    q: 'Is my stone safe when I mail it in?',
    a: 'Yes. Every mailer is insured and tamper-evident with end-to-end tracking. Your stone is handled only by certified gemologists and returned the same way it arrived.',
  },
  {
    q: 'Do you store or sell my photos?',
    a: 'Never. Your images are used solely to produce your verdict and are yours to delete. We don’t sell data, and lab samples are never shared with third parties.',
  },
]

export const trustLogos = ['GIA-benchmarked', 'IGI reference', 'Insured by Lloyd’s', 'Hatton Garden', 'Antwerp partners']

export const photoTips = [
  {
    title: 'Light it well',
    body: 'Shoot in bright, indirect daylight. Avoid hard flash — it blows out the brilliance and fire we read.',
    icon: 'Sparkles',
  },
  {
    title: 'Clean it first',
    body: 'A quick wipe removes skin oil and dust that dull sparkle and hide inclusions from the camera.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Capture 3 angles',
    body: 'Top (table down), side profile, and straight through the table. More angles, sharper verdict.',
    icon: 'Camera',
  },
  {
    title: 'Get close & steady',
    body: 'Fill the frame, tap to focus, keep a plain dark background. Macro mode if your phone has it.',
    icon: 'ScanLine',
  },
]

export const comparison = {
  columns: ['Diamonds Tester', 'High-street jeweller', '$20 tester pen', 'Guesswork'],
  rows: [
    { feature: 'Instant photo verdict', values: ['yes', 'no', 'no', 'no'] },
    { feature: 'Catches moissanite', values: ['yes', 'maybe', 'no', 'no'] },
    { feature: 'Natural vs. lab-grown call', values: ['yes', 'paid', 'no', 'no'] },
    { feature: 'Insurance-ready certificate', values: ['yes', 'yes', 'no', 'no'] },
    { feature: 'No sales pressure / unbiased', values: ['yes', 'no', 'yes', 'yes'] },
    { feature: 'Cost to start', values: ['Free', 'Appointment', '~$20', 'Free'] },
    { feature: 'Time to an answer', values: ['< 1 min', 'Days–weeks', 'Seconds', '—'] },
  ] as { feature: string; values: string[] }[],
}

export const limits = [
  'A photo can flag simulants, but can’t separate a natural diamond from a lab-grown one — that needs spectroscopy.',
  'Lighting and image quality change what the camera sees, so confidence varies with your photos.',
  'A tight setting can hide the girdle, culet and inclusions we rely on for the closest read.',
  'For insurance, resale or a legal record, always confirm a photo screen with an instrument-based lab test.',
]
