/**
 * Echo Components - Quick Usage Examples
 *
 * Copy-paste ready examples for each component
 * All imports and props are included
 *
 * Access live demos at: /components/showcase
 */

import { useState } from 'react'
import { Filter, Heart, Crown, Settings, AlertTriangle } from 'lucide-react'
import {
  RangeSlider,
  Toggle,
  CardSection,
  ProfileGridItem,
  PremiumBanner,
} from '.'

// ============================================================================
// 1. RANGE SLIDER EXAMPLES
// ============================================================================

export function RangeSliderExample_AgeFilter() {
  const [age, setAge] = useState<[number, number]>([22, 35])

  return (
    <CardSection title="Age Preference" icon={Filter} variant="elevated">
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

export function RangeSliderExample_DistanceFilter() {
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

export function RangeSliderExample_PriceRange() {
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

// ============================================================================
// 2. TOGGLE EXAMPLES
// ============================================================================

export function ToggleExample_NotificationSettings() {
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

export function ToggleExample_DarkMode() {
  const [darkMode, setDarkMode] = useState(true)

  return (
    <Toggle
      checked={darkMode}
      onChange={setDarkMode}
      label="Dark Mode"
      size="lg"
    />
  )
}

export function ToggleExample_MultipleSettings() {
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

// ============================================================================
// 3. CARD SECTION EXAMPLES
// ============================================================================

export function CardSectionExample_Default() {
  return (
    <CardSection variant="default">
      <p>Standard card with minimal styling</p>
    </CardSection>
  )
}

export function CardSectionExample_Elevated() {
  return (
    <CardSection
      title="Premium Member"
      icon={Heart}
      variant="elevated"
    >
      <p>You have premium access for 15 more days.</p>
      <button className="btn-primary mt-4">Renew Subscription</button>
    </CardSection>
  )
}

export function CardSectionExample_Danger() {
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

export function CardSectionExample_Premium() {
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

// ============================================================================
// 4. PROFILE GRID ITEM EXAMPLES
// ============================================================================

export function ProfileGridItemExample_SingleCard() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <ProfileGridItem
        image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop"
        name="Sarah"
        age={26}
        badge="verified"
        onClick={() => console.log('View profile')}
      />
    </div>
  )
}

export function ProfileGridItemExample_Grid() {
  const profiles = [
    {
      id: 1,
      name: 'Sarah',
      age: 26,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop',
      badge: 'new' as const,
    },
    {
      id: 2,
      name: 'Emma',
      age: 24,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      badge: 'verified' as const,
    },
    {
      id: 3,
      name: 'Lisa',
      age: 28,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
    },
  ]

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

export function ProfileGridItemExample_WithBlur() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProfileGridItem
        image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop"
        name="Hidden"
        age={0}
        blurred={true}
        onClick={() => console.log('Upgrade to Premium')}
      />
    </div>
  )
}

// ============================================================================
// 5. PREMIUM BANNER EXAMPLES
// ============================================================================

export function PremiumBannerExample_Default() {
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

export function PremiumBannerExample_Exclusive() {
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

export function PremiumBannerExample_Limited() {
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

// ============================================================================
// 6. COMBINED / ADVANCED EXAMPLES
// ============================================================================

export function CombinedExample_FilterPanel() {
  const [age, setAge] = useState<[number, number]>([22, 35])
  const [distance, setDistance] = useState<[number, number]>([5, 50])
  const [showPhotos, setShowPhotos] = useState(true)
  const [verified, setVerified] = useState(false)

  return (
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
  )
}

export function CombinedExample_Dashboard() {
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

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

/**
 * Copy-paste examples organized by component type:
 *
 * RangeSlider:
 * - RangeSliderExample_AgeFilter
 * - RangeSliderExample_DistanceFilter
 * - RangeSliderExample_PriceRange
 *
 * Toggle:
 * - ToggleExample_NotificationSettings
 * - ToggleExample_DarkMode
 * - ToggleExample_MultipleSettings
 *
 * CardSection:
 * - CardSectionExample_Default
 * - CardSectionExample_Elevated
 * - CardSectionExample_Danger
 * - CardSectionExample_Premium
 *
 * ProfileGridItem:
 * - ProfileGridItemExample_SingleCard
 * - ProfileGridItemExample_Grid
 * - ProfileGridItemExample_WithBlur
 *
 * PremiumBanner:
 * - PremiumBannerExample_Default
 * - PremiumBannerExample_Exclusive
 * - PremiumBannerExample_Limited
 *
 * Combined:
 * - CombinedExample_FilterPanel
 * - CombinedExample_Dashboard
 */
