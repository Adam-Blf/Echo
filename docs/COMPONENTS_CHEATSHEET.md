# Echo Components Cheat Sheet

Quick reference guide for using Echo UI components.

---

## Import All Components

```tsx
import {
  RangeSlider,
  Toggle,
  CardSection,
  ProfileGridItem,
  PremiumBanner,
} from '@/components/ui'
```

---

## RangeSlider

**For age/distance/price filters with dual thumbs**

```tsx
const [range, setRange] = useState<[number, number]>([18, 65])

<RangeSlider
  min={18}
  max={100}
  value={range}
  onChange={setRange}
  unit="ans"
  step={1}
/>
```

| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `min` | number | required | Minimum value |
| `max` | number | required | Maximum value |
| `value` | [number, number] | required | Current range |
| `onChange` | function | required | Called on value change |
| `unit` | string | - | Display unit (e.g., "km") |
| `step` | number | 1 | Increment step |
| `disabled` | boolean | false | Disable interaction |

**Colors:**
- Min thumb: Neon Cyan (#00f5ff)
- Max thumb: Neon Purple (#bf00ff)
- Track: Gradient cyan→purple

---

## Toggle

**For on/off switches and boolean settings**

```tsx
const [enabled, setEnabled] = useState(true)

<Toggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable notifications"
  size="md"
/>
```

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `checked` | boolean | required | Current state |
| `onChange` | function | required | Called on toggle |
| `label` | string | - | Display label |
| `labelPosition` | string | 'right' | 'left' or 'right' |
| `size` | string | 'md' | 'sm', 'md', 'lg' |
| `disabled` | boolean | false | Disable interaction |

**Sizes:**
- `sm`: 40×24px (compact)
- `md`: 56×32px (standard)
- `lg`: 64×36px (large displays)

---

## CardSection

**For content containers with optional title/icon**

```tsx
import { Settings } from 'lucide-react'

<CardSection
  title="Preferences"
  icon={Settings}
  variant="elevated"
  interactive
>
  Card content goes here
</CardSection>
```

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `title` | string | - | Card title |
| `icon` | LucideIcon | - | Icon from lucide-react |
| `children` | ReactNode | required | Card content |
| `variant` | string | 'default' | 'default', 'elevated', 'danger', 'premium' |
| `interactive` | boolean | false | Enable hover scale |
| `onClick` | function | - | Click handler |

**Variants:**
- `default`: Subtle, minimal styling
- `elevated`: Enhanced shadow, featured
- `danger`: Red accent, warnings
- `premium`: Gradient, shimmer effect

---

## ProfileGridItem

**For profile cards in grid layouts**

```tsx
<ProfileGridItem
  image="https://example.com/photo.jpg"
  name="Sarah"
  age={26}
  badge="verified"
  onClick={() => console.log('View profile')}
/>
```

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `image` | string | required | Image URL |
| `name` | string | required | User name |
| `age` | number | required | User age |
| `badge` | string | - | 'super-like', 'new', 'verified' |
| `blurred` | boolean | false | Premium blur effect |
| `alt` | string | - | Alt text |
| `onClick` | function | - | Click handler |

**Badges:**
- `'super-like'`: Red heart badge
- `'new'`: Cyan badge
- `'verified'`: Purple crown badge

**Aspect Ratio:** 3:4 (mobile portrait)

---

## PremiumBanner

**For promotional and limited-time offers**

```tsx
const [visible, setVisible] = useState(true)

{visible && (
  <PremiumBanner
    heading="Unlock Premium"
    description="Get unlimited likes and advanced filters"
    ctaText="Subscribe"
    variant="exclusive"
    onCTA={() => console.log('Subscribe')}
    onClose={() => setVisible(false)}
  />
)}
```

| Prop | Type | Default | Values |
|------|------|---------|--------|
| `heading` | string | required | Main text |
| `description` | string | - | Secondary text |
| `ctaText` | string | 'Découvrir' | Button text |
| `onCTA` | function | - | CTA click handler |
| `onClose` | function | - | Close handler |
| `closeable` | boolean | true | Show close button |
| `icon` | ReactNode | Crown | Custom icon |
| `variant` | string | 'default' | 'default', 'exclusive', 'limited' |

**Variants:**
- `default`: Cyan→Purple gradient
- `exclusive`: Purple→Pink→Purple (limited offers)
- `limited`: Yellow (time-limited deals)

---

## Common Patterns

### Filter Panel

```tsx
const [age, setAge] = useState<[number, number]>([22, 35])
const [distance, setDistance] = useState<[number, number]>([5, 50])
const [verified, setVerified] = useState(false)

<CardSection title="Filters" variant="elevated">
  <RangeSlider
    min={18} max={65} value={age} onChange={setAge} unit="ans"
  />
  <RangeSlider
    min={1} max={200} value={distance} onChange={setDistance} unit="km"
  />
  <Toggle
    checked={verified} onChange={setVerified} label="Verified only"
  />
</CardSection>
```

### Settings Panel

```tsx
<div className="space-y-4">
  <Toggle checked={notif} onChange={setNotif} label="Notifications" />
  <Toggle checked={location} onChange={setLocation} label="Location" />
  <Toggle checked={analytics} onChange={setAnalytics} label="Analytics" />
</div>
```

### Profile Grid

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {profiles.map(p => (
    <ProfileGridItem
      key={p.id}
      image={p.image}
      name={p.name}
      age={p.age}
      badge={p.badge}
      onClick={() => viewProfile(p.id)}
    />
  ))}
</div>
```

### Dashboard

```tsx
<div className="space-y-6">
  <PremiumBanner
    heading="Unlock features"
    ctaText="Upgrade"
    onCTA={handleUpgrade}
  />
  <CardSection variant="elevated">
    {/* Stats */}
  </CardSection>
  <CardSection variant="default">
    {/* Settings */}
  </CardSection>
</div>
```

---

## Styling Reference

### Colors

```
Neon Cyan:    #00f5ff
Neon Purple:  #bf00ff
Neon Pink:    #ff006e
Neon Green:   #39ff14

Dark Surface: #0a0a0f
Card Surface: #12121a
Elevated:     #1a1a24
```

### Spacing Scale

```
px-1 = 4px    px-2 = 8px     px-4 = 16px
px-6 = 24px   px-8 = 32px    px-12 = 48px
```

### Typography

```
text-xs   = 12px
text-sm   = 14px
text-base = 16px
text-lg   = 18px
text-xl   = 20px
text-2xl  = 24px
```

---

## Accessibility Shortcuts

All components include:
- ✅ `aria-label` for screen readers
- ✅ `role` attributes (e.g., `role="switch"`)
- ✅ Keyboard navigation (Tab, Enter, Arrows)
- ✅ Focus indicators (`:focus-visible`)
- ✅ High contrast ratios (4.5:1+)
- ✅ Touch targets ≥44×44px

---

## Animation Timing

| Component | Animation | Duration | Easing |
|-----------|-----------|----------|--------|
| Toggle | Spring | 200ms | Spring curve |
| CardSection | Scale hover | 300ms | ease-out |
| ProfileGridItem | Scale | 300ms | ease-out |
| PremiumBanner | Shimmer | 8s | linear |

---

## Responsive Breakpoints

```
Mobile:   < 640px (default, 1 column)
sm:       640px+  (2 columns)
md:       768px+  (3-4 columns)
lg:       1024px+ (4+ columns)
xl:       1280px+ (6+ columns)
```

### Example

```tsx
<div className="
  grid grid-cols-1
  sm:grid-cols-2
  md:grid-cols-3
  lg:grid-cols-4
  gap-4
">
```

---

## State Management

### Option 1: Local State

```tsx
const [value, setValue] = useState(initialValue)
<Component value={value} onChange={setValue} />
```

### Option 2: Context API

```tsx
const { value, setValue } = useContext(FilterContext)
<Component value={value} onChange={setValue} />
```

### Option 3: Zustand Store

```tsx
const value = useFilterStore(state => state.value)
const setValue = useFilterStore(state => state.setValue)
```

---

## Testing Snippets

### RangeSlider Test

```tsx
const { getByRole } = render(
  <RangeSlider min={0} max={100} value={[25, 75]} onChange={mockFn} />
)
await userEvent.click(getByRole('slider').first)
```

### Toggle Test

```tsx
const { getByRole } = render(
  <Toggle checked={false} onChange={mockFn} />
)
await userEvent.click(getByRole('switch'))
expect(mockFn).toHaveBeenCalledWith(true)
```

### CardSection Test

```tsx
render(
  <CardSection title="Test" variant="elevated">
    Content
  </CardSection>
)
expect(screen.getByText('Test')).toBeInTheDocument()
```

---

## Performance Tips

1. **Memoize callbacks** to prevent unnecessary re-renders
   ```tsx
   const handleChange = useCallback((value) => {
     setState(value)
   }, [])
   ```

2. **Use virtual scrolling** for large profile grids
   ```tsx
   import { FixedSizeList } from 'react-window'
   ```

3. **Lazy load images** in ProfileGridItem
   ```tsx
   <img loading="lazy" src={image} />
   ```

4. **Debounce range slider** for API calls
   ```tsx
   const debouncedChange = useDebouncedCallback(onChange, 300)
   ```

---

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions
- Mobile Safari: ✅ iOS 12+
- Chrome Mobile: ✅ Latest

---

## Troubleshooting

### Toggle not appearing
- Check `checked` prop is boolean
- Verify `onChange` callback is provided

### RangeSlider thumbs stuck
- Ensure `value` is properly typed: `[number, number]`
- Check `min < max`

### CardSection icon not showing
- Import icon from `lucide-react`
- Pass icon component, not instance: `icon={SettingsIcon}` not `icon={<SettingsIcon />}`

### ProfileGridItem images not loading
- Verify CORS headers on image server
- Check image URL is absolute (not relative)

### PremiumBanner animations glitchy
- Check `Framer Motion` is installed
- Verify GPU acceleration enabled on device

---

## Resources

- **Components**: `/components/ui/`
- **Showcase**: `/components/showcase`
- **Docs**: `docs/COMPONENTS.md`
- **Stories**: `docs/COMPONENT_STORIES.md`
- **Design System**: `src/index.css`

---

## Quick Links

- Lucide Icons: https://lucide.dev
- Framer Motion: https://www.framer.com/motion
- Tailwind CSS: https://tailwindcss.com
- React Hooks: https://react.dev/reference/react

---

**Last Updated:** 2024
**Version:** 1.0
**Maintainer:** Adam Beloucif
