---
name: Sketchbook Kafe
colors:
  surface: '#fff9ef'
  surface-dim: '#e0d9ce'
  surface-bright: '#fff9ef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#faf3e7'
  surface-container: '#f4ede1'
  surface-container-high: '#eee7dc'
  surface-container-highest: '#e8e2d6'
  on-surface: '#1e1b14'
  on-surface-variant: '#4f4634'
  inverse-surface: '#333028'
  inverse-on-surface: '#f7f0e4'
  outline: '#817661'
  outline-variant: '#d2c5ad'
  surface-tint: '#775a00'
  primary: '#775a00'
  on-primary: '#ffffff'
  primary-container: '#ffc93c'
  on-primary-container: '#715500'
  inverse-primary: '#f4bf32'
  secondary: '#7b563e'
  on-secondary: '#ffffff'
  secondary-container: '#ffcdaf'
  on-secondary-container: '#7a553d'
  tertiary: '#a7391e'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffc3b4'
  on-tertiary-container: '#a0341a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdf9a'
  primary-fixed-dim: '#f4bf32'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5a4300'
  secondary-fixed: '#ffdcc7'
  secondary-fixed-dim: '#edbd9f'
  on-secondary-fixed: '#2e1503'
  on-secondary-fixed-variant: '#603f29'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a2'
  on-tertiary-fixed: '#3c0700'
  on-tertiary-fixed-variant: '#862208'
  background: '#fff9ef'
  on-background: '#1e1b14'
  surface-variant: '#e8e2d6'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Epilogue
    fontSize: 34px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Epilogue
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Epilogue
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Epilogue
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  title-md:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-sm:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-lg:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '800'
    lineHeight: 18px
    letterSpacing: 0.03em
  label-md:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 11px
    fontWeight: '800'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style
This design system crafts a whimsical, warm, and distinctly tactile self-ordering kiosk experience for a neighborhood coffee atelier. It evokes the feeling of thumbing through an illustrator’s personal visual journal or ordering from a hand-chalked blackboard menu in a sunlit café. The target audience spans creative professionals, students, and café-goers seeking comfort, spontaneity, and warmth over sterile commercial perfection.

The aesthetic fuses **Tactile / Skeuomorphic** doodle artistry with **High-Contrast Playful** layouts:
- Outlines are organic and deliberately imperfect (never clinical vectors).
- Contrast is established via deep espresso tones rather than cold digital blacks.
- Depth relies on graphic marker undercuts, washi tape tabs, stamped badges, and highlighter sweeps rather than smooth digital gradients or blurred ambient glows.

## Colors
The palette evokes artisanal coffee, lined kraft sketchbooks, and colorful stationery markers:
- **Primary (`#FFC93C` - Kuning Ceria):** Used for primary interactive triggers (Pesan Sekarang, Tambah Pesanan), selected states, and marker highlighter underlays.
- **Secondary / Ink (`#4A2C17` - Espresso Brown):** Acts as the foundational structural ink. All borders, structural divider strokes, body typography, and hard marker shadow blocks use this tone. Never use pure black (`#000000`).
- **Secondary Tone (`#8B5A2B` - Kopi Tubruk):** Secondary ink for subtle borders, secondary labels, and descriptive captions.
- **Tertiary / Promo (`#FF7A59` - Jingga Hangat):** Callouts, hot badges, spicy indicators, and flash promotional stamps.
- **Canvas / Neutral (`#FFF8EC` - Kertas Sketsa):** The warm paper background simulating lightly textured pulp paper.
- **Surface / Card Container (`#FFF1D6` - Krem Susu):** Elevated surfaces for cards, order summaries, and modal sheets.
- **System Accents:**
  - **Mint (`#7ED6A5` - Daun Pandan):** Success states, "Siap Diambil" indicators, herbal/vegan badges.
  - **Sky Blue (`#6EC6FF` - Es Segar):** Informational callouts, iced drink tags, "Sedang Dibuat" step markers.

## Typography
The system balances expressive character with legible kiosk operation:
- **Headlines & Expressive Titles:** Rendered in **Epilogue**, utilizing its geometric yet idiosyncratic, editorial grotesque structure to emulate thick, stylized hand lettering. High-weight display titles carry subtle tilt (-1° to 1.5°) when paired with decorative squiggles or highlighter backdrops.
- **Body Text & Numbers:** Handled by **Nunito Sans** with rounded structural terminals. It preserves the gentle, friendly sketchbook mood while ensuring item descriptions, milk options, and Indonesian Rupiah currency values (`Rp 28.000`) remain crystal-clear at distance on touch displays.
- **Editorial Emphasis:** Highlight important words (e.g., promo deals or seasonal flavors) with pseudo-marker underliners—a thick 8px horizontal block in `#FFC93C` or `#7ED6A5` sitting behind text baseline.

## Layout & Spacing
The layout follows a fluid-responsive grid system designed for both tablet-oriented self-order counters and portrait kiosk totems:
- **Kiosk / Desktop (12-column):** Outer margin of `2rem` (`32px`) and column gutters of `1.25rem` (`20px`). Product categories sit in a persistent left-hand "scrapbook tab" rail (3 columns), with item grids filling the remaining 9 columns.
- **Mobile Handheld (4-column):** Margins reduce to `1rem` (`16px`) with gutters at `0.75rem` (`12px`). Cart summaries collapse into an anchor bottom sticky docket.
- **Layout Rhythm:** Visual rhythm mimics scattered polaroids and notes on a desk. Elements do not lock into severe microscopic alignments; item cards may feature asymmetric top/bottom padding to reinforce an organic sketchbook composition.

## Elevation & Depth
Depth in this design system rejects digital blurs and ambient gradient diffusion. Instead, it relies purely on graphic physical artifacts:

1. **Solid Hard Shadow (Marker Offset):**
   - Interactive objects, cards, and dialogue sheets cast a solid, crisp offset shadow: `3px 3px 0px #4A2C17` or `4px 4px 0px #4A2C17`.
   - On interactive press/active states, the element translates down and right by `2px 2px`, reducing the offset shadow to `1px 1px 0px #4A2C17` to produce an immediate physical tactile click.
2. **Layering via Tape & Overlaps:**
   - Visual priority is signaled by overlapping paper edges.
   - Modals and checkout drawers appear as stacked notepad sheets (`#FFF1D6`) secured with semi-translucent washi-tape rects (`rgba(255, 201, 60, 0.85)` or pastel mint strips) angled at ±2.5deg across corners.
3. **Ghost Boundaries & Sketch Inks:**
   - Surfaces stay anchored with continuous `2.5px` borders rendered in Espresso (`#4A2C17`) using SVG filter wobbles or hand-drawn CSS border-radius irregularities.

## Shapes
Shapes celebrate imperfect handmade craft:
- Corner radii avoid exact mathematical uniformity. Standard cards and containers use slightly organic rounded corners (configured at level `2`), ideally mapped via asymmetric corner radiuses such as `255px 15px 225px 15px/15px 225px 15px 255px` to produce dynamic, non-uniform outlines.
- Decorative badges, promo tags, and sticker chips use skewed, off-kilter bounding boxes rotated between `-2deg` and `+3deg`.
- Divider rules take the form of hand-drawn wavy lines (`doodle-squiggly`), zigzag serrations (receipt bottoms), or spaced pencil-dot tracks.

## Components

### Buttons
- **Primary ("Pesan Sekarang", "Bayar"):** Fill `#FFC93C`, border `2.5px solid #4A2C17`, label bold Nunito Sans in `#4A2C17`. Shadow: `3px 3px 0px #4A2C17`. Hover triggers a bouncy translateY(-2px), active collapses to `1px 1px 0px #4A2C17`.
- **Secondary / Ghost ("Batal", "Kembali"):** Background `#FFF8EC`, border `2px solid #8B5A2B`, label `#4A2C17`, zero shadow or subtle `2px 2px 0px #8B5A2B`.
- **Destructive ("Hapus Item"):** Fill `#FFF8EC`, border `2.5px dashed #FF7A59`, label `#FF7A59`.

### Menu Cards
- Base surface `#FFF1D6` bordered with `2.5px solid #4A2C17` and solid `4px 4px 0px #4A2C17` shadow.
- Top or corner decorated with a faux "Washi Tape" block (angled rectangle with jagged ends in translucent mint or soft sky blue).
- Product imagery presented in doodle polaroid frames with organic rounded borders.
- Item title set in Epilogue; pricing highlighted with a yellow marker underline.

### Chips & Filter Tabs
- Category filters (e.g., "Kopi Susu", "Manual Brew", "Camilan") resemble torn paper tabs or stickers.
- Inactive: `#FFF8EC` fill, `2px solid #8B5A2B`, text `#4A2C17`.
- Active: Filled with `#FFC93C` or `#6EC6FF`, border `2.5px solid #4A2C17`, hard shadow `2px 2px 0px #4A2C17`, rotated `-1.5deg`.

### Badges & Stickers
- **Promo / Spicy / Favorit:** Rotated `3deg` sticker pills with jagged starburst or rounded die-cut outlines. Fill `#FF7A59` with crisp white or dark espresso typography and a `2px solid #4A2C17` contour.
- **Dietary (Vegan/Halal):** Pastel Mint `#7ED6A5` stamp badge with leaf or sketch checkmark doodle.

### Form Inputs & Modifier Selectors
- **Radio & Checkboxes (Sugar level, Ice level, Oatmilk toggle):** Custom doodled circles/boxes. Unchecked has an empty `#FFF8EC` fill with espresso outline; checked state reveals a thick, irregular hand-drawn marker cross `✕` or filled scribble checkmark in `#FF7A59` or `#4A2C17`.
- **Notes field ("Catatan untuk Barista"):** Lined notebook background with horizontal dotted baseline rules in `#8B5A2B` (opacity 0.35) and rounded sketchy outline.

### Cart & Receipt Docket
- Styled like a perforated paper receipt: white-cream background with a zigzag bottom cut border.
- Totals, tax calculations, and Rupiah sums emphasized with bold espresso text and marker-drawn bounding boxes.