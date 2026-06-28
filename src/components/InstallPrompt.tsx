'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already dismissed this session
    const dismissed = sessionStorage.getItem('pwa-install-dismissed')
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
      // Small delay for better UX — let page load first
      setTimeout(() => setIsVisible(true), 2000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Hide banner if user installs from browser menu
    window.addEventListener('appinstalled', () => setIsVisible(false))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'accepted') {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!isVisible || isDismissed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-6 md:w-80 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-xl border border-border p-4 flex items-center gap-3">
        {/* App Icon */}
        <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden">
          <img src="/icons/icon-192.png" alt="IKU SWEET CAKE" className="w-full h-full object-cover" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">IKU SWEET CAKE</p>
          <p className="text-xs text-muted-foreground mt-0.5">Add to Home Screen</p>
        </div>

        {/* Install Button */}
        <Button
          size="sm"
          onClick={handleInstall}
          className="shrink-0 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-3"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </Button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
