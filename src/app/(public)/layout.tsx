import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BottomNav } from '@/components/layout/BottomNav'
import { getSettings } from '@/actions/settings'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <div className="flex min-h-screen flex-col">
      <Header businessName={settings.business_name} />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      {/* Footer አሁን በሁሉም ማያ ገጾች ይታያል (hidden sm:block ተወግዷል) */}
      <Footer settings={settings} />
      <BottomNav />
    </div>
  )
}
