const readEnv = (key: string): string => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return String((import.meta as any).env[key]).trim();
  }
  return typeof process !== "undefined" ? String(process.env?.[key] ?? "").trim() : "";
};

const readLink = (key: string, fallback: string): string => readEnv(key) || fallback;

export const MARKETING_LINKS = {
  brands: {
    twoMarines: {
      name: "2 Marines",
      websiteUrl: readLink("VITE_TWO_MARINES_URL", "https://2marines.us"),
      storeUrl: readLink("VITE_TWO_MARINES_STORE_URL", "https://2marines.us/store"),
      linktreeUrl: readLink("VITE_TWO_MARINES_LINKTREE_URL", "https://linktr.ee/2Marines"),
      linktreeHandle: "@2Marines",
      socials: {
        facebook: {
          url: readLink("VITE_TWO_MARINES_FACEBOOK_URL", "https://www.facebook.com/2Marines"),
          handle: "@2Marines",
        },
        instagram: {
          url: readLink("VITE_TWO_MARINES_INSTAGRAM_URL", "https://www.instagram.com/weldingking87/"),
          handle: "@weldingking87",
        },
        youtube: {
          url: readLink("VITE_TWO_MARINES_YOUTUBE_URL", "https://www.youtube.com/@2marines"),
          handle: "@2marines",
        },
        tiktok: {
          url: readLink("VITE_TWO_MARINES_TIKTOK_URL", "https://www.tiktok.com/@2marines87"),
          handle: "@2marines87",
        },
        linkedin: {
          url: readLink("VITE_TWO_MARINES_LINKEDIN_URL", "https://www.linkedin.com/company/2marines/"),
          handle: "2marines",
        },
      },
    },
    shieldMate: {
      name: "ShieldMate",
      websiteUrl: readLink("VITE_SHIELDMATE_URL", "https://2marines.us/shieldmate"),
      subdomainUrl: readLink("VITE_SHIELDMATE_SUBDOMAIN_URL", "https://shieldmate.2marines.us/"),
      socials: {
        facebook: {
          url: readLink("VITE_SHIELDMATE_FACEBOOK_URL", "https://www.facebook.com/profile.php?id=61590465844563"),
          handle: "PENDING",
        },
        instagram: {
          url: readLink("VITE_SHIELDMATE_INSTAGRAM_URL", "https://www.instagram.com/shieldmate1/"),
          handle: "@shieldmate1",
        },
        youtube: {
          status: "PENDING_PLAYLIST_ONLY",
        },
        tiktok: {
          status: "PENDING_USE_2MARINES_MAIN",
        },
        linkedin: {
          status: "PENDING_SHOWCASE_PAGE",
        },
      },
    },
    marineCoins: {
      name: "Marine Coins",
      websiteUrl: readLink("VITE_MARINE_COINS_URL", "https://2marines.us/marinecoin"),
      subdomainUrl: readLink("VITE_MARINE_COINS_SUBDOMAIN_URL", "https://marinecoin.2marines.us/marinecoin"),
      socials: {
        facebook: {
          url: readLink("VITE_MARINE_COINS_FACEBOOK_URL", "https://www.facebook.com/profile.php?id=61590719603751"),
          handle: "PENDING",
        },
        instagram: {
          url: readLink("VITE_MARINE_COINS_INSTAGRAM_URL", "https://www.instagram.com/marinecoin1/"),
          handle: "@marinecoin1",
        },
        youtube: {
          status: "PENDING_PLAYLIST_ONLY",
        },
        tiktok: {
          status: "PENDING_USE_2MARINES_MAIN",
        },
        linkedin: {
          status: "PENDING_SHOWCASE_PAGE",
        },
      },
    },
  },
  people: {
    joshuaMcAllister: {
      linktreeUrl: readEnv("VITE_JOSHUA_LINKTREE_URL"),
    },
  },
  socials: {
    facebookUrl: readLink("VITE_FACEBOOK_URL", "https://www.facebook.com/2Marines"),
    instagramUrl: readLink("VITE_INSTAGRAM_URL", "https://www.instagram.com/weldingking87/"),
    youtubeUrl: readLink("VITE_YOUTUBE_URL", "https://www.youtube.com/@2marines"),
    tiktokUrl: readLink("VITE_TIKTOK_URL", "https://www.tiktok.com/@2marines87"),
    linkedinUrl: readLink("VITE_LINKEDIN_URL", "https://www.linkedin.com/company/2marines/"),
  },
  commerce: {
    shopifyStoreUrl: readLink("VITE_SHOPIFY_STORE_URL", "https://shieldmateapp.myshopify.com/"),
    socialLinksStatus: "DONE",
    footerMenuStatus: "DONE",
    footerMenuName: "2 Marines Ecosystem",
  },
  appStores: {
    appleAppStoreUrl: readEnv("VITE_APP_STORE_URL"),
    googlePlayUrl: readEnv("VITE_GOOGLE_PLAY_URL"),
  },
} as const;

export const SHOPIFY_STORE_URL = MARKETING_LINKS.commerce.shopifyStoreUrl;
