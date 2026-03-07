# Style Guide

This project follows a custom "Premium Dark Mode" aesthetic, emphasizing glassmorphism, depth, and vibrant accent colors inspired by Indian spices.

---

## 🎨 Color Palette

### Base Colors
- **Main Background**: `#070707` (Deep Matt Black)
- **Text (Primary)**: `#f5f5f5` (Off-white / Smoke)
- **Text (Secondary/Muted)**: `rgba(255, 255, 255, 0.4)`

### Spice Accents (Gradients)
The design uses custom radial gradients in `globals.css` to create "ambient light":
- **Orange Accents**: `rgba(255, 140, 0, 0.18)` (Saffron / Turmeric)
- **Red Accents**: `rgba(255, 60, 60, 0.14)` (Chili)
- **Yellow Accents**: `rgba(255, 190, 0, 0.10)` (Ginger)

---

## 💎 Design Patterns

### Glassmorphism (`.card`)
Cards are styled with a semi-transparent background and subtle border to create depth.
- **Background**: `bg-white/5`
- **Border**: `border border-white/10`
- **Blur**: `backdrop-blur-xl`

### Typography
- **Headings**: Modern geometric fonts (e.g., Inter/Outfit) with wide tracking.
- **Body**: Clean sans-serif with `-webkit-font-smoothing: antialiased`.

### interactive States
- **Hover**: Transition from `bg-white/5` to `bg-white/10`.
- **Buttons**: Rounded-full "pills" with subtle outlines.

---

## ✨ Animations (Framer Motion)
Most components use a standard entrance reveal:
- **Slide Up**: `y: 20` to `y: 0`.
- **Fade**: `opacity: 0` to `opacity: 1`.
- **Transition**: `duration: 0.8`, `ease: [0.21, 0.47, 0.32, 0.98]`.

---

## 🖨 Print styles
Special care is taken for the Catering Menu to be printable:
- **Hide**: All navigation, radial gradients, and dark backgrounds are hidden (`.screen-only`).
- **Show**: High-contrast black text on white background and brand header (`.print-only`).
