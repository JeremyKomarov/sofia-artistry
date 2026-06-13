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
import SectionGate from '@/components/SectionGate/SectionGate';

export default function Home() {
  return (
    <ContentProvider>
      <JsonLd />
      <Header />
      <main>
        <Hero />
        <SectionGate section="trust"><TrustBar /></SectionGate>
        <SectionGate section="services"><Services /></SectionGate>
        <SectionGate section="gallery"><Gallery /></SectionGate>
        <SectionGate section="reviews"><Reviews /></SectionGate>
        <SectionGate section="about"><About /></SectionGate>
        <SectionGate section="process"><Process /></SectionGate>
        <SectionGate section="faq"><Faq /></SectionGate>
        <SectionGate section="finalCta"><FinalCta /></SectionGate>
      </main>
      <Footer />
      <SectionNav />
      <StickyCta />
      <RevealObserver />
    </ContentProvider>
  );
}
