"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type CookieConsent = "accepted" | "rejected" | null;

interface CookieConsentContextValue {
  consent: CookieConsent;
  acceptCookies: () => void;
  rejectCookies: () => void;
  resetConsent: () => void;
  showBanner: boolean;
  setShowBanner: (show: boolean) => void;
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

const CONSENT_COOKIE_NAME = "tikvatenu_cookie_consent";
const CONSENT_EXPIRY_DAYS = 365;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedConsent = getCookie(CONSENT_COOKIE_NAME) as CookieConsent;
    if (savedConsent === "accepted" || savedConsent === "rejected") {
      setConsent(savedConsent);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    setCookie(CONSENT_COOKIE_NAME, "accepted", CONSENT_EXPIRY_DAYS);
    setConsent("accepted");
    setShowBanner(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const rejectCookies = () => {
    setCookie(CONSENT_COOKIE_NAME, "rejected", CONSENT_EXPIRY_DAYS);
    setConsent("rejected");
    setShowBanner(false);
  };

  const resetConsent = () => {
    if (typeof document !== "undefined") {
      document.cookie = `${CONSENT_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
    setConsent(null);
    setShowBanner(true);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <CookieConsentContext.Provider
      value={{ consent, acceptCookies, rejectCookies, resetConsent, showBanner, setShowBanner }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}

export function hasConsentedToAnalytics(): boolean {
  if (typeof document === "undefined") return false;
  return getCookie(CONSENT_COOKIE_NAME) === "accepted";
}
