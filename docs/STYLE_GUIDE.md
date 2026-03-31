# Style Guide

This project follows a custom "Premium Dark Mode" aesthetic, emphasizing glassmorphism, depth, and vibrant accent colors inspired by Indian spices.

---

## 🎨 Color Palette

### Base Colors

- **Main Background**: `#070707` (Deep Matt Black)
- **Surface / Cards**: `rgba(255, 255, 255, 0.05)` (Frosted Glass)
- **Text (Primary)**: `#f5f5f5` (Off-white / Smoke)
- **Text (Secondary/Muted)**: `rgba(255, 255, 255, 0.4)`
- **Borders**: `rgba(255, 255, 255, 0.10)`

### Spice Accent Colors

Inspired by Indian spices. Used as gradients, glows, and CTA elements.

- **Primary CTA (Orange)**: `#f97316` / `orange-500` (Saffron / Turmeric)
- **Ambient Glow (Orange)**: `rgba(255, 140, 0, 0.18)`
- **Ambient Glow (Red)**: `rgba(255, 60, 60, 0.14)` (Chili)
- **Ambient Glow (Yellow)**: `rgba(255, 190, 0, 0.10)` (Ginger)

### Status Colors

- **Success**: `green-400` / `rgba(74, 222, 128, ...)`
- **Warning**: `yellow-400`
- **Error / Cancel**: `red-400`
- **Info**: `blue-400`

---

## 💎 Design Patterns

### Glassmorphism Cards

All content cards follow this pattern for depth and consistency:

```css
bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl
```

Hover state:

```css
hover:bg-white/10
```

### CTA Buttons (Primary)

```css
bg-orange-500 hover:bg-orange-600 text-black font-bold rounded-2xl
px-6 py-3 transition-all transform hover:scale-[1.02] active:scale-95
shadow-lg shadow-orange-500/20
```

### CTA Buttons (Secondary / Ghost)

```css
bg-white/5 hover:bg-white/10 border border-white/10 text-white
font-semibold rounded-2xl px-6 py-3 transition-all
```

### Input Fields

```css
bg-white/5 border border-white/10 text-white placeholder:text-white/40
rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500/50
```

### Typography

- **Font**: Geist Sans (variable font via `next/font/google`)
- **Monospace**: Geist Mono (used for order IDs, tokens, code)
- **Headings**: Large tracking (`tracking-tight`), heavy weight (`font-bold` to `font-black`)
- **Body**: `-webkit-font-smoothing: antialiased` applied globally

---

## ✨ Animation System

### Framer Motion (Scroll Reveals)

Standard entrance pattern used via the `<Reveal>` component:

```js
initial: { opacity: 0, y: 20 }
animate: { opacity: 1, y: 0 }
transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
```

### GSAP (Hero & Advanced Animations)

Used for the homepage hero text split animation and advanced stagger effects via the `@gsap/react` package.

### CSS Transitions (Interactive States)

All interactive elements use:

```css
transition-all duration-200
```

### Loading / Skeleton States

Pulse animation for loading skeletons:

```css
animate-pulse bg-white/10 rounded-xl
```

---

## 🏷 Dietary Badge System

Three badge types displayed on menu items:

| Badge | Style | Meaning |
| :--- | :--- | :--- |
| 🌿 Veg | `bg-green-500/20 text-green-400 border-green-500/30` | Vegetarian |
| 🌶 Spicy | `bg-red-500/20 text-red-400 border-red-500/30` | Contains heat |
| ⭐ Popular | `bg-orange-500/20 text-orange-400 border-orange-500/30` | Staff favourite |

---

## 📱 Responsive Design

All layouts are mobile-first using Tailwind CSS breakpoints:

- **Mobile**: Default (single column, stacked)
- **Tablet**: `md:` prefix — two-column grids
- **Desktop**: `lg:` and `xl:` prefix — full layouts

The Navbar uses a dedicated mobile menu (hamburger) that slides in from the side on screens below `md`.

---

## 🖨 Print Styles

Applied to the Catering Menu for PDF/print export:

- **`.screen-only`**: Hidden when printing (nav, gradients, dark backgrounds)
- **`.print-only`**: Visible only when printing (brand header, contact info)
- Print layout uses high-contrast black text on white background
