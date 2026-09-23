import ContactSection from '../components/contact/ContactSection'
import PageHeader from '../components/ui/PageHeader'
import Seo from '../components/ui/Seo'

export default function Contact() {
  return (
    <>
      <Seo
        title="Kontak"
        description="Hubungi Threevo untuk mendiskusikan kebutuhan operasional brand Anda. Kami akan menyusun rekomendasi paket yang sesuai."
      />

      <PageHeader
        eyebrow="Kontak"
        title="Mari bicarakan kebutuhan brand Anda"
        description="Ceritakan kondisi operasional Anda saat ini, dan tim kami akan menyusun rekomendasi paket yang paling sesuai."
      />

      {/* Judul seksinya sudah dibawakan PageHeader di atas. */}
      <ContactSection />
    </>
  )
}
