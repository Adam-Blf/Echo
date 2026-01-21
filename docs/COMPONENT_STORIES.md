# Component Stories & Examples

Visual documentation and usage patterns for Echo UI components.

---

## RangeSlider Stories

### Story 1: Age Filter

```tsx
import { RangeSlider } from '@/components/ui'
import { CardSection } from '@/components/ui'
import { useState } from 'react'

export function AgeFilterStory() {
  const [age, setAge] = useState<[number, number]>([22, 35])

  return (
    <CardSection title="Age Preference" variant="elevated">
      <RangeSlider
        min={18}
        max={65}
        value={age}
        onChange={setAge}
        unit="ans"
        step={1}
      />
      <p className="mt-4 text-sm text-white/60">
        Profile will match users aged {age[0]} to {age[1]}
      </p>
    </CardSection>
  )
}
```

### Story 2: Distance Filter

```tsx
import { RangeSlider } from '@/components/ui'
import { useState } from 'react'

export function DistanceFilterStory() {
  const [distance, setDistance] = useState<[number, number]>([5, 50])

  return (
    <RangeSlider
      min={1}
      max={200}
      value={distance}
      onChange={setDistance}
      unit="km"
      step={5}
    />
  )
}
```

### Story 3: Price Range (Generic Use)

```tsx
export function PriceRangeStory() {
  const [price, setPrice] = useState<[number, number]>([100, 500])

  return (
    <RangeSlider
      min={0}
      max={1000}
      value={price}
      onChange={setPrice}
      unit="€"
      step={10}
    />
  )
}
```

---

## Toggle Stories

### Story 1: Notifications Toggle

```tsx
import { Toggle } from '@/components/ui'
import { useState } from 'react'

export function NotificationsToggleStory() {
  const [enabled, setEnabled] = useState(true)

  return (
    <Toggle
      checked={enabled}
      onChange={setEnabled}
      label="Push Notifications"
      labelPosition="right"
      size="md"
    />
  )
}
```

### Story 2: Dark Mode Toggle

```tsx
export function DarkModeToggleStory() {
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="flex items-center gap-4">
      <Toggle
        checked={darkMode}
        onChange={setDarkMode}
        label="Dark Mode"
        size="lg"
      />
    </div>
  )
}
```

### Story 3: Multiple Toggles (Settings Panel)

```tsx
import { CardSection } from '@/components/ui'

export function SettingsPanelStory() {
  const [settings, setSettings] = useState({
    notifications: true,
    location: true,
    analytics: false,
    marketing: false,
  })

  const handleChange = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <CardSection title="Preferences" variant="elevated">
      <div className="space-y-4">
        <Toggle
          checked={settings.notifications}
          onChange={() => handleChange('notifications')}
          label="Receive notifications"
        />
        <Toggle
          checked={settings.location}
          onChange={() => handleChange('location')}
          label="Share location"
        />
        <Toggle
          checked={settings.analytics}
          onChange={() => handleChange('analytics')}
          label="Share usage analytics"
        />
        <Toggle
          checked={settings.marketing}
          onChange={() => handleChange('marketing')}
          label="Marketing emails"
        />
      </div>
    </CardSection>
  )
}
```

---

## CardSection Stories

### Story 1: Elevated Card

```tsx
import { CardSection } from '@/components/ui'
import { Zap } from 'lucide-react'

export function ElevatedCardStory() {
  return (
    <CardSection
      title="Premium Member"
      icon={Zap}
      variant="elevated"
    >
      <p>You have premium access for 15 more days.</p>
      <button className="btn-primary mt-4">Renew Subscription</button>
    </CardSection>
  )
}
```

### Story 2: Danger Card (Warning)

```tsx
import { AlertTriangle } from 'lucide-react'

export function DangerCardStory() {
  return (
    <CardSection
      title="Profile Review Required"
      icon={AlertTriangle}
      variant="danger"
    >
      <p>Your profile violates our community guidelines. Please update it.</p>
    </CardSection>
  )
}
```

### Story 3: Premium Card (Interactive)

```tsx
import { Crown } from 'lucide-react'

export function PremiumCardStory() {
  return (
    <CardSection
      title="Unlock Premium"
      icon={Crown}
      variant="premium"
      interactive
      onClick={() => console.log('Navigate to premium')}
    >
      <ul className="space-y-2 text-sm">
        <li>✓ See who liked you</li>
        <li>✓ Advanced filters</li>
        <li>✓ Unlimited matches</li>
      </ul>
    </CardSection>
  )
}
```

### Story 4: Default Card Collection

```tsx
export function CardGridStory() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <CardSection variant="default">
        Standard card with minimal styling
      </CardSection>
      <CardSection variant="default" title="With Title">
        Card with title but no icon
      </CardSection>
    </div>
  )
}
```

---

## ProfileGridItem Stories

### Story 1: Profile Grid

```tsx
import { ProfileGridItem } from '@/components/ui'

const profiles = [
  {
    id: 1,
    name: 'Sarah',
    age: 26,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    badge: 'new' as const,
  },
  {
    id: 2,
    name: 'Emma',
    age: 24,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    badge: 'verified' as const,
  },
  {
    id: 3,
    name: 'Lisa',
    age: 28,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  },
]

export function ProfileGridStory() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {profiles.map(profile => (
        <ProfileGridItem
          key={profile.id}
          image={profile.image}
          name={profile.name}
          age={profile.age}
          badge={profile.badge}
          onClick={() => console.log(`View ${profile.name}`)}
        />
      ))}
    </div>
  )
}
```

### Story 2: Single Profile (Large)

```tsx
export function LargeProfileStory() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <ProfileGridItem
        image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
        name="Sarah"
        age={26}
        badge="super-like"
        onClick={() => console.log('View profile')}
      />
    </div>
  )
}
```

### Story 3: Premium Blurred Profile

```tsx
export function PremiumBlurredStory() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProfileGridItem
        image="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
        name="Hidden"
        age={0}
        blurred={true}
        onClick={() => console.log('Upgrade to Premium')}
      />
    </div>
  )
}
```

---

## PremiumBanner Stories

### Story 1: Default Premium Banner

```tsx
import { PremiumBanner } from '@/components/ui'
import { useState } from 'react'

export function DefaultBannerStory() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <PremiumBanner
      heading="Upgrade to Premium"
      description="Get unlimited likes, advanced filters, and see who likes you!"
      ctaText="Learn More"
      variant="default"
      onCTA={() => console.log('Subscribe')}
      onClose={() => setVisible(false)}
    />
  )
}
```

### Story 2: Exclusive Offer Banner

```tsx
export function ExclusiveBannerStory() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <PremiumBanner
      heading="Limited Time: 50% Off"
      description="Get premium for half price for 3 months"
      ctaText="Claim Offer"
      variant="exclusive"
      onCTA={() => console.log('Apply code')}
      onClose={() => setVisible(false)}
      closeable
    />
  )
}
```

### Story 3: Limited Time Deal

```tsx
export function LimitedTimeBannerStory() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <PremiumBanner
      heading="Flash Sale Ends Tonight!"
      description="Premium membership: 29€ instead of 99€"
      ctaText="Grab Now"
      variant="limited"
      onCTA={() => console.log('Purchase')}
      onClose={() => setVisible(false)}
    />
  )
}
```

### Story 4: Custom Icon Banner

```tsx
import { Heart } from 'lucide-react'

export function CustomIconBannerStory() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <PremiumBanner
      heading="Someone Special Liked You!"
      description="See who it is with Premium"
      ctaText="View Profile"
      variant="exclusive"
      icon={<Heart className="h-8 w-8 text-white fill-white" />}
      onCTA={() => console.log('View')}
      closeable
    />
  )
}
```

---

## Combined Component Stories

### Story 1: Complete Filter Panel

```tsx
import { useState } from 'react'
import { RangeSlider, Toggle, CardSection } from '@/components/ui'
import { Filter } from 'lucide-react'

export function FilterPanelStory() {
  const [age, setAge] = useState<[number, number]>([22, 35])
  const [distance, setDistance] = useState<[number, number]>([5, 50])
  const [showPhotos, setShowPhotos] = useState(true)
  const [verified, setVerified] = useState(false)

  return (
    <div className="space-y-6">
      <CardSection title="Discover Filters" icon={Filter} variant="elevated">
        <div className="space-y-6">
          <RangeSlider
            min={18}
            max={65}
            value={age}
            onChange={setAge}
            unit="ans"
          />

          <RangeSlider
            min={1}
            max={200}
            value={distance}
            onChange={setDistance}
            unit="km"
          />

          <div className="space-y-3 border-t border-white/10 pt-4">
            <Toggle
              checked={showPhotos}
              onChange={setShowPhotos}
              label="Has photos"
            />
            <Toggle
              checked={verified}
              onChange={setVerified}
              label="Verified profiles only"
            />
          </div>

          <button className="btn-primary w-full">Apply Filters</button>
        </div>
      </CardSection>
    </div>
  )
}
```

### Story 2: Dashboard with Mixed Components

```tsx
export function DashboardStory() {
  const [premium, setPremium] = useState(false)

  return (
    <div className="space-y-6">
      {!premium && (
        <PremiumBanner
          heading="Become Premium Today"
          description="Access all premium features"
          ctaText="Upgrade"
          onCTA={() => setPremium(true)}
        />
      )}

      <CardSection title="Profile Stats" variant="elevated">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-neon-cyan">42</p>
            <p className="text-xs text-white/60">Likes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neon-purple">8</p>
            <p className="text-xs text-white/60">Matches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-neon-pink">156</p>
            <p className="text-xs text-white/60">Views</p>
          </div>
        </div>
      </CardSection>

      <CardSection title="Preferences" variant="default">
        <div className="space-y-3">
          <Toggle label="Online Status" checked={true} onChange={() => {}} />
          <Toggle label="Allow Messages" checked={true} onChange={() => {}} />
        </div>
      </CardSection>
    </div>
  )
}
```

---

## Responsive Stories

### Story 1: Mobile Grid

```tsx
// 2 columns on mobile, 4 on desktop
export function ResponsiveGridStory() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {/* ProfileGridItems here */}
    </div>
  )
}
```

### Story 2: Mobile Filter Panel

```tsx
// Full width on mobile, constrained on desktop
export function ResponsiveFilterStory() {
  return (
    <div className="w-full md:max-w-sm mx-auto md:mx-0">
      {/* Filter content */}
    </div>
  )
}
```

---

## State Management Stories

### Story 1: Controlled Component

```tsx
import { useState } from 'react'

export function ControlledStory() {
  const [filters, setFilters] = useState({
    ageMin: 18,
    ageMax: 65,
    showPhotos: true,
  })

  return (
    <div>
      <RangeSlider
        min={18}
        max={65}
        value={[filters.ageMin, filters.ageMax]}
        onChange={([min, max]) =>
          setFilters(prev => ({ ...prev, ageMin: min, ageMax: max }))
        }
      />
    </div>
  )
}
```

### Story 2: Context Integration

```tsx
import { useFilters } from '@/contexts/FiltersContext'

export function ContextIntegrationStory() {
  const { age, setAge } = useFilters()

  return (
    <RangeSlider
      min={18}
      max={65}
      value={age}
      onChange={setAge}
    />
  )
}
```

---

## Accessibility Stories

### Story 1: Keyboard Navigation

```tsx
// All components support full keyboard navigation:
// - Tab/Shift+Tab to navigate
// - Enter/Space to activate toggles
// - Arrow keys for range slider
export function KeyboardAccessibleStory() {
  const [toggle, setToggle] = useState(false)
  const [range, setRange] = useState<[number, number]>([25, 40])

  return (
    <div>
      <Toggle
        checked={toggle}
        onChange={setToggle}
        label="Keyboard accessible"
      />
      <RangeSlider
        min={18}
        max={65}
        value={range}
        onChange={setRange}
      />
    </div>
  )
}
```

---

## Performance Stories

### Story 1: Large Grid Performance

```tsx
// Efficiently renders 100+ profiles
export function LargeGridPerformanceStory() {
  const profiles = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Profile ${i}`,
    age: Math.floor(Math.random() * 30 + 20),
    image: `https://picsum.photos/400/500?random=${i}`,
  }))

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {profiles.map(p => (
        <ProfileGridItem
          key={p.id}
          image={p.image}
          name={p.name}
          age={p.age}
        />
      ))}
    </div>
  )
}
```

---

## Animation Stories

### Story 1: Component Transitions

```tsx
import { motion } from 'framer-motion'

export function TransitionStory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <PremiumBanner
        heading="Smooth entrance animation"
        variant="premium"
      />
    </motion.div>
  )
}
```

---

## Dark Mode Stories

All components are designed for dark mode and look beautiful with the Echo dark theme.

```tsx
// Global dark mode class is applied to <html>
// All components automatically adapt
export function DarkModeStory() {
  return (
    <div className="min-h-screen bg-surface-dark">
      <RangeSlider min={0} max={100} value={[25, 75]} onChange={() => {}} />
      <Toggle checked={true} onChange={() => {}} label="Looks great in dark!" />
    </div>
  )
}
```

---

## Export All Stories

To use these stories in Storybook or a component library:

```typescript
export {
  AgeFilterStory,
  DistanceFilterStory,
  PriceRangeStory,
  NotificationsToggleStory,
  DarkModeToggleStory,
  SettingsPanelStory,
  ElevatedCardStory,
  DangerCardStory,
  PremiumCardStory,
  CardGridStory,
  ProfileGridStory,
  LargeProfileStory,
  PremiumBlurredStory,
  DefaultBannerStory,
  ExclusiveBannerStory,
  LimitedTimeBannerStory,
  CustomIconBannerStory,
  FilterPanelStory,
  DashboardStory,
  ResponsiveGridStory,
  ResponsiveFilterStory,
  ControlledStory,
  ContextIntegrationStory,
  KeyboardAccessibleStory,
  LargeGridPerformanceStory,
  TransitionStory,
  DarkModeStory,
}
```
