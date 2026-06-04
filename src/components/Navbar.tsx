import { motion } from 'motion/react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-navy/90 backdrop-blur-md border-b border-border-main">
      <a href="#" className="flex items-center gap-2.5 no-underline">
        {/* Placeholder for the logo - replacing the heavy base64 to keep code clean and performant, styling remains identical */}
        <div className="w-12 h-12 bg-amber/10 rounded-full border border-amber/30 flex items-center justify-center font-display text-amber text-xl tracking-wider">
          YG
        </div>
        <span className="font-display text-2xl tracking-tight italic text-text-main leading-none">
          Yousif<span className="text-amber">.</span>Group
        </span>
      </a>

      <ul className="hidden lg:flex gap-9 list-none">
        {['Services', 'About', 'Design Tool', 'Contact'].map((item) => (
          <li key={item}>
            <a
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-muted text-[11px] tracking-[0.2em] font-medium uppercase hover:text-text-main transition-colors duration-250"
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      <a
        href="#contact"
        className="border border-border-main rounded-full px-6 py-2 text-[11px] uppercase tracking-widest text-text-main hover:bg-text-main hover:text-navy transition-all duration-200"
      >
        Get a Quote
      </a>
    </nav>
  );
}
