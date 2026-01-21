import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Heart, AlertCircle, Sparkles } from 'lucide-react'
import {
  RangeSlider,
  Toggle,
  CardSection,
  ProfileGridItem,
  PremiumBanner,
} from '@/components/ui'

/**
 * Component Showcase Page
 * Interactive demonstration of all new UI components
 */
export function ComponentShowcase() {
  // RangeSlider state
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65])
  const [distanceRange, setDistanceRange] = useState<[number, number]>([1, 100])

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(true)
  const [premiumEnabled, setPremiumEnabled] = useState(false)

  // Banner state
  const [showBanner, setShowBanner] = useState(true)

  const mockProfiles = [
    { id: 1, name: 'Sarah', age: 26, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop', badge: 'new' as const },
    { id: 2, name: 'Emma', age: 24, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', badge: 'super-like' as const },
    { id: 3, name: 'Lisa', age: 28, image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop', badge: 'verified' as const },
    { id: 4, name: 'Maya', age: 25, image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=500&fit=crop', blurred: true },
  ]

  return (
    <div className="min-h-screen bg-surface-dark">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-white/10 bg-surface-card/50 backdrop-blur-sm sticky top-0 z-40 safe-top"
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Component Library</h1>
              <p className="text-sm text-white/60">Echo UI Design System Showcase</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Premium Banner</h2>
          {showBanner && (
            <PremiumBanner
              heading="Débloquez les superpouvoirs"
              description="Accédez à des filtres avancés, voir qui vous aime, et bien plus..."
              ctaText="Devenir Premium"
              variant="exclusive"
              onCTA={() => console.log('CTA clicked')}
              onClose={() => setShowBanner(false)}
              closeable
            />
          )}
        </motion.section>

        {/* Range Sliders Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 grid gap-8 md:grid-cols-2"
        >
          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">Range Slider</h2>
            <CardSection
              title="Filtre d'âge"
              icon={Settings}
              variant="elevated"
            >
              <RangeSlider
                min={18}
                max={100}
                value={ageRange}
                onChange={setAgeRange}
                unit="ans"
                step={1}
              />
              <p className="mt-4 text-sm text-white/60">
                Sélectionné: {ageRange[0]} - {ageRange[1]} ans
              </p>
            </CardSection>
          </div>

          <div>
            <h2 className="mb-6 text-2xl font-bold text-white">&nbsp;</h2>
            <CardSection
              title="Filtre de distance"
              icon={Settings}
              variant="elevated"
            >
              <RangeSlider
                min={1}
                max={200}
                value={distanceRange}
                onChange={setDistanceRange}
                unit="km"
                step={5}
              />
              <p className="mt-4 text-sm text-white/60">
                Sélectionné: {distanceRange[0]} - {distanceRange[1]} km
              </p>
            </CardSection>
          </div>
        </motion.section>

        {/* Toggle Switches Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Toggle Switches</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <CardSection variant="default">
              <Toggle
                checked={notificationsEnabled}
                onChange={setNotificationsEnabled}
                label="Notifications"
                labelPosition="right"
              />
            </CardSection>
            <CardSection variant="default">
              <Toggle
                checked={darkModeEnabled}
                onChange={setDarkModeEnabled}
                label="Mode sombre"
                labelPosition="right"
                size="md"
              />
            </CardSection>
            <CardSection variant="default">
              <Toggle
                checked={premiumEnabled}
                onChange={setPremiumEnabled}
                label="Mode Premium"
                labelPosition="right"
              />
            </CardSection>
          </div>
        </motion.section>

        {/* Card Sections Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Card Section Variants</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <CardSection
              title="Carte par défaut"
              variant="default"
            >
              <p>Ceci est une carte avec le style par défaut.</p>
            </CardSection>

            <CardSection
              title="Carte élevée"
              icon={Sparkles}
              variant="elevated"
            >
              <p>Ceci est une carte avec un style surélevé et une ombre améliorée.</p>
            </CardSection>

            <CardSection
              title="Attention requise"
              icon={AlertCircle}
              variant="danger"
            >
              <p>Ceci est une carte de danger pour les messages d'avertissement ou d'erreur.</p>
            </CardSection>

            <CardSection
              title="Offre Premium"
              icon={Heart}
              variant="premium"
              interactive
              onClick={() => console.log('Premium card clicked')}
            >
              <p>Ceci est une carte premium avec un design luxe et interactif.</p>
            </CardSection>
          </div>
        </motion.section>

        {/* Profile Grid Item Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Profile Grid Items</h2>
          <div className="grid auto-rows-max gap-4 sm:grid-cols-2 md:grid-cols-4">
            {mockProfiles.map((profile) => (
              <ProfileGridItem
                key={profile.id}
                image={profile.image}
                name={profile.name}
                age={profile.age}
                badge={profile.badge}
                blurred={profile.blurred}
                onClick={() => console.log(`Clicked ${profile.name}`)}
              />
            ))}
          </div>
        </motion.section>

        {/* Code Examples Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Usage Examples</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <CardSection
              title="RangeSlider"
              variant="elevated"
            >
              <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-neon-cyan">
{`<RangeSlider
  min={18}
  max={100}
  value={[25, 40]}
  onChange={setRange}
  unit="ans"
  step={1}
/>`}
              </pre>
            </CardSection>

            <CardSection
              title="Toggle"
              variant="elevated"
            >
              <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-neon-cyan">
{`<Toggle
  checked={isEnabled}
  onChange={setEnabled}
  label="Notifications"
  size="md"
/>`}
              </pre>
            </CardSection>

            <CardSection
              title="CardSection"
              variant="elevated"
            >
              <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-neon-cyan">
{`<CardSection
  title="Titre"
  icon={SettingsIcon}
  variant="premium"
  interactive
>
  Contenu ici
</CardSection>`}
              </pre>
            </CardSection>

            <CardSection
              title="ProfileGridItem"
              variant="elevated"
            >
              <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-neon-cyan">
{`<ProfileGridItem
  image={url}
  name="Sarah"
  age={26}
  badge="verified"
  onClick={handleClick}
/>`}
              </pre>
            </CardSection>
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/10 py-8 text-center text-white/60"
        >
          <p>Echo Component Library • Design System v1.0</p>
        </motion.footer>
      </div>
    </div>
  )
}

export default ComponentShowcase
