import { Navbar, Hero, HowItWorks, SocialImpact, PricingSection, Footer } from '@/components/landing/LandingPage'

export default function Home() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <Hero />
            <HowItWorks />
            <SocialImpact />
            <PricingSection />
            <Footer />
        </main>
    )
}
