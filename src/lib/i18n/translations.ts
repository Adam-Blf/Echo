export type Language = 'fr' | 'en'

export const translations = {
  fr: {
    // Common
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      skip: 'Passer',
      done: 'Terminé',
      yes: 'Oui',
      no: 'Non',
      or: 'ou',
    },

    // Navigation
    nav: {
      home: 'Accueil',
      discover: 'Découvrir',
      matches: 'Matchs',
      profile: 'Profil',
      chat: 'Messages',
    },

    // Auth
    auth: {
      login: 'Connexion',
      signup: 'Inscription',
      logout: 'Déconnexion',
      email: 'Email',
      password: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      loginError: 'Email ou mot de passe incorrect',
      signupError: 'Erreur lors de l\'inscription',
    },

    // Home
    home: {
      title: 'ECHO',
      tagline: 'Rencontres authentiques',
      subtitle: 'Photos en temps réel. Validation par un ami. Matchs éphémères.',
      cta: 'Commencer',
      features: {
        realPhoto: 'Photos temps réel',
        realPhotoDesc: 'Pas de vieilles photos, que l\'instant présent',
        wingman: 'Validation Wingman',
        wingmanDesc: 'Un ami témoigne de ta personnalité',
        ephemeral: 'Matchs 48h',
        ephemeralDesc: 'Pas de temps à perdre, agis vite',
      },
    },

    // Discover
    discover: {
      title: 'Découvrir',
      noMoreProfiles: 'Plus de profils disponibles',
      comeBackLater: 'Reviens plus tard pour de nouvelles rencontres',
      refreshProfiles: 'Rafraîchir',
      verified: 'Vérifié par Wingman',
      superLike: 'Super Like',
      nope: 'Nope',
      like: 'Like',
      rewind: 'Annuler',
    },

    // Matches
    matches: {
      title: 'Matchs',
      tabs: {
        active: 'Actifs',
        resonance: 'Résonance',
        expired: 'Expirés',
      },
      noMatches: 'Pas encore de matchs',
      startSwiping: 'Commence à swiper pour matcher',
      expiresIn: 'Expire dans',
      expired: 'Expiré',
      newMatch: 'Nouveau Match !',
      sendMessage: 'Envoyer un message',
      resonanceUnlocked: 'Résonance débloquée',
      permanent: 'Permanent',
    },

    // Chat
    chat: {
      placeholder: 'Écris un message...',
      send: 'Envoyer',
      typing: 'écrit...',
      delivered: 'Envoyé',
      read: 'Lu',
      today: 'Aujourd\'hui',
      yesterday: 'Hier',
      photoSent: 'Photo envoyée',
      voiceSent: 'Message vocal',
    },

    // Profile
    profile: {
      title: 'Mon Profil',
      editProfile: 'Modifier le profil',
      settings: 'Paramètres',
      premium: 'Premium',
      echoStatus: {
        active: 'Actif',
        expiring: 'Expire bientôt',
        silence: 'En silence',
      },
      ttl: {
        title: 'Ton Echo',
        description: 'Prends une photo pour rester visible',
        daysLeft: 'jours restants',
        takePhoto: 'Prendre une photo',
        expired: 'Ton profil est en mode silence',
        expiredDesc: 'Les autres ne peuvent plus te voir. Prends une photo pour réactiver ton Echo.',
      },
      stats: {
        likes: 'Likes reçus',
        matches: 'Matchs',
        superLikes: 'Super Likes',
      },
    },

    // Onboarding
    onboarding: {
      welcome: 'Bienvenue sur Echo',
      step1: {
        title: 'Comment tu t\'appelles ?',
        placeholder: 'Ton prénom',
      },
      step2: {
        title: 'Quel âge as-tu ?',
        subtitle: 'Tu dois avoir au moins 18 ans',
      },
      step3: {
        title: 'Prends une photo',
        subtitle: 'Une photo prise maintenant, pas une vieille photo',
        takePhoto: 'Prendre la photo',
        retake: 'Reprendre',
      },
      step4: {
        title: 'Invite ton Wingman',
        subtitle: 'Un ami qui va valider ton profil',
        shareLink: 'Partager le lien',
        copied: 'Lien copié !',
      },
      step5: {
        title: 'C\'est parti !',
        subtitle: 'Ton profil est prêt',
        start: 'Commencer à découvrir',
      },
    },

    // Wingman
    wingman: {
      title: 'Validation Wingman',
      subtitle: 'Témoigne pour ton ami(e)',
      intro: 'veut que tu valides son profil',
      recordVoice: 'Enregistre un message vocal',
      selectQualities: 'Ses qualités',
      selectFlaws: 'Ses petits défauts',
      submit: 'Valider le profil',
      success: 'Profil validé avec succès !',
      expired: 'Ce lien a expiré',
      already: 'Ce profil a déjà été validé',
    },

    // Limits
    limits: {
      dailySwipes: 'Swipes aujourd\'hui',
      weeklySuperlikes: 'Super Likes cette semaine',
      unlimited: 'Illimité',
      remaining: 'restants',
      limitReached: 'Limite atteinte',
      upgradeTitle: 'Passe à Premium',
      upgradeDesc: 'Swipes illimités et plus encore',
      features: {
        unlimitedSwipes: 'Swipes illimités',
        superLikes: '5 Super Likes / semaine',
        rewind: 'Annuler le dernier swipe',
        seeWhoLikes: 'Voir qui t\'a liké',
        noAds: 'Sans publicité',
      },
    },

    // Resonance
    resonance: {
      title: 'Résonance',
      subtitle: 'Transforme ce match en connexion permanente',
      description: 'Rencontrez-vous dans la vraie vie ! Quand vous êtes à moins de 200m l\'un de l\'autre, activez la Résonance.',
      checkIn: 'Activer la Résonance',
      checking: 'Vérification...',
      tooFar: 'Vous êtes trop loin',
      distance: 'Distance',
      success: 'Résonance activée !',
      permanent: 'Ce match est maintenant permanent',
    },

    // Errors
    errors: {
      generic: 'Une erreur est survenue',
      network: 'Erreur de connexion',
      notFound: 'Non trouvé',
      unauthorized: 'Non autorisé',
      validation: 'Données invalides',
      camera: 'Erreur caméra',
      location: 'Erreur de localisation',
      locationDenied: 'Permission de localisation refusée',
      fileTooLarge: 'Fichier trop volumineux',
      invalidFileType: 'Type de fichier non supporté',
    },

    // Time
    time: {
      now: 'Maintenant',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'heure',
      hours: 'heures',
      day: 'jour',
      days: 'jours',
      ago: 'il y a',
      left: 'restant',
    },
  },

  en: {
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      skip: 'Skip',
      done: 'Done',
      yes: 'Yes',
      no: 'No',
      or: 'or',
    },

    // Navigation
    nav: {
      home: 'Home',
      discover: 'Discover',
      matches: 'Matches',
      profile: 'Profile',
      chat: 'Messages',
    },

    // Auth
    auth: {
      login: 'Login',
      signup: 'Sign up',
      logout: 'Logout',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      loginError: 'Invalid email or password',
      signupError: 'Error during sign up',
    },

    // Home
    home: {
      title: 'ECHO',
      tagline: 'Authentic dating',
      subtitle: 'Real-time photos. Friend validation. Ephemeral matches.',
      cta: 'Get Started',
      features: {
        realPhoto: 'Real-time photos',
        realPhotoDesc: 'No old photos, only the present moment',
        wingman: 'Wingman validation',
        wingmanDesc: 'A friend vouches for your personality',
        ephemeral: '48h matches',
        ephemeralDesc: 'No time to waste, act fast',
      },
    },

    // Discover
    discover: {
      title: 'Discover',
      noMoreProfiles: 'No more profiles available',
      comeBackLater: 'Come back later for new connections',
      refreshProfiles: 'Refresh',
      verified: 'Wingman verified',
      superLike: 'Super Like',
      nope: 'Nope',
      like: 'Like',
      rewind: 'Undo',
    },

    // Matches
    matches: {
      title: 'Matches',
      tabs: {
        active: 'Active',
        resonance: 'Resonance',
        expired: 'Expired',
      },
      noMatches: 'No matches yet',
      startSwiping: 'Start swiping to match',
      expiresIn: 'Expires in',
      expired: 'Expired',
      newMatch: 'New Match!',
      sendMessage: 'Send a message',
      resonanceUnlocked: 'Resonance unlocked',
      permanent: 'Permanent',
    },

    // Chat
    chat: {
      placeholder: 'Write a message...',
      send: 'Send',
      typing: 'typing...',
      delivered: 'Delivered',
      read: 'Read',
      today: 'Today',
      yesterday: 'Yesterday',
      photoSent: 'Photo sent',
      voiceSent: 'Voice message',
    },

    // Profile
    profile: {
      title: 'My Profile',
      editProfile: 'Edit profile',
      settings: 'Settings',
      premium: 'Premium',
      echoStatus: {
        active: 'Active',
        expiring: 'Expiring soon',
        silence: 'Silent',
      },
      ttl: {
        title: 'Your Echo',
        description: 'Take a photo to stay visible',
        daysLeft: 'days left',
        takePhoto: 'Take a photo',
        expired: 'Your profile is silent',
        expiredDesc: 'Others can\'t see you. Take a photo to reactivate your Echo.',
      },
      stats: {
        likes: 'Likes received',
        matches: 'Matches',
        superLikes: 'Super Likes',
      },
    },

    // Onboarding
    onboarding: {
      welcome: 'Welcome to Echo',
      step1: {
        title: 'What\'s your name?',
        placeholder: 'Your first name',
      },
      step2: {
        title: 'How old are you?',
        subtitle: 'You must be at least 18',
      },
      step3: {
        title: 'Take a photo',
        subtitle: 'A photo taken now, not an old one',
        takePhoto: 'Take photo',
        retake: 'Retake',
      },
      step4: {
        title: 'Invite your Wingman',
        subtitle: 'A friend who will validate your profile',
        shareLink: 'Share link',
        copied: 'Link copied!',
      },
      step5: {
        title: 'You\'re all set!',
        subtitle: 'Your profile is ready',
        start: 'Start discovering',
      },
    },

    // Wingman
    wingman: {
      title: 'Wingman Validation',
      subtitle: 'Vouch for your friend',
      intro: 'wants you to validate their profile',
      recordVoice: 'Record a voice message',
      selectQualities: 'Their qualities',
      selectFlaws: 'Their small flaws',
      submit: 'Validate profile',
      success: 'Profile validated successfully!',
      expired: 'This link has expired',
      already: 'This profile has already been validated',
    },

    // Limits
    limits: {
      dailySwipes: 'Swipes today',
      weeklySuperlikes: 'Super Likes this week',
      unlimited: 'Unlimited',
      remaining: 'remaining',
      limitReached: 'Limit reached',
      upgradeTitle: 'Go Premium',
      upgradeDesc: 'Unlimited swipes and more',
      features: {
        unlimitedSwipes: 'Unlimited swipes',
        superLikes: '5 Super Likes / week',
        rewind: 'Undo last swipe',
        seeWhoLikes: 'See who likes you',
        noAds: 'Ad-free',
      },
    },

    // Resonance
    resonance: {
      title: 'Resonance',
      subtitle: 'Turn this match into a permanent connection',
      description: 'Meet in real life! When you\'re within 200m of each other, activate Resonance.',
      checkIn: 'Activate Resonance',
      checking: 'Checking...',
      tooFar: 'You\'re too far apart',
      distance: 'Distance',
      success: 'Resonance activated!',
      permanent: 'This match is now permanent',
    },

    // Errors
    errors: {
      generic: 'An error occurred',
      network: 'Connection error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      validation: 'Invalid data',
      camera: 'Camera error',
      location: 'Location error',
      locationDenied: 'Location permission denied',
      fileTooLarge: 'File too large',
      invalidFileType: 'Unsupported file type',
    },

    // Time
    time: {
      now: 'Now',
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days',
      ago: 'ago',
      left: 'left',
    },
  },
} as const

export type TranslationKey = keyof typeof translations.fr
