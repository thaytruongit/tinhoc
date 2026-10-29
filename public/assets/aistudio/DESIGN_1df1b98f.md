---
name: CloudPlay Learning OS
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dfe9fb'
  surface-container-highest: '#d9e3f5'
  on-surface: '#121c29'
  on-surface-variant: '#544339'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#877367'
  outline-variant: '#dac2b4'
  surface-tint: '#954a05'
  primary: '#954a05'
  on-primary: '#ffffff'
  primary-container: '#ff9e58'
  on-primary-container: '#723600'
  inverse-primary: '#ffb786'
  secondary: '#006495'
  on-secondary: '#ffffff'
  secondary-container: '#4cb6fd'
  on-secondary-container: '#004569'
  tertiary: '#006c4c'
  on-tertiary: '#ffffff'
  tertiary-container: '#48cb9a'
  on-tertiary-container: '#005239'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc6'
  primary-fixed-dim: '#ffb786'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#cbe6ff'
  secondary-fixed-dim: '#8fcdff'
  on-secondary-fixed: '#001e30'
  on-secondary-fixed-variant: '#004b71'
  tertiary-fixed: '#7bfac5'
  tertiary-fixed-dim: '#5cddaa'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#005139'
  background: '#f8f9ff'
  on-background: '#121c29'
  surface-variant: '#d9e3f5'
typography:
  headline-xl:
    fontFamily: Nunito
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Nunito
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Nunito
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 36px
  headline-md:
    fontFamily: Nunito
    fontSize: 20px
    fontWeight: '800'
    lineHeight: 28px
  headline-sm:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Nunito
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Nunito
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Nunito
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  label-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
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
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system is tailored for Vietnamese secondary school education (grade 6 "Tin học" and beyond), bridging pedagogical clarity with joyful gamification. It balances the rigor required for lesson authoring, progress tracking, and grade management with an inviting, tactile world that reduces student anxiety and inspires curiosity.

### Style Personality
- **Playful & Whimsical Tactility:** Draws inspiration from claymorphism and soft neumorphic depth. Elements feature marshmallow-like rounded profiles, soft outer glows, and friendly 3D puffy badges that invite physical interaction.
- **Warm & Optimistic Atmosphere:** Ambient pastel sunset skies (apricot peach blending smoothly into sky blue and mint green) establish a psychologically safe and welcoming learning environment.
- **Clear Information Architecture:** Despite the playful styling, functional density remains crisp. Teacher toolsets and student quests present bite-sized chunks of information supported by high-contrast labels and explicit status indicators.

## Colors

The palette uses warm pastel tones counterbalanced by legible charcoal typography and vibrant categorical accents.

### Color Roles
- **Primary (`#FF9E58`):** Radiant Tangerine/Peach. Used for primary calls-to-action, daily streak trackers, hero progress stages, and high-energy interactive nodes.
- **Secondary (`#4DB7FE`):** Daylight Azure. Used for digital workspace tools, technological subject tags ("Tin học"), interactive roadmaps, and secondary action cards.
- **Tertiary (`#50D2A0`):** Fresh Spearmint. Highlights completed steps, active gradebook statuses, success badges, and growth indicators.
- **Semantic Accents:**
  - *Rose Berry (`#FF6B8B`):* Interactive minigames, alerts, notifications, and literature subjects.
  - *Sunlit Canary (`#FFC53D`):* Star achievements, hints, and locked milestone previews.
  - *Soft Violet (`#A389F4`):* Assessment creation, exam banks, and advanced tools.
- **Surfaces & Backgrounds:**
  - *Base Sky Canvas:* A gentle multi-stop gradient sweeping from `#FFE3D1` (top-left) to `#D7F0FE` (bottom-right).
  - *Card Surface:* Clean porcelain white (`#FFFFFF`) with 85% to 95% opacity to soften the canvas background.
- **Neutrals:**
  - *Text Primary (`#303A48`):* Deep slate navy for titles and key metrics (ensuring WCAG AAA contrast against pastel cards).
  - *Text Secondary (`#6B7A90`):* Cool graphite for subtitles, metadata, and timestamps.

## Typography

The type system blends **Nunito** for expressive, friendly headers and body copy with **Be Vietnam Pro** for interface elements requiring precision and clear Vietnamese diacritics.

### Hierarchy & Pairing
- **Nunito (Display & Headers):** Rounded terminal geometry creates an approachable, juvenile feel without sacrificing authority. Weight `800` (ExtraBold) powers the primary greeting headings (`Chào cô Lan!`, `Tiến trình sáng tạo`) and section anchors.
- **Nunito (Body Copy):** Used at medium and semi-bold weights (`500`-`600`) to maintain legibility when set against subtle pastel card backgrounds.
- **Be Vietnam Pro (Labels & Badges):** Engineered specifically for native Vietnamese tonal markers and small scale legibility. Used across interactive pills, step badges (`Đã dạy`, `Đang soạn`), navigation items, and data labels.

## Layout & Spacing

The layout uses a modular, card-centric fluid grid with generous outer safe areas to maintain an open, cloud-like feeling.

### Grid & Responsiveness
- **Desktop (1024px+):** Asymmetrical 3-column app shell:
  1. *Global Navigation Strip (80px – 100px):* Vertical icon stack for primary modes (Home, Schedule, Gradebook, Docs).
  2. *Contextual Activity Sidebar (180px – 220px):* Puffy vertical badges for toolsets or earned trophies.
  3. *Main Interactive Stage (Fluid remainder):* Houses the top action bar, the signature serpentine roadmap canvas, and the bottom activity grid.
- **Tablet (768px – 1023px):** Collapses contextual sidebar into a swipeable horizontal pill bar along the top. Serpentine roadmap converts into a horizontal pan area.
- **Mobile (< 768px):** Single-column layout. The serpentine roadmap shifts to a vertical branching trail. Bottom tools reflow into a 2x2 card matrix.

## Elevation & Depth

Visual depth is achieved through **cloud-puff layers** and **tinted ambient shadows**, avoiding dark or harsh drops.

### Elevation Levels
- **Level 0 (Atmosphere Canvas):** Base linear gradient with subtle decorative circular glow patches (`opacity: 0.4`).
- **Level 1 (Docked Containers):** Large rounded panels (`border-radius: 2rem`) featuring a solid white background with a tinted drop shadow: `0 12px 32px -8px rgba(77, 183, 254, 0.18)` and an inner highlight rim `1px solid rgba(255, 255, 255, 0.8)`.
- **Level 2 (Interactive Activity Cards):** Pastel-tinted surfaces (peach, mint, light azure, candy pink) with `0 8px 20px -4px rgba(48, 58, 72, 0.08)` and bottom border weighting (`2px solid rgba(0, 0, 0, 0.04)`) to simulate a tactile toy block.
- **Level 3 (Puffy 3D Badges & Roadmap Pins):** Concentric circular avatars and pin anchors elevated with `0 6px 16px rgba(0, 0, 0, 0.12)`, supported by top-edge radial highlights to create a rounded, inflated look.
- **Level 4 (Floating Pills & Action Modals):** Pill buttons feature a high-contrast white background with `0 4px 12px rgba(48, 58, 72, 0.14)`. When pressed, they compress downward by 2px with shadow reduction to provide clear haptic feedback.

## Shapes

The shape system is built around soft, pill-shaped aesthetics (level 3) to reinforce the friendly, marshmallow-like toy aesthetic.

### Geometry Specifications
- **App Containers & Shells:** `rounded-2xl` to `rounded-3xl` (24px to 32px), creating smooth, pebble-like boundaries.
- **Activity & Task Cards:** Strict 20px to 24px corner radii with generous internal padding.
- **Buttons & Chips:** Pure pill shapes (`border-radius: 9999px`) across all sizes, from status indicators (`Đã chọn`) to action triggers (`Tạo ngay`, `Học tiếp`).
- **Roadmap Pins:** Circular base pins (48px–56px) with an attached inverted teardrop anchor pointing to the wavy milestone path.
- **Progress Trackers:** Fully rounded capsules with pill-shaped inner fills.

## Components

### 1. Buttons & Call-to-Actions
- **Pill CTA Button:**
  - *Structure:* Pure capsule (`px-6 py-2.5 rounded-full`).
  - *Style:* Solid white surface or saturated accent with bold label (`label-md`). Includes subtle play/arrow indicators (`Học tiếp ▶`).
  - *Interaction:* Hover yields a slight scale (`scale-105`) and elevated shadow; active state translates down by `2px`.
- **Streak & Counter Pills:**
  - *Structure:* Compact capsule with warm peach or amber tint (`#FFF1E6`).
  - *Iconography:* Animated emoji/icon (e.g., flame 🔥, graduation cap) paired with bold numbers and Vietnamese unit text (`3 Lớp học`, `15 ngày`).

### 2. Roadmap Milestone Path
- **Wavy Trail:** Dashed and double-lined pathway (`stroke-dasharray: 6 6`, `#A7D8F8`) traversing fluffy cloud silhouettes.
- **Node Pinpoints:**
  - *Completed Node:* Mint green rimmed badge with checkmark indicator and filled status pill (`Đã dạy` / `Đã chọn`).
  - *Active Node:* Vibrant colored ring with pulsing outer ring and teacher/student avatar marker.
  - *Locked Node:* Monochromatic muted gray pin with padlock badge and label (`Chưa dạy` / `Khóa`).

### 3. Puffy Badges & Menu Items
- **Sidebar Menu Items:** Circular icons with candy-colored ring borders (`#FF9E58`, `#4DB7FE`, `#50D2A0`, `#A389F4`).
- **Trophy & Achievement Cards:** Circular frames with inset gradients framing detailed 3D icons (Owl teacher mascot, Golden Trophy, Heart on Fire, Magic Wand).

### 4. Interactive Subject & Tool Cards
- **Structure:** 4-column cards displaying a large title, subtitle, tiny progress track, and embedded pill CTA.
- **Palette Variants:**
  - *Orange:* `bg-[#FFF0E6]` with primary orange accents.
  - *Cyan:* `bg-[#EAF6FF]` with daylight azure accents.
  - *Rose:* `bg-[#FFEBF0]` with berry accents.
  - *Green:* `bg-[#EAF9F2]` with mint accents.

### 5. Chips & Status Badges
- **Capsule Badges:** Auto-layout inline pills (`px-3 py-1 text-xs font-bold rounded-full`).
- **State Colors:**
  - *Success / Completed:* `#E3F9ED` background with `#0C9D58` text.
  - *In Progress:* `#E1F2FE` background with `#0284C7` text.
  - *Pending / Inactive:* `#ECEFF3` background with `#64748B` text.

### 6. Mascot & Feedback Components
- **Owl Mascot Dock:** Persistent header companion providing encouraging tips, contextual lesson advice, and quest updates in a rounded speech balloon.