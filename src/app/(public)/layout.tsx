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
      {/* flex-1 ተወግዷል — በፊት main ራሱ ሙሉ viewport እንዲሞላ ይዘረጋ ነበር
          (sticky-footer pattern)፣ ይህም content አጭር በሆነ ጊዜ (ለምሳሌ
          homepage 1 category/1 product ብቻ ሲኖራት) Featured እና Footer
          መካከል ትልቅ ባዶ ቦታ ይፈጥር ነበር። አሁን Footer content እንዳለቀ ወዲያው
          ይከተላል፤ content በቂ ርዝመት ካለው ግን ገጹ እንደ ቀድሞ ያምራል። */}
      <main className="pb-16 sm:pb-0">{children}</main>
      {/* Footer አሁን በሁሉም ማያ ገጾች ይታያል (hidden sm:block ተወግዷል) */}
      <Footer settings={settings} />
      <BottomNav />
    </div>
  )
}
