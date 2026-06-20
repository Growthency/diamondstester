import type { BlogPost } from '@/lib/types'

/**
 * Additional seed blog content — full, real articles (no placeholders). These
 * extend the core set in posts.ts and follow the same shape so they can render
 * without Supabase and import cleanly into the `blog_posts` table.
 */
export const extraPosts: BlogPost[] = [
  {
    slug: 'diamond-shapes-and-cuts-explained',
    title: 'Diamond Shapes and Cuts Explained: A Guide to All 10 Popular Cuts',
    excerpt:
      'Round, oval, emerald, cushion and beyond — how each shape sparkles, hides colour and inclusions, and what it does to the price.',
    category: 'Education',
    tags: ['shapes', 'cut', 'round brilliant', 'emerald cut', 'buying'],
    author: 'Amara Okafor',
    author_role: 'Gemologist, FGA',
    featured: false,
    status: 'published',
    read_minutes: 8,
    published_at: '2026-03-10T09:00:00.000Z',
    seo_title: 'Diamond Shapes and Cuts Explained — All 10 Popular Cuts',
    seo_description:
      'A gemologist breaks down the 10 most popular diamond shapes — sparkle, how each hides colour and inclusions, who it suits, and relative price.',
    content: `Shape is the first thing anyone notices about a diamond, and it quietly drives everything else — how much it sparkles, how well it hides colour and inclusions, and how far your budget stretches. Here is how the ten most popular cuts actually behave.

## Round brilliant — the benchmark

The round brilliant is engineered for maximum light return. Its 57 or 58 facets are arranged to bounce light back at your eye, which is why it out-sparkles every other shape and forgives a slightly lower colour grade. That brilliance also helps mask small inclusions. The catch is price: rounds command a premium because they sparkle best and waste the most rough during cutting. If sparkle is the priority and budget allows, this is the safe default.

## Princess — modern and sharp

A square brilliant cut, the princess delivers near-round levels of fire with crisp, contemporary corners. It hides inclusions well but shows colour at the pointed corners, so don't drop too low on the colour grade. It uses rough efficiently, which makes it noticeably cheaper than a round of the same weight.

## Oval — bigger for the money

An elongated brilliant, the oval carries its weight across a larger face-up area, so it reads bigger than a round of the same carat. It sparkles brilliantly and flatters the finger by lengthening it. Watch for the "bow-tie," a dark shadow across the centre — a well-cut oval keeps it faint.

## Emerald — the step-cut showstopper

The emerald cut uses long, parallel facets (step cuts) instead of brilliant facets, producing a hall-of-mirrors flash rather than fire. That openness is honest: it shows inclusions and colour more readily than any brilliant, so prioritise clarity (VS or better) and a higher colour grade. In return you get an elegant, understated stone at a friendlier price per carat.

## Cushion — soft and romantic

A square or rectangle with rounded corners, the cushion blends vintage charm with strong fire. It handles colour and inclusions reasonably well and tends to glow warmly, which is why it pairs beautifully with yellow and rose gold. Generally priced below a round.

## Pear — the teardrop

Half round brilliant, half marquise, the pear is brilliant and elongating. The point shows colour, and like the oval it can carry a bow-tie, so cut quality matters. It looks larger for its weight and sits comfortably below round pricing.

## Marquise — maximum spread

The marquise has the largest face-up area of any shape per carat, so it looks the biggest for the money. Its two points are vulnerable and concentrate colour, and the bow-tie risk is real. A dramatic, finger-lengthening choice for buyers chasing visible size.

## Radiant — brilliance with corners

A brilliant-faceted rectangle with cropped corners, the radiant combines the sparkle of a round with the silhouette of an emerald. It hides inclusions and colour well thanks to its brilliant faceting, making it a forgiving, lively pick at a moderate price.

## Asscher — the art-deco emerald

A square step cut with deep, concentric facets, the asscher shares the emerald's transparency and "windmill" pattern. It demands good clarity and colour for the same reason, and it suits anyone after a vintage, geometric look. Priced similarly to the emerald.

## Heart — the statement

Essentially a pear with a cleft, the heart is a brilliant cut that needs skilled symmetry to read clearly — both lobes must match. Below about 0.50ct the shape gets hard to recognise, so it works best larger. A romantic, unmistakable choice.

## How to choose

- **Want the most sparkle?** Round, then oval or radiant.
- **Want size for your money?** Marquise, oval or pear.
- **Love a clean, elegant look?** Emerald or asscher — but pay up for clarity and colour.
- **Want vintage warmth?** Cushion.

Whatever shape you fall for, the grade on the report should match what your eye and budget expect. A Diamonds Tester verification confirms the cut and quality are exactly what you are paying for before the ring goes on the finger.`,
  },
  {
    slug: 'diamond-certificates-gia-igi-ags',
    title: 'Diamond Certificates Explained: GIA vs IGI vs AGS',
    excerpt:
      'What a grading report actually is, how the major labs differ, how to read one line by line, and how to spot an inflated or fake report.',
    category: 'Guides',
    tags: ['certificate', 'GIA', 'IGI', 'AGS', 'grading report'],
    author: 'Dr. Helena Voss',
    author_role: 'Chief Gemologist, GIA GG',
    featured: false,
    status: 'published',
    read_minutes: 7,
    published_at: '2026-03-18T09:00:00.000Z',
    seo_title: 'GIA vs IGI vs AGS — How to Read a Diamond Certificate',
    seo_description:
      'A gemologist explains diamond grading reports, the differences between GIA, IGI and AGS, how to read a certificate, and how to spot fakes.',
    content: `A diamond certificate is the difference between buying a stone and buying a stranger's opinion of a stone. Knowing which report to trust, and how to read it, is the single most useful skill a buyer can have.

## What a grading report actually is

A grading report (often loosely called a "certificate") is an independent lab's objective description of a diamond: its measurements, the 4Cs, proportions, fluorescence, and whether it is natural or lab-grown. Critically, it does **not** assign a dollar value — that is an appraisal. The report answers one question: exactly what is this stone? The lab examines a loose, unmounted diamond under controlled lighting and instruments, then laser-inscribes the stone's girdle with a report number that ties it back to the document.

## GIA, IGI and AGS — how they differ

- **GIA (Gemological Institute of America):** The body that invented the 4Cs and the D-to-Z colour scale. GIA is independent, non-profit, and famous for strict, consistent grading. It is the gold standard for natural diamonds and the report the trade trusts most.
- **AGS (American Gem Society):** Long respected for a science-based, 0-to-10 cut grading system, especially for light performance. AGS's grading lab was absorbed into GIA in 2023, but legacy AGS reports remain rigorous and well regarded.
- **IGI (International Gemological Institute):** Large, global, and the dominant lab for lab-grown diamonds. IGI grading is generally reliable, though historically the trade has considered it slightly more lenient than GIA on natural stones — a half-grade of colour or clarity can drift between the two.

The practical takeaway: for a natural diamond, GIA is the benchmark. For a lab-grown stone, IGI is the industry norm and perfectly appropriate.

## How to read a certificate

Work down the report in this order:

- **Report number and date:** Verify it on the lab's official website. Every legitimate lab has a free report-lookup tool.
- **Natural vs lab-grown:** The single most value-defining line. A lab-grown stone should say so clearly.
- **Shape and measurements:** Confirms the outline and millimetre dimensions match the stone.
- **The 4Cs:** Carat weight, colour grade, clarity grade, cut grade. Cut grade only appears for round brilliants on GIA reports.
- **Polish and symmetry:** Aim for Excellent or Very Good.
- **Fluorescence:** None to Faint is neutral; Strong Blue can occasionally cause a hazy look in some stones.
- **The plot:** A clarity map showing the type and location of inclusions — your fingerprint for matching the stone to the paper.

## Spotting fake or inflated reports

This is where money is lost. Watch for:

- **In-house "certificates":** A grading report from the same store selling the diamond is marketing, not independent verification. Insist on GIA, IGI or AGS.
- **Mismatched inscriptions:** The girdle laser inscription must match the report number. No match, walk away.
- **Grades that look too good for the price:** A "D Flawless" at a bargain price is a red flag for either a tampered report or a swapped stone.
- **Reports that can't be looked up:** If the number doesn't resolve on the lab's site, the document is worthless.

A report is only as trustworthy as your ability to confirm the paper actually describes the stone in front of you. Diamonds Tester verification cross-checks the inscription, the report and the physical stone so you know the certificate and the diamond are one and the same.`,
  },
  {
    slug: 'how-diamond-prices-are-set',
    title: 'How Diamond Prices Are Set: The Logic Behind the Number',
    excerpt:
      'Per-carat pricing, the Rapaport reference, how the 4Cs multiply value, magic-weight jumps, lab-grown discounts and retail markup — demystified.',
    category: 'Guides',
    tags: ['pricing', 'Rapaport', '4cs', 'lab-grown', 'value'],
    author: 'Nathan Cole',
    author_role: 'Senior Diamond Grader',
    featured: false,
    status: 'published',
    read_minutes: 7,
    published_at: '2026-03-26T09:00:00.000Z',
    seo_title: 'How Diamond Prices Are Set — Rapaport, the 4Cs and Markup',
    seo_description:
      'Understand diamond pricing: per-carat logic, the Rapaport reference, how the 4Cs multiply value, magic weights, lab-grown discounts and retail markup.',
    content: `Diamond prices feel arbitrary until you see the machinery behind them. Once you understand how the trade arrives at a number, you can tell a fair quote from a fantasy one in seconds.

## Price is per carat, not per stone

Diamonds are priced per carat, then multiplied by weight — but the per-carat rate itself climbs as stones get bigger, because large rough is rare. So a 2.00ct stone costs far more than twice a 1.00ct of the same quality, on two counts: more carats and a higher rate per carat. This is the first thing people get wrong when they assume value scales in a straight line. It does not.

## The Rapaport reference

The trade's pricing backbone is the Rapaport Price List, a weekly matrix that quotes a benchmark per-carat price for each combination of weight, colour and clarity. Dealers rarely sell at "Rap" — they trade at a discount or premium to it ("Rap minus 30%," for example). You will never see this list at a retail counter, but every wholesale price traces back to it. It is the closest thing the industry has to a stock ticker.

## How the 4Cs multiply

The Rapaport number is just the starting grid; the 4Cs then stack on top of each other multiplicatively, not additively.

- **Carat** sets the base rate and jumps at size thresholds.
- **Colour** moves price at every grade, with steep drops near the top of the scale.
- **Clarity** swings value hard at the high end (IF and VVS carry big premiums).
- **Cut** — on top of the Rapaport grid — adds or subtracts a real premium for light performance, especially on rounds.

Because these compound, a stone that is excellent on every axis costs dramatically more than one that is merely good on each. Shaving one grade off several Cs at once is how smart buyers cut cost without visibly hurting the stone.

## Magic weights

Demand clusters at round numbers — 0.50, 0.70, 0.90, 1.00, 1.50 and 2.00ct — so prices jump sharply right at those marks. A 1.00ct stone can cost noticeably more per carat than a 0.95ct that looks identical face-up. Buying just below a magic weight is one of the cleanest savings available, often 5 to 15 percent for a difference no eye can detect.

## Natural vs lab-grown

Lab-grown diamonds are chemically identical but priced on a completely different curve. As production has scaled, lab-grown has fallen to roughly 60 to 85 percent below a comparable natural stone, and the gap continues to widen. The trade-off is resale: natural diamonds hold value far better, while lab-grown resale remains weak. Buy lab-grown to enjoy, not to invest.

## Retail markup

Between the wholesale price and the ring in the window sits the retailer's margin. Markups vary widely — modest at high-volume online sellers, substantial at traditional jewellers with showrooms and staff to fund. The same stone can carry very different price tags depending on where it sells, which is exactly why an independent grade matters: it lets you compare like for like.

## The bottom line

A fair price is the wholesale benchmark plus a reasonable, transparent margin — no more. The only way to know you are in that range is to know precisely what the stone is. A Diamonds Tester verification pins down the grade, so you can judge any quote against what the diamond is genuinely worth.`,
  },
  {
    slug: 'ethical-and-lab-grown-diamonds',
    title: 'Ethical and Lab-Grown Diamonds: What "Responsibly Sourced" Really Means',
    excerpt:
      'Conflict diamonds, the Kimberley Process and its blind spots, recycled stones, and how lab-grown fits into an honest ethical choice.',
    category: 'Education',
    tags: ['ethical', 'lab-grown', 'Kimberley Process', 'conflict diamonds', 'sustainability'],
    author: 'Amara Okafor',
    author_role: 'Gemologist, FGA',
    featured: false,
    status: 'published',
    read_minutes: 7,
    published_at: '2026-04-03T09:00:00.000Z',
    seo_title: 'Ethical and Lab-Grown Diamonds — What Responsibly Sourced Means',
    seo_description:
      'A clear look at conflict diamonds, the Kimberley Process and its limits, recycled stones, and lab-grown as an ethical diamond option.',
    content: `"Ethically sourced" is one of the most used and least defined phrases in the diamond trade. Here is what it actually involves, where the safeguards fall short, and how to make a genuinely informed choice.

## What conflict diamonds are

"Conflict" or "blood" diamonds are stones mined in war zones and sold to finance armed conflict against governments. The term entered public awareness through the brutal civil wars of West Africa in the 1990s, where diamond revenue funded militias. The harm was never just abstract — it meant forced labour, displacement and violence funded directly by the gems on the global market.

## The Kimberley Process — and its limits

In 2003 the industry and governments launched the Kimberley Process Certification Scheme (KPCS), which requires rough diamonds to be shipped in sealed, certified parcels confirming they are conflict-free. It was a genuine step forward and removed a large share of war-funding stones from the supply chain.

But the scheme has real blind spots:

- **A narrow definition:** It only addresses diamonds that fund rebel movements against governments. It says nothing about human rights abuses committed by governments themselves, nor about worker exploitation, child labour or environmental damage.
- **Weak traceability past the rough stage:** Once a diamond is cut and polished, the certificate does not follow the individual stone, making downstream tracking difficult.
- **Enforcement gaps:** Smuggling and document fraud have allowed problem stones into the system.

So a diamond can be fully "Kimberley compliant" and still carry an ethically questionable story. Compliance is a floor, not a guarantee.

## Recycled diamonds

One of the most overlooked ethical options is the recycled, or pre-owned, diamond. These are stones reclaimed from existing jewellery and returned to the market. Because no new mining is involved, they carry essentially zero fresh environmental or labour footprint. A re-cut estate diamond can be both beautiful and among the most responsible choices available.

## Lab-grown as an ethical option

Lab-grown diamonds sidestep mining entirely. They are real diamonds produced in a reactor over weeks, with no pit, no tailings and no mine labour. For many buyers this is the cleanest answer on conscience grounds. Two honest caveats:

- **Energy use matters.** Growing diamonds is energy-intensive; the footprint depends heavily on whether the producer uses renewable power. "Sustainable" claims should be backed by evidence.
- **Mining isn't automatically the villain.** In some countries, regulated diamond mining is a cornerstone of the local economy, funding schools, hospitals and jobs. Walking away from all mined stones can carry its own human cost.

## What "ethically sourced" really means

Treat the phrase as the start of a conversation, not the end of one. Ask for specifics:

- Where was the stone mined or grown, and can the seller show it?
- Is it Kimberley compliant, and what beyond that can they document?
- For lab-grown, what is the energy source?
- For natural, is there a traceability program naming the mine of origin?

A vague "ethical" label means little; a documented origin means a great deal. Whatever path you choose, knowing exactly what you hold — natural or lab-grown, and graded honestly — is the foundation of an ethical purchase. Diamonds Tester verification confirms a stone's true nature so the story you are told matches the stone you actually own.`,
  },
  {
    slug: 'how-to-clean-and-care-for-your-diamond',
    title: 'How to Clean and Care for Your Diamond the Safe Way',
    excerpt:
      'The simple dish-soap method that works, what to never do, how to check your prongs, and when to have the ring professionally inspected.',
    category: 'Care',
    tags: ['care', 'cleaning', 'maintenance', 'prongs', 'insurance'],
    author: 'Amara Okafor',
    author_role: 'Gemologist, FGA',
    featured: false,
    status: 'published',
    read_minutes: 6,
    published_at: '2026-04-11T09:00:00.000Z',
    seo_title: 'How to Clean and Care for Your Diamond — Safe At-Home Guide',
    seo_description:
      'A gemologist guide to safely cleaning your diamond at home, what to avoid, how to check prongs, and when to have your ring inspected.',
    content: `A diamond is the hardest natural material on earth, but the ring around it is not. Most damage gemologists see isn't to the stone — it's a worn prong, a corroded setting or a stone dulled by everyday grime. Good care is mostly about protecting the things around the diamond.

## The cleaning method that actually works

You don't need a special solution. The most effective and safest routine is the one jewellers use:

- Mix a bowl of warm (not hot) water with a few drops of mild dish soap.
- Soak the ring for 20 to 30 minutes to loosen oils and lotion.
- Gently scrub behind and around the stone with a soft, clean toothbrush — the underside collects the most grime and is what kills sparkle.
- Rinse under warm water, holding the ring over a closed drain or in a strainer.
- Pat dry with a lint-free cloth.

Do this every week or two and your diamond will keep its fire. Most lost sparkle is just oil and soap film on the pavilion, not a problem with the stone.

## What to avoid

A few common habits quietly cause damage:

- **Chlorine and bleach:** Chlorine doesn't hurt the diamond, but it attacks the alloys in gold and can pit or weaken a setting over time. Take the ring off before pools, hot tubs and cleaning with bleach.
- **Harsh chemicals and abrasives:** Toothpaste, baking soda and scouring powders can scratch metal and soft accent stones. Skip them.
- **Ultrasonic cleaners — with caution:** Ultrasonics are powerful and generally fine for a clean, solid diamond, but they can shake loose a stone in a worn setting and can damage or worsen certain treated or heavily included diamonds, as well as soft side stones like emeralds or opals. If you're unsure of the setting's condition, don't risk it.
- **Wearing it for everything:** Remove your ring for gym sessions, gardening, heavy lifting and rough work. Most chips and bent prongs come from sharp knocks, not normal wear.

## Check your prongs

Once a month, run a quick at-home inspection:

- Look closely at the prongs or bezel under good light. Are any flattened, lifted, snagged or visibly thin?
- Gently shake the ring near your ear. A faint rattle means the stone is loose — stop wearing it and get it checked.
- Snag the prongs lightly on a piece of fabric. A prong that catches may be lifting and could let the stone fall.

Catching a worn prong early costs a few dollars to re-tip. Missing it can cost the diamond.

## Professional inspection and insurance

Home care handles the day-to-day, but a jeweller should examine the setting professionally every 6 to 12 months, tightening prongs and checking for wear you can't see. Many warranties actually require these periodic checks to stay valid.

Separately, insure the piece — either as a rider on your home policy or through a dedicated jewellery insurer — and base the coverage on a current appraisal. Re-appraise every few years, because replacement values shift with the market, and keep your grading report and photos somewhere safe as proof of what you own.

If your stone has ever been out of your sight for repair or resizing, it's worth confirming the diamond that came back is the one that went in. A Diamonds Tester verification matches your stone to its report, so a routine service never becomes a quiet swap.`,
  },
  {
    slug: 'engagement-ring-buying-guide',
    title: 'The Complete Engagement Ring Buying Guide',
    excerpt:
      'Set a budget, prioritise cut, choose a shape, setting and metal, insist on certification, and verify the stone before you pay a cent.',
    category: 'Guides',
    tags: ['engagement ring', 'buying', 'cut', 'setting', 'certification'],
    author: 'Dr. Helena Voss',
    author_role: 'Chief Gemologist, GIA GG',
    featured: false,
    status: 'published',
    read_minutes: 8,
    published_at: '2026-04-20T09:00:00.000Z',
    seo_title: 'Engagement Ring Buying Guide — Budget, Cut, Setting & Certification',
    seo_description:
      'A gemologist guide to buying an engagement ring: setting a budget, prioritising cut, choosing shape and metal, certification and verifying authenticity.',
    content: `Buying an engagement ring is most people's first serious diamond purchase, and the trade knows it. Walk in informed and you'll get far more ring for your money — and avoid the mistakes that cost the most.

## Set a real budget

Forget the old "two or three months' salary" rule — it was a marketing slogan, not financial advice. Decide what you can comfortably spend, then work within it. The smartest move is to treat the budget as fixed and optimise the stone's quality to look its best at that number, rather than chasing carat weight at the cost of everything else.

## Prioritise cut above all

If you remember one thing, make it this: **cut is the C that controls sparkle.** A beautifully cut stone with a modest colour and clarity grade will out-sparkle a poorly cut stone that grades higher on paper. Spend your quality budget on an Excellent or Very Good cut first. Then:

- Choose an **eye-clean** clarity — usually VS or a good SI1 — rather than paying for flawless grades only a loupe can see.
- Pick a **near-colourless** grade (G to I) that looks white in the setting; warmer grades hide well in yellow gold.
- Shop just **below a magic weight** (a 0.90 instead of 1.00ct) for size that looks identical at a lower price.

This order consistently buys the best-looking stone per dollar.

## Choose a shape and setting

Shape is personal, but it has practical consequences. Round brilliants sparkle most and cost most; ovals and radiants look larger for the money; emerald and asscher cuts are elegant but demand higher clarity. If you can, learn the wearer's taste before you buy.

The setting protects the stone and sets the style:

- **Solitaire:** A single stone, timeless and lets the diamond speak.
- **Halo:** A ring of small stones around the centre makes it look larger.
- **Pavé:** Tiny diamonds along the band add sparkle.
- **Bezel:** Metal wraps the stone's edge — the most secure choice for active hands.

## Pick the metal

Metal affects both look and durability:

- **Platinum:** Naturally white, hypoallergenic and very durable, but pricier and develops a soft patina.
- **White gold:** A more affordable white look, plated with rhodium that needs re-plating every few years.
- **Yellow gold:** Classic and warm, and it flatters slightly lower colour grades.
- **Rose gold:** Romantic and distinctive, with excellent durability from its copper content.

## Insist on certification

Never buy a meaningful diamond without an independent grading report. For a natural stone, GIA is the gold standard; for lab-grown, IGI is the norm. The report tells you exactly what you're buying — the 4Cs, the measurements, and crucially whether the stone is natural or lab-grown. An in-house "certificate" from the seller is not independent verification.

## Where to buy

- **Online retailers** offer the widest selection and keenest prices, with full reports — ideal if you're comfortable buying from images and data.
- **Local jewellers** let you see stones in person and build a relationship, usually at a higher margin.
- **Estate and antique dealers** can offer recycled stones and unique settings at good value.

Wherever you buy, favour sellers with clear return policies and reports you can verify yourself.

## Verify before you pay

This is the step most buyers skip and later regret. Before money changes hands, confirm three things line up: the physical stone, its laser inscription, and the grading report. Match the report number on the certificate to the inscription on the girdle, and check the report on the lab's official website. A grade is only meaningful if the paper genuinely describes the stone in your hand.

That final check is exactly what Diamonds Tester is built for — cross-verifying the stone, the inscription and the report so you can say "yes" with complete confidence.`,
  },
]
