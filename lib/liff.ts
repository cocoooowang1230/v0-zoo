// LINE LIFF SDK integration

// Type definitions for LINE LIFF SDK
interface LiffProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

interface LiffContext {
  type: "utou" | "room" | "group" | "none"
  viewType: "compact" | "tall" | "full"
  userId?: string
  utouId?: string
  roomId?: string
  groupId?: string
}

interface Liff {
  init: (config: { liffId: string }) => Promise<void>
  isLoggedIn: () => boolean
  login: (options?: { redirectUri?: string }) => void
  logout: () => void
  getProfile: () => Promise<LiffProfile>
  getContext: () => LiffContext
  openWindow: (params: { url: string; external: boolean }) => void
  closeWindow: () => void
  sendMessages: (messages: any[]) => Promise<void>
  scanCode: () => Promise<{ value: string }>
  getAccessToken: () => string
  getIDToken: () => string
  getDecodedIDToken: () => any
  getOS: () => "ios" | "android" | "web"
  getLanguage: () => string
  getVersion: () => string
  isInClient: () => boolean
  isApiAvailable: (apiName: string) => boolean
}

declare global {
  interface Window {
    liff: Liff
  }
}

// Initialize LIFF
export async function initializeLiff(liffId: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") {
      console.log("[v0] Not in browser environment, skipping LIFF init")
      return false
    }

    if (!window.liff) {
      try {
        const liffModule = await import("@line/liff")
        console.log("[v0] LIFF SDK loaded successfully")
        // Ensure the module is properly loaded
        if (!window.liff) {
          console.log("[v0] LIFF SDK loaded but not available on window object")
          return false
        }
      } catch (importError: any) {
        console.log(
          "[v0] LIFF SDK not available - this is expected in preview environment:",
          importError?.message || importError,
        )
        // Return false gracefully instead of throwing error
        return false
      }
    }

    if (window.liff) {
      try {
        await window.liff.init({ liffId })
        console.log("[v0] LIFF initialized successfully")
        return true
      } catch (initError: any) {
        console.log("[v0] LIFF init failed:", initError?.message || initError)
        return false
      }
    }

    return false
  } catch (error: any) {
    console.log("[v0] LIFF initialization skipped:", error?.message || error)
    // Return false instead of throwing to prevent app crashes
    return false
  }
}

// Get user profile
export async function getUserProfile(): Promise<LiffProfile | null> {
  try {
    if (typeof window === "undefined" || !window.liff) {
      return null
    }

    if (!window.liff.isLoggedIn()) {
      console.log("User is not logged in")
      return null
    }

    return await window.liff.getProfile()
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return null
  }
}

// Check if running in LINE environment
export function isInLineApp(): boolean {
  if (typeof window === "undefined" || !window.liff) {
    return false
  }

  return window.liff.isInClient()
}

// Login with LINE
export function loginWithLine(redirectUri?: string): void {
  if (typeof window === "undefined" || !window.liff) {
    return
  }

  window.liff.login({ redirectUri })
}

// Logout from LINE
export function logoutFromLine(): void {
  if (typeof window === "undefined" || !window.liff) {
    return
  }

  window.liff.logout()
  window.location.reload()
}

// Send message to LINE chat
export async function sendMessage(message: string): Promise<boolean> {
  try {
    if (typeof window === "undefined" || !window.liff || !window.liff.isInClient()) {
      return false
    }

    await window.liff.sendMessages([
      {
        type: "text",
        text: message,
      },
    ])

    return true
  } catch (error) {
    console.error("Failed to send message:", error)
    return false
  }
}

// Close LIFF window
export function closeLiffWindow(): void {
  if (typeof window === "undefined" || !window.liff) {
    return
  }

  window.liff.closeWindow()
}

// Get LINE access token
export function getLineAccessToken(): string | null {
  if (typeof window === "undefined" || !window.liff || !window.liff.isLoggedIn()) {
    return null
  }

  return window.liff.getAccessToken()
}
