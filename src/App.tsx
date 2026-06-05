/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import About from './components/About';
import DesignerTool from './components/DesignerTool';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import { LanguageProvider } from './components/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-navy text-text-main font-sans selection:bg-amber selection:text-navy">
        <Navbar />
        <main>
          <Hero />
          <Stats />
          <Services />
          <About />
          <DesignerTool />
          <Contact />
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </LanguageProvider>
  );
}
