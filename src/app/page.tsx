export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className='min-h-screen flex items-center justify-center px-6'>
        <div className='max-w-4xl w-full'>
          {/* h1-h6 automatically uses Antique Condensed */}
          <h1 className='text-[140px]! md:text-[180px]! leading-[0.75]'>
            marklearst
          </h1>
          {/* Tagline */}
          <p className='text-3xl mb-8 leading-relaxed'>
            Principal IC Design Engineer building design systems, developer
            tools, and health tech products.
          </p>
          {/* Bio */}
          <p className='text-xl text-white/60 mb-12 leading-relaxed'>
            Remote-first engineer specializing in design systems, developer
            tooling, and health tech. Currently building Variable Contract and
            GlucoseIQ.
          </p>

          {/* CTAs */}
          <div className='flex flex-wrap gap-4'>
            <a
              href='/work'
              className='px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-gray-300 transition-all duration-500 font-semibold'
            >
              View work
            </a>
            <a
              href='https://github.com/marklearst'
              className='px-8 py-4 border-2 border-white rounded-lg hover:bg-white/30 transition-all duration-500 font-semibold'
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className='py-24 px-6'>
        <div className='max-w-6xl mx-auto'>
          <h2 className='text-6xl mb-12'>featured work</h2>

          <div className='grid md:grid-cols-3 gap-8'>
            {/* Variable Contract */}
            <div className='bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200'>
              <div className='text-sm font-mono text-teal-400 mb-3 uppercase tracking-wide'>
                Systems Architecture
              </div>
              <h3 className='text-2xl mb-4 font-sans font-semibold'>
                variable contract
              </h3>
              <p className='text-white/60 mb-6 leading-relaxed'>
                Design token standardization specification. DTCG-aligned, SemVer
                versioning, cross-tool adapters.
              </p>
              <a
                href='/work/variable-contract'
                className='text-white hover:text-white/80 font-semibold transition-colors duration-200'
              >
                Read case study →
              </a>
            </div>

            {/* GlucoseIQ */}
            <div className='bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200'>
              <div className='text-sm font-mono text-green-400 mb-3 uppercase tracking-wide'>
                Health Tech
              </div>
              <h3 className='text-2xl mb-4 font-sans font-semibold'>
                glucoseiq
              </h3>
              <p className='text-white/60 mb-6 leading-relaxed'>
                ML-powered glucose monitoring for Apple Watch. HealthKit
                integration, Core ML patterns, privacy-first.
              </p>
              <a
                href='/work/glucoseiq'
                className='text-white hover:text-white/80 font-semibold transition-colors duration-200'
              >
                Read case study →
              </a>
            </div>

            {/* diabetic-utils */}
            <div className='bg-white/5 p-8 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200'>
              <div className='text-sm font-mono text-purple-400 mb-3 uppercase tracking-wide'>
                Open Source
              </div>
              <h3 className='text-2xl mb-4 font-sans font-semibold'>
                diabetic-utils
              </h3>
              <p className='text-white/60 mb-6 leading-relaxed'>
                TypeScript library for glucose calculations. Featured in Google
                AI Overview, adopted by health tech teams.
              </p>
              <a
                href='/work/diabetic-utils'
                className='text-white hover:text-white/80 font-semibold transition-colors duration-200'
              >
                Read case study →
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className='py-24 px-6 bg-white/5'>
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-6xl mb-16 text-center'>what colleagues say</h2>

          <div className='space-y-12'>
            {/* Stuart O'Neil */}
            <div className='border-l-4 border-white pl-8'>
              <p className='text-xl mb-6 leading-relaxed'>
                "The rare developer that is the marriage of creative and
                technology. He elevates the aesthetic and user experience of any
                product he is developing."
              </p>
              <div>
                <div className='font-bold'>Stuart O'Neil</div>
                <div className='text-white/60'>Executive Creative Director</div>
              </div>
            </div>

            {/* Doug Wojciechowski */}
            <div className='border-l-4 border-white pl-8'>
              <p className='text-xl mb-6 leading-relaxed'>
                "Master craftsman with attention to detail, deep experience and
                passion. There's very little he can't figure out given enough
                time and determination."
              </p>
              <div>
                <div className='font-bold'>Doug Wojciechowski</div>
                <div className='text-white/60'>Design Leader</div>
              </div>
            </div>

            {/* Tanya Aylsworth-Kempf */}
            <div className='border-l-4 border-white pl-8'>
              <p className='text-xl mb-6 leading-relaxed'>
                "There are no limits in Mark's abilities. Highly intelligent,
                excellent communication skills, always willing to help others."
              </p>
              <div>
                <div className='font-bold'>Tanya Aylsworth-Kempf</div>
                <div className='text-white/60'>
                  Associate Creative Director, VMLY&R
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
