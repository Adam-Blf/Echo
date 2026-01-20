import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Language } from './translations'

// Define a generic translation structure type
interface TranslationStrings {
  common: {
    loading: string
    error: string
    success: string
    cancel: string
    confirm: string
    save: string
    delete: string
    edit: string
    close: string
    back: string
    next: string
    skip: string
    done: string
    yes: string
    no: string
    or: string
  }
  nav: {
    home: string
    discover: string
    matches: string
    profile: string
    chat: string
  }
  auth: {
    login: string
    signup: string
    logout: string
    email: string
    password: string
    forgotPassword: string
    noAccount: string
    hasAccount: string
    loginError: string
    signupError: string
  }
  home: {
    title: string
    tagline: string
    subtitle: string
    cta: string
    features: {
      realPhoto: string
      realPhotoDesc: string
      wingman: string
      wingmanDesc: string
      ephemeral: string
      ephemeralDesc: string
    }
  }
  discover: {
    title: string
    noMoreProfiles: string
    comeBackLater: string
    refreshProfiles: string
    verified: string
    superLike: string
    nope: string
    like: string
    rewind: string
  }
  matches: {
    title: string
    tabs: {
      active: string
      resonance: string
      expired: string
    }
    noMatches: string
    startSwiping: string
    expiresIn: string
    expired: string
    newMatch: string
    sendMessage: string
    resonanceUnlocked: string
    permanent: string
  }
  chat: {
    placeholder: string
    send: string
    typing: string
    delivered: string
    read: string
    today: string
    yesterday: string
    photoSent: string
    voiceSent: string
  }
  profile: {
    title: string
    editProfile: string
    settings: string
    premium: string
    echoStatus: {
      active: string
      expiring: string
      silence: string
    }
    ttl: {
      title: string
      description: string
      daysLeft: string
      takePhoto: string
      expired: string
      expiredDesc: string
    }
    stats: {
      likes: string
      matches: string
      superLikes: string
    }
  }
  onboarding: {
    welcome: string
    step1: {
      title: string
      placeholder: string
    }
    step2: {
      title: string
      subtitle: string
    }
    step3: {
      title: string
      subtitle: string
      takePhoto: string
      retake: string
    }
    step4: {
      title: string
      subtitle: string
      shareLink: string
      copied: string
    }
    step5: {
      title: string
      subtitle: string
      start: string
    }
  }
  wingman: {
    title: string
    subtitle: string
    intro: string
    recordVoice: string
    selectQualities: string
    selectFlaws: string
    submit: string
    success: string
    expired: string
    already: string
  }
  limits: {
    dailySwipes: string
    weeklySuperlikes: string
    unlimited: string
    remaining: string
    limitReached: string
    upgradeTitle: string
    upgradeDesc: string
    features: {
      unlimitedSwipes: string
      superLikes: string
      rewind: string
      seeWhoLikes: string
      noAds: string
    }
  }
  resonance: {
    title: string
    subtitle: string
    description: string
    checkIn: string
    checking: string
    tooFar: string
    distance: string
    success: string
    permanent: string
  }
  errors: {
    generic: string
    network: string
    notFound: string
    unauthorized: string
    validation: string
    camera: string
    location: string
    locationDenied: string
    fileTooLarge: string
    invalidFileType: string
  }
  time: {
    now: string
    minute: string
    minutes: string
    hour: string
    hours: string
    day: string
    days: string
    ago: string
    left: string
  }
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationStrings
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const STORAGE_KEY = 'echo-language'

function getInitialLanguage(): Language {
  // Check localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'fr' || stored === 'en') {
      return stored
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0]
    if (browserLang === 'fr') {
      return 'fr'
    }
  }

  // Default to French
  return 'fr'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value: I18nContextType = {
    language,
    setLanguage,
    t: translations[language] as TranslationStrings,
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function useTranslation() {
  const { t } = useI18n()
  return t
}
