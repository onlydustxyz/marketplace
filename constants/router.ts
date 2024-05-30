export const NEXT_ROUTER = {
  projects: {
    all: "/",
    details: {
      root: (slug: string) => `/p/${slug}`,
      contributors: (slug: string) => `/p/${slug}/contributors`,
      rewards: {
        root: (slug: string) => `/p/${slug}/rewards`,
        new: (slug: string) => `/p/${slug}/rewards/new`,
      },
      edit: (slug: string) => `/p/${slug}/edit`,
      contributions: (slug: string) => `/p/${slug}/contributions`,
      insights: (slug: string) => `/p/${slug}/insights`,
    },
    creation: "/p/create",
  },
  contributions: {
    all: "/contributions",
  },
  rewards: {
    all: "/rewards",
  },
  sponsor: {
    details: {
      root: (sponsorId: string) => `/sponsor/${sponsorId}`,
    },
  },
  settings: {
    all: "/settings",
    profile: "/settings/profile",
    payoutPreferences: "/settings/payout-preferences",
    billing: {
      root: (slug: string) => `/settings/billing/${slug}`,
      generalInformation: (slug: string) => `/settings/billing/${slug}/general-information`,
      paymentMethods: (slug: string) => `/settings/billing/${slug}/payment-methods`,
      coworkers: (slug: string) => `/settings/billing/${slug}/coworkers`,
      invoices: (slug: string) => `/settings/billing/${slug}/invoices`,
    },
  },
  publicProfile: {
    root: (githubLogin: string) => `/u/${githubLogin}`,
  },
  notFound: "/not-found",
  onboarding: "/onboarding",
  termsAndConditions: "/terms-and-conditions",
  maintenance: "/maintenance",
  hackathons: {
    root: "/hackathons",
    details: {
      root: (slug: string) => `/h/${slug}`,
      overview: (slug: string) => `/h/${slug}#overview`,
      tracks: (slug: string) => `/h/${slug}#tracks`,
    },
  },
  ecosystems: {
    root: "/ecosystems",
    details: {
      root: (slug: string) => `/ecosystems/${slug}`,
    },
  },
} as const;
