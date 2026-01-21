/**
 * Test data fixtures for E2E tests
 */

export const TEST_USERS = {
  valid: {
    email: 'test@echo.app',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  },
  invalid: {
    email: 'invalid.email@',
    password: 'weak',
  },
}

export const MOCK_PROFILES = {
  sophie: {
    firstName: 'Sophie',
    age: 24,
    bio: 'Passionnée de voyages et de photographie',
  },
  emma: {
    firstName: 'Emma',
    age: 26,
    bio: 'Développeuse le jour, DJ la nuit',
  },
  lea: {
    firstName: 'Léa',
    age: 23,
    bio: 'Étudiante en médecine, fan de Netflix',
  },
}

export const CHAT_MESSAGES = {
  greeting: 'Salut ! Comment vas-tu ?',
  question: 'On se retrouve où ?',
  emoji: 'C\'est cool de matcher avec toi 😊',
  longMessage: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10),
}

export const TIMEOUTS = {
  short: 3000,
  medium: 5000,
  long: 10000,
  animation: 500,
}

export const URLS = {
  auth: '/auth',
  discover: '/discover',
  matches: '/matches',
  chat: (id: string) => `/chat/${id}`,
  settings: '/settings',
  profile: '/profile',
}
