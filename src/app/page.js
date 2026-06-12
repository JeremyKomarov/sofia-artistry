import { ContentProvider } from '@/contexts/ContentContext';
import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import TrustBar from '@/components/TrustBar/TrustBar';
import Services from '@/components/Services/Services';
import Gallery from '@/components/Gallery/Gallery';
import Reviews from '@/components/Reviews/Reviews';
import About from '@/components/About/About';
import Process from '@/components/Process/Process';
import Faq from '@/components/Faq/Faq';
import FinalCta from '@/components/FinalCta/FinalCta';
import Footer from '@/components/Footer/Footer';
import SectionNav from '@/components/SectionNav/SectionNav';
import RevealObserver from '@/components/RevealObserver/RevealObserver';
import JsonLd from '@/components/JsonLd/JsonLd';
import StickyCta from '@/components/StickyCta/StickyCta';

export default function Home() {
  return (
    <ContentProvider>
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <Services />
        <Gallery />
        <Reviews />
        <About />
        <Process />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <SectionNav />
      <StickyCta />
      <RevealObserver />
    </ContentProvider>
  );
}
