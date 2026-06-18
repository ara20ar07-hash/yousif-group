/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Services from './components/Services';
import About from './components/About';
import DesignerTool from './components/DesignerTool';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import OwnerLoginModal from './components/OwnerLoginModal';
import { LanguageProvider } from './components/LanguageContext';
import { OwnerProvider } from './components/OwnerContext';

export default function App() {
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

  return (
    <LanguageProvider>
      <OwnerProvider>
        <div className="min-h-screen bg-navy text-text-main selection:bg-amber selection:text-navy">
          <Navbar onOpenOwnerModal={() => setIsOwnerModalOpen(true)} />
          <main>
            <Hero />
            <Stats />
            <About />
            <Services />
            <DesignerTool />
            <Contact />
          </main>
          <Footer />
          <WhatsAppButton />

          <OwnerLoginModal 
            isOpen={isOwnerModalOpen} 
            onClose={() => setIsOwnerModalOpen(false)} 
          />
        </div>
      </OwnerProvider>
    </LanguageProvider>
  );
}
