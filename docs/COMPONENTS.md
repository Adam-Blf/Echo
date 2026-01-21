# Echo UI Component Library

Complete documentation for the Echo design system components.

## Overview

The Echo UI component library provides reusable, accessible, and beautifully animated components built with React, TypeScript, Tailwind CSS, and Framer Motion.

### Design Principles

- **Neon Aesthetic**: All components leverage the neon cyan, purple, and pink color palette
- **Motion & Juice**: Smooth animations and micro-interactions throughout
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels and keyboard support
- **Responsive**: Mobile-first design that scales beautifully to all screen sizes

---

## Components

### 1. RangeSlider

A dual-thumb range slider for selecting value ranges (age, distance, etc.)

#### Props

```typescript
interface RangeSliderProps {
  min: number                              // Minimum value
  max: number                              // Maximum value
  value: [number, number]                  // Current range [min, max]
  onChange: (value: [number, number]) => void
  unit?: string                            // Unit label (e.g., "ans", "km")
  step?: number                            // Increment step (default: 1)
  disabled?: boolean
  className?: string
}
```

#### Usage

```tsx
import { RangeSlider } from '@/components/ui'
import { useState } from 'react'

export function FilterAge() {
  const [range, setRange] = useState<[number, number]>([18, 65])

  return (
    <RangeSlider
      min={18}
      max={100}
      value={range}
      onChange={setRange}
      unit="ans"
      step={1}
    />
  )
}
```

#### Features

- Draggable thumbs with smooth animations
- Gradient track between min and max values
- Neon glow effects on interaction
- Touch-friendly (44px+ target size)
- Keyboard accessible with proper ARIA labels
- Real-time value display with unit labels

---

### 2. Toggle

An elegant on/off switch with fluid animations and multiple sizes

#### Props

```typescript
interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string                           // Display label
  labelPosition?: 'left' | 'right'         // Label placement
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'               // Toggle size
  className?: string
}
```

#### Usage

```tsx
import { Toggle } from '@/components/ui'
import { useState } from 'react'

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true)

  return (
    <Toggle
      checked={enabled}
      onChange={setEnabled}
      label="Notifications"
      labelPosition="right"
      size="md"
    />
  )
}
```

#### Features

- Spring-based thumb animation (stiffness: 500, damping: 30)
- Cyan glow when active
- Three size variants (sm: 40px, md: 56px, lg: 64px)
- Click on label to toggle
- Focus indicators for keyboard navigation
- Disabled state with reduced opacity

#### Sizes

| Size | Width | Height | Thumb | Use Case |
|------|-------|--------|-------|----------|
| sm   | 40px  | 24px   | 20px  | Compact settings |
| md   | 56px  | 32px   | 28px  | Standard forms |
| lg   | 64px  | 36px   | 32px  | Large displays |

---

### 3. CardSection

A versatile card container with multiple style variants and hover effects

#### Props

```typescript
interface CardSectionProps {
  title?: string                           // Card title
  icon?: LucideIcon                        // Icon component
  children: ReactNode
  variant?: 'default' | 'elevated' | 'danger' | 'premium'
  onClick?: () => void
  interactive?: boolean                   // Enable hover scale effect
  className?: string
}
```

#### Usage

```tsx
import { CardSection } from '@/components/ui'
import { Settings } from 'lucide-react'

export function SettingsCard() {
  return (
    <CardSection
      title="Préférences"
      icon={Settings}
      variant="premium"
      interactive
    >
      <p>Card content goes here</p>
    </CardSection>
  )
}
```

#### Variants

| Variant   | Description | Use Case |
|-----------|-------------|----------|
| default   | Subtle dark background | Regular content |
| elevated  | Enhanced shadow and glow | Featured content |
| danger    | Red accent with warning | Error/warning messages |
| premium   | Gradient background + shimmer | Premium features |

#### Features

- Multiple visual variants
- Icon support with color-coded backgrounds
- Optional title and icon
- Hover effects with optional scale animation
- Gradient overlays for premium variant
- Accent accent lines at the bottom

---

### 4. ProfileGridItem

Card component for displaying user profiles in a grid layout

#### Props

```typescript
interface ProfileGridItemProps {
  image: string                            // Image URL
  name: string                             // User name
  age: number                              // User age
  badge?: 'super-like' | 'new' | 'verified'
  blurred?: boolean                        // Premium blur effect
  alt?: string
  onClick?: () => void
  className?: string
}
```

#### Usage

```tsx
import { ProfileGridItem } from '@/components/ui'

export function ProfileGrid() {
  const profiles = [
    { id: 1, image: 'url', name: 'Sarah', age: 26, badge: 'new' },
    { id: 2, image: 'url', name: 'Emma', age: 24, badge: 'verified' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {profiles.map(p => (
        <ProfileGridItem
          key={p.id}
          image={p.image}
          name={p.name}
          age={p.age}
          badge={p.badge}
          onClick={() => console.log(p.name)}
        />
      ))}
    </div>
  )
}
```

#### Features

- 3:4 aspect ratio (mobile portrait)
- Gradient overlay from bottom
- Badge support (Super Like, New, Verified)
- Hover scale and glow effects
- Premium blur overlay for locked profiles
- Smooth image scale on hover
- Animated bottom accent line

#### Badge Types

| Badge     | Color | Icon |
|-----------|-------|------|
| super-like | Red   | Heart |
| new       | Cyan  | Heart |
| verified  | Purple| Crown |

---

### 5. PremiumBanner

Eye-catching promotional banner with animated gradient and CTA button

#### Props

```typescript
interface PremiumBannerProps {
  heading: string                          // Main text
  description?: string                     // Secondary text
  ctaText?: string                         // Button text (default: "Découvrir")
  onCTA?: () => void                       // CTA button callback
  onClose?: () => void                     // Close button callback
  closeable?: boolean                      // Show close button
  icon?: ReactNode                         // Custom icon
  variant?: 'default' | 'exclusive' | 'limited'
  className?: string
}
```

#### Usage

```tsx
import { PremiumBanner } from '@/components/ui'
import { useState } from 'react'

export function PromoBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <PremiumBanner
      heading="Débloquez les superpouvoirs"
      description="Accédez à des filtres avancés..."
      ctaText="Devenir Premium"
      variant="exclusive"
      onCTA={() => console.log('Subscribe')}
      onClose={() => setVisible(false)}
      closeable
    />
  )
}
```

#### Variants

| Variant  | Colors | Use Case |
|----------|--------|----------|
| default  | Cyan → Purple | Standard offers |
| exclusive | Purple → Pink → Purple | Limited offers |
| limited  | Yellow shades | Time-limited deals |

#### Features

- Animated shimmer effect (8s loop)
- Crown icon with rotation animation
- CTA button with arrow animation
- Close button with hover effects
- Decorative gradient overlays
- Smooth entry/exit animations
- Motion responsive (responds to interactions)

---

## Design System Integration

### Colors

All components use the Echo neon color palette:

```css
--color-neon-cyan: #00f5ff      /* Primary accent */
--color-neon-purple: #bf00ff    /* Secondary accent */
--color-neon-pink: #ff006e      /* Tertiary accent */
--color-neon-green: #39ff14     /* Success states */

--color-surface-dark: #0a0a0f           /* Main background */
--color-surface-card: #12121a           /* Card background */
--color-surface-elevated: #1a1a24       /* Elevated card background */
```

### Typography

```tsx
<h1 className="text-4xl font-bold">Heading 1</h1>
<h2 className="text-3xl font-semibold">Heading 2</h2>
<h3 className="text-2xl font-semibold">Heading 3</h3>
<p className="text-base">Body text</p>
<small className="text-sm text-white/60">Small text</small>
```

### Spacing Scale

```
0.5 = 2px     1 = 4px      2 = 8px      3 = 12px     4 = 16px
6 = 24px      8 = 32px     12 = 48px    16 = 64px
```

---

## Accessibility

All components are built with accessibility in mind:

### WCAG 2.1 Compliance

- ✅ Keyboard navigation support
- ✅ ARIA labels and roles
- ✅ Focus indicators
- ✅ Color contrast ratios ≥ 4.5:1
- ✅ Touch target size ≥ 44×44px
- ✅ Semantic HTML

### Example

```tsx
<RangeSlider
  min={18}
  max={100}
  value={[25, 40]}
  onChange={setRange}
  // Automatically includes:
  // - role="slider"
  // - aria-label
  // - aria-valuemin/valuemax/valuenow
  // - keyboard support
/>
```

---

## Animation Specifications

### RangeSlider

- Thumb hover: Scale up (w-6 → w-7)
- Thumb drag: Glow intensity increases
- Track gradient: Smooth opacity transitions

### Toggle

- Thumb movement: Spring animation (stiffness: 500, damping: 30)
- Duration: 200ms
- Easing: Spring curve

### CardSection

- Hover (interactive): Scale 1.02x
- Tap: Scale 0.98x
- Duration: 200-300ms

### ProfileGridItem

- Hover: Scale 1.05x
- Image: Scale 1.1x on parent hover
- Accent line: Horizontal slide-in

### PremiumBanner

- Shimmer: 8s continuous loop
- Icon rotation: 2s loop with bounce
- CTA arrow: 1.5s pulse animation

---

## Performance Notes

- All components use `useCallback` for stable references
- Motion animations use GPU acceleration
- Images are lazy-loaded when possible
- Overflow handling prevents layout shift

---

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toggle } from '@/components/ui'

test('Toggle changes on click', async () => {
  const handleChange = jest.fn()
  render(
    <Toggle checked={false} onChange={handleChange} label="Test" />
  )

  await userEvent.click(screen.getByRole('switch'))
  expect(handleChange).toHaveBeenCalledWith(true)
})
```

---

## Component Showcase

View all components in action at `/components/showcase`

---

## Version History

### v1.0 (Initial Release)
- ✅ RangeSlider component
- ✅ Toggle switch component
- ✅ CardSection container
- ✅ ProfileGridItem component
- ✅ PremiumBanner component
- ✅ Full TypeScript support
- ✅ Framer Motion animations
- ✅ WCAG 2.1 accessibility

---

## Contributing

When adding new components:

1. Follow the TypeScript interface pattern
2. Include JSDoc comments
3. Add ARIA labels for accessibility
4. Use Framer Motion for animations
5. Export from `src/components/ui/index.ts`
6. Add to this documentation
7. Create tests
8. Update changelog

---

## License

Echo Components © 2024 Adam Beloucif. All rights reserved.
