import type { BlogPost } from '@/lib/types'

/**
 * Bundled seed posts are plain markdown articles; the rendering/SEO fields
 * (content_format, layout, custom_css, custom_schema, difficulty, topic_focus)
 * are filled in with defaults when they're loaded (see lib/blog.ts), so the
 * authored data here stays focused on the article itself.
 */
export type SeedPost = Omit<
  BlogPost,
  'content_format' | 'layout' | 'custom_css' | 'custom_schema' | 'difficulty' | 'topic_focus'
>

/**
 * Seed blog content — full, real articles (no placeholders). These render when
 * Supabase isn't configured yet and are also the rows to import into the
 * `blog_posts` table (see scripts/seed-supabase.mjs). Several are marked
 * featured/published so the blog ships looking complete.
 */
export const seedPosts: SeedPost[] = [
  {
    slug: 'how-to-tell-if-a-diamond-is-real',
    title: 'How to Tell If a Diamond Is Real: 9 Tests You Can Trust',
    excerpt:
      'From the fog test to the read-through trick, here are the at-home checks that actually work — and the ones that quietly fail on moissanite.',
    category: 'Guides',
    tags: ['authenticity', 'at-home tests', 'moissanite', 'cubic zirconia'],
    author: 'Dr. Helena Voss',
    author_role: 'Chief Gemologist, GIA GG',
    featured: true,
    status: 'published',
    read_minutes: 8,
    published_at: '2026-05-28T09:00:00.000Z',
    seo_title: 'How to Tell If a Diamond Is Real — 9 Tests That Actually Work',
    seo_description:
      'Nine reliable ways to check if a diamond is real at home, which tests fail on moissanite, and when to get a lab test.',
    content: `Most "is my diamond real?" advice on the internet is half right — which is dangerous, because the half that's wrong is usually the part that lets a moissanite slip through. Here's what actually works, ranked by how much you can trust it.

## Fast at-home screens

### 1. The fog test
Breathe onto the stone. A real diamond disperses heat so efficiently that the fog clears almost instantly. Glass and cubic zirconia stay misty for two to four seconds. **Caveat:** moissanite also clears fast, so a pass here is necessary, not sufficient.

### 2. The read-through test
Place a loose stone table-down on a line of newsprint. A well-cut diamond bends light so sharply you can't read the letters through it. If the text is legible, you're likely looking at glass or quartz.

### 3. Sparkle: brilliance vs. fire
Diamond returns a crisp mix of grey-white *brilliance* and controlled rainbow *fire*. Moissanite throws so much fire it can look almost like a disco ball. Once you've seen the difference side by side, it's hard to unsee.

### 4. The water test
Drop the stone in a glass of water. A real diamond's high density (3.52 g/cm³) sends it straight to the bottom. A floating or slow-sinking stone is a red flag — though a mounted stone makes this unreliable.

## Tests that need a tool

### 5. Thermal conductivity pen
The classic "diamond tester." It works — but **only against CZ and glass.** Moissanite conducts heat similarly to diamond and passes these pens routinely. This single blind spot is why so many people are fooled.

### 6. Electrical conductivity stage
This is the upgrade that catches moissanite. Diamond is an electrical insulator; moissanite conducts. A combined thermal + electrical tester separates the three most common stones in seconds.

### 7. Loupe inspection
Under 10x magnification, look at the girdle and facet junctions. Natural diamonds often show tiny inclusions and sharp facet edges. Simulants tend to look too clean, with slightly rounded facet meets.

## What only a lab can settle

### 8. Refractive index & dispersion
Instruments measure exactly how light slows and splits inside the stone. Diamond sits at 2.42; moissanite at 2.65; CZ at 2.15. There's no faking these numbers.

### 9. Spectroscopy (natural vs. lab-grown)
A real diamond can still be lab-grown — chemically identical, but worth far less. Only spectroscopy and fluorescence patterns reliably separate earth-mined from lab-created. If you're insuring or reselling, this is the test that matters.

## The honest bottom line
At-home tests are great for ruling out obvious fakes. They are **not** reliable for separating diamond from moissanite, or natural from lab-grown — the two distinctions that actually move value. When money or insurance is on the line, get an instrument test. That's exactly what Diamonds Tester's photo screen and lab certification are built for.`,
  },
  {
    slug: 'moissanite-vs-diamond',
    title: 'Moissanite vs. Diamond: Why the Cheap Tester Pen Lies',
    excerpt:
      'Moissanite passes the thermal pen that most people trust. Here’s how to actually tell the two apart — and why it matters for your wallet.',
    category: 'Comparisons',
    tags: ['moissanite', 'simulant', 'testing'],
    author: 'Dr. Helena Voss',
    author_role: 'Chief Gemologist, GIA GG',
    featured: false,
    status: 'published',
    read_minutes: 6,
    published_at: '2026-05-20T09:00:00.000Z',
    seo_title: 'Moissanite vs Diamond — How to Tell the Difference',
    seo_description:
      'Why moissanite fools diamond tester pens, and the optical and electrical tests that reliably separate it from real diamond.',
    content: `Moissanite is the simulant that breaks people's trust in their own testing kit. It's brilliant, durable, and — crucially — it conducts heat almost like diamond. That last property is why the $20 tester pen in your drawer is quietly unreliable.

## What moissanite actually is
Moissanite is silicon carbide (SiC), originally discovered in a meteor crater. Today it's lab-created and sold as an affordable, ethical diamond alternative. It is **not** a diamond and not trying to secretly be one in the legitimate market — but in the resale and private-sale market, it's the stone most often passed off as the real thing.

## Why thermal pens fail
Standard "diamond testers" measure thermal conductivity. Diamond scores extremely high — and so does moissanite. A thermal-only pen will happily light up green for both. If a seller proves their stone with a single pen, they've proven nothing about moissanite.

## What actually separates them

- **Fire:** Moissanite's dispersion (0.104) is more than double diamond's (0.044). Under bright light it flashes far more rainbow colour.
- **Double refraction:** Look through the table at the back facets under a loupe. Moissanite is doubly refractive — facet edges appear slightly doubled. Diamond is singly refractive and shows crisp single lines.
- **Electrical conductivity:** Moissanite conducts electricity; diamond doesn't. A combined tester nails this instantly.
- **Refractive index:** 2.65 (moissanite) vs 2.42 (diamond) — a definitive instrument reading.

## Why it matters
A one-carat natural diamond can run several thousand dollars. A visually similar moissanite costs a fraction of that. If you're buying second-hand, inheriting jewellery, or selling, mistaking one for the other is a four-figure error. Don't let a single pen make that call.`,
  },
  {
    slug: 'understanding-the-4cs',
    title: 'The 4Cs, Decoded: What Actually Moves a Diamond’s Value',
    excerpt:
      'Cut, colour, clarity and carat — explained in plain English, with the trade-offs that quietly save (or cost) you the most money.',
    category: 'Education',
    tags: ['4cs', 'cut', 'clarity', 'colour', 'carat'],
    author: 'Nathan Cole',
    author_role: 'Senior Diamond Grader',
    featured: false,
    status: 'published',
    read_minutes: 7,
    published_at: '2026-05-12T09:00:00.000Z',
    seo_title: 'Understanding the 4Cs of Diamonds — A Plain-English Guide',
    seo_description:
      'A practical guide to diamond Cut, Colour, Clarity and Carat, and where to spend (and save) when buying.',
    content: `The 4Cs sound like jargon until you realise they're really a pricing map. Learn where each one bends the price curve and you can buy a far better-looking stone for the same budget.

## Cut — spend here
Cut is the only C shaped by human skill, and it's the single biggest driver of sparkle. A poorly cut D-flawless stone can look duller than a well-cut, lower-graded one. Proportions, symmetry and polish determine how much light returns to your eye. **If you optimise one C, make it Cut.**

## Colour — know the cliff
Graded D (colourless) through Z (light yellow). Most people can't see the difference between adjacent grades, but price drops at every step. G–H often looks colourless face-up while costing meaningfully less than D–F. The metal matters too: warmer stones hide beautifully in yellow gold.

## Clarity — buy "eye-clean," not "flawless"
Clarity runs from Flawless to Included (I3). The practical question is whether inclusions are visible to the naked eye. A VS2 or even SI1 stone is usually eye-clean and costs far less than VVS or IF. Pay for what you can see, not what a loupe reveals.

## Carat — mind the magic numbers
Carat is weight (0.20g each), not size. Prices jump at round milestones — 0.50, 1.00, 2.00ct — because demand clusters there. A 0.92ct stone can look identical to a 1.00ct face-up while costing noticeably less. Buying just under a milestone is one of the easiest savings in the book.

## Putting it together
A smart buyer's rule of thumb: **prioritise Cut, choose an eye-clean clarity, pick a near-colourless grade for the setting, and shop just below a carat milestone.** That combination consistently produces the best-looking stone per dollar — and it's exactly the profile our verification reports help you confirm.`,
  },
  {
    slug: 'lab-grown-vs-natural-diamonds',
    title: 'Lab-Grown vs. Natural Diamonds: Same Sparkle, Different Story',
    excerpt:
      'They’re chemically identical — so why the price gap, and how do labs actually tell them apart? A clear-eyed look at both.',
    category: 'Comparisons',
    tags: ['lab-grown', 'natural', 'value', 'spectroscopy'],
    author: 'Nathan Cole',
    author_role: 'Senior Diamond Grader',
    featured: false,
    status: 'published',
    read_minutes: 6,
    published_at: '2026-05-04T09:00:00.000Z',
    seo_title: 'Lab-Grown vs Natural Diamonds — Value, Ethics & Testing',
    seo_description:
      'How lab-grown and natural diamonds differ in price and resale, and how gemological labs reliably tell them apart.',
    content: `A lab-grown diamond is a real diamond. Same carbon lattice, same 10 on the Mohs scale, same fire. The difference is origin — and origin, it turns out, is worth a lot of money.

## Identical where it counts
Optically and chemically, a quality lab-grown stone is indistinguishable from a natural one to the naked eye. No fog test, sparkle check or thermal pen can tell them apart, because there's nothing physically inferior to detect. Anyone who claims to spot the difference by eye is guessing.

## Where they diverge

- **Price:** Lab-grown typically costs 60–85% less than a comparable natural stone today, and that gap has been widening as production scales.
- **Resale:** Natural diamonds hold value far better. Lab-grown resale is weak and still settling — buy lab-grown to wear, not to invest.
- **Origin story:** Naturals are billions of years old and finite; lab-grown are made in weeks with a smaller land footprint. Which matters more is personal.

## How labs actually tell them apart
You can't do this at home. It takes instruments:

- **Photoluminescence spectroscopy** reveals growth-pattern signatures unique to CVD/HPHT lab processes.
- **UV fluorescence** often differs — many lab-grown stones show distinctive patterns under shortwave UV.
- **Strain patterns** under cross-polarised light differ between earth-formed and lab-formed crystals.

## The takeaway
Neither is "fake." But because the value gap is enormous, knowing which one you hold is essential — for insurance, for resale, and simply for paying the right price. That natural-vs-lab-grown call is the headline result on every Diamonds Tester lab certificate.`,
  },
  {
    slug: 'getting-a-diamond-appraised-vs-certified',
    title: 'Appraisal vs. Certification: Which One Do You Actually Need?',
    excerpt:
      'People use the words interchangeably — and overpay because of it. Here’s the difference, and which document your insurer or buyer really wants.',
    category: 'Guides',
    tags: ['certification', 'appraisal', 'insurance', 'resale'],
    author: 'Dr. Helena Voss',
    author_role: 'Chief Gemologist, GIA GG',
    featured: false,
    status: 'published',
    read_minutes: 5,
    published_at: '2026-04-26T09:00:00.000Z',
    seo_title: 'Diamond Appraisal vs Certification — What You Actually Need',
    seo_description:
      'The real difference between a diamond appraisal and a certificate, and which one your insurer or buyer requires.',
    content: `"Certified" and "appraised" get thrown around as if they're the same thing. They're not — and confusing them is how people end up with the wrong piece of paper at the worst moment.

## A certificate describes the stone
A gemological **certificate** (or grading report) is an objective, instrument-based description: the 4Cs, measurements, origin (natural vs. lab-grown), fluorescence and a plotted clarity map. It does **not** state a dollar value. It answers, "What exactly is this stone?"

## An appraisal assigns a value
An **appraisal** takes a certified (or examined) stone and assigns a monetary figure for a specific purpose — usually insurance replacement value, which is deliberately conservative-to-high. It answers, "What is this worth, and for what?"

## Which one you need

- **Insuring a piece?** Your insurer wants an appraisal — but a credible appraisal is built on a certificate. Get both, in that order.
- **Selling privately?** Buyers trust a recognised certificate far more than a seller's appraisal. Lead with the certificate.
- **Just curious or settling a dispute?** A certificate (or even our photo screen) is usually enough.
- **Estate or inheritance?** Certify first to establish what it is, then appraise for probate value.

## The order that saves money
Always **certify, then appraise.** An appraisal without an underlying certificate is just an opinion of value on an unverified stone — and that's exactly the gap where over-valuation and outright fakes hide. Diamonds Tester certificates are built to slot straight into an insurer-ready appraisal.`,
  },
]
