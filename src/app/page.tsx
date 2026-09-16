import Hero from '@/components/home/Hero'
import FeaturedWork from '@/components/home/FeaturedWork'
import Testimonials from '@/components/home/Testimonials'
import Footer from '@/components/shell/Footer'

export default function Home() {
  return (
    <main className='relative'>
      <Hero />
      <FeaturedWork />
      <Testimonials />
      <Footer />
    </main>
  )
}
