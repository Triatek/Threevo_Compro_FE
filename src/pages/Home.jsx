import ClientsSection from '../components/home/ClientsSection'
import ContactSection from '../components/contact/ContactSection'
import CtaSection from '../components/home/CtaSection'
import Hero from '../components/home/Hero'
import Intro from '../components/home/Intro'
import ServicesSection from '../components/home/ServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import Seo from '../components/ui/Seo'
import { useSite } from '../hooks/useSite'
import { ErrorState } from '../components/ui/states'

export default function Home() {
  const { error, reload } = useSite()

  if (error) {
    return (
      <>
        <Seo />
        <ErrorState error={error} onRetry={reload} className="min-h-[60vh]" />
      </>
    )
  }

  return (
    <>
      <Seo description="Threevo adalah commerce enablement company yang membantu brand bertumbuh lewat manajemen marketplace, warehouse fulfillment, dan social media management." />
      <Hero />
      <Intro />
      <ServicesSection />
      <ClientsSection />
      <TestimonialsSection />
      <CtaSection />
      <ContactSection withHeading className="pb-20 lg:pb-28" />
    </>
  )
}
