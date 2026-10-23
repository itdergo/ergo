/**
 * components/site-layout.tsx — Main site layout component.
 *
 * Renders the complete page chrome for the public site:
 * - Header: fixed navigation with logo, nav links, product dropdown, CTA button,
 *   mobile hamburger menu with collapsible product submenu
 * - Footer: brand info, social links, navigation columns, contact details, copyright
 * - Scroll progress bar: Framer Motion animated progress indicator at top
 * - Back-to-top button: appears after scrolling 600px
 * - Toast notification: displays success/error messages from site context
 * - Admin access button: subtle floating button for admin login
 *
 * Navigation uses wouter's Link and useLocation for client-side routing.
 * Product dropdown filters products by category via site context.
 * Mobile navigation collapses all menus on route change and Escape key.
 *
 * Props:
 *   children: page content rendered in <main>
 *   onAdminLogin: callback when admin button is clicked
 */
import { useState, useEffect, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ChevronDown, Menu, X, ArrowUpRight } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import { asset, srcSet } from "@/lib/types";
import { useSite } from "@/lib/site-context";

const NAV = [
  // Navigation array: label + route pairs for header/footer links
  { label: "Home", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Industries", href: "/industries" },
  { label: "Projects", href: "/projects" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

export function SiteLayout({
  children,
  onAdminLogin,
}: {
  children: ReactNode;
  onAdminLogin: () => void;
}) {
  const { categories, loading, toast, filterCategory } = useSite();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    // Track scroll position for header shadow + back-to-top visibility
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close all mobile menus on route change
    setMobileOpen(false);
    setMobileProductsOpen(false);
    setProductsOpen(false);
  }, [location]);

  useEffect(() => {
    // Close mobile menus on Escape key for accessibility
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // Lock page scroll while the mobile drawer is open so the scrim is the
    // only thing behind it (prevents the background page from scrolling).
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    // Strip the hash segment (e.g. "/#testimonials" → "/") so the active-state
    // check still matches anchor links that point at page sections.
    const path = href.split("#")[0];
    const loc = location.split("#")[0];
    return path === "/" ? loc === "/" : loc.startsWith(path);
  };
  // Active link detection: exact match for /, prefix match for others

  const { scrollYProgress } = useScroll();
  // Framer Motion scroll progress: tracks page scroll as 0→1 scaleX
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  if (loading) {
    // Loading state: shown while site context fetches initial data
    return (
      <div className="site-loading">
        <div className="site-loading-inner">
          <div className="spinner" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="site">
        <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
          <nav className="nav-shell" aria-label="Main navigation">
            <Link href="/" className="brand-link" aria-label="ERGO Contracts Philippines — home">
              <img
                className="brand-logo"
                src={asset("ergo-logo.jpg")}
                alt="ERGO Contracts Philippines"
              />
            </Link>

            <div className="desktop-nav">
              <Link className={`nav-link ${isActive("/") ? "active" : ""}`} href="/">
                Home
              </Link>

              <div className={`product-nav ${productsOpen ? "is-open" : ""}`}>
                {/* Product dropdown: toggles open state, filters products by category on click */}
                <button
                  type="button"
                  className={`nav-link dropdown-trigger ${isActive("/products") ? "active" : ""}`}
                  aria-expanded={productsOpen}
                  aria-haspopup="true"
                  onClick={() => setProductsOpen((o) => !o)}
                >
                  Products <ChevronDown size={13} />
                </button>
                <div className="product-menu">
                  <Link
                    href="/products"
                    onClick={() => {
                      setProductsOpen(false);
                      filterCategory(null);
                    }}
                  >
                    All Products
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href="/products"
                      onClick={() => {
                        setProductsOpen(false);
                        filterCategory(c.slug);
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {NAV.slice(1).map((n) => (
                <Link
                  key={n.label}
                  className={`nav-link ${isActive(n.href) ? "active" : ""}`}
                  href={n.href}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            <Link className="nav-cta" href="/contact">
              Get a Free Consultation
            </Link>

            <button
              // Mobile hamburger: toggles mobile navigation panel
              type="button"
              className="menu-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </nav>

          {mobileOpen && (
            <div
              className="mobile-nav-scrim"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
          )}
          {mobileOpen && (
            <div className="mobile-nav" role="dialog" aria-label="Mobile navigation">
              <Link href="/" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <button
                type="button"
                className="mobile-product-toggle"
                aria-expanded={mobileProductsOpen}
                onClick={() => setMobileProductsOpen((o) => !o)}
              >
                Products <ChevronDown size={16} />
              </button>
              {mobileProductsOpen && (
                <div className="mobile-submenu">
                  <Link
                    href="/products"
                    onClick={() => {
                      setMobileOpen(false);
                      filterCategory(null);
                    }}
                  >
                    All Products
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href="/products"
                      onClick={() => {
                        setMobileOpen(false);
                        filterCategory(c.slug);
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {NAV.slice(1).map((n) => (
                <Link key={n.label} href={n.href} onClick={() => setMobileOpen(false)}>
                  {n.label}
                </Link>
              ))}
              <Link className="mobile-cta" href="/contact" onClick={() => setMobileOpen(false)}>
                Get a Free Consultation
              </Link>
            </div>
          )}
        </header>

        <main id="main-content" tabIndex={-1}>
          {children}
        </main>

        <footer className="site-footer">
          <div className="container footer-inner">
            <div className="footer-grid">
              <div className="footer-brand-block">
                <picture>
                  <source srcSet={srcSet("ergo-logo.jpg")} type="image/webp" sizes="92px" />
                  <img
                    className="footer-logo"
                    src={asset("ergo-logo.jpg")}
                    alt="ERGO"
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
                <p className="footer-summary">
                  Thoughtfully designed furniture and workplace solutions for offices, institutions,
                  and homes across the Philippines and Southeast Asia.
                </p>
                <div className="footer-social">
                  <a
                    href="https://www.facebook.com/profile.php?id=61595001456946"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="footer-social-link"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:sales_ergo@ergo.com.ph"
                    aria-label="Email"
                    className="footer-social-link"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </a>
                  <a href="tel:+63288431177" aria-label="Phone" className="footer-social-link">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </a>
                </div>
              </div>
              <div className="footer-column">
                <p className="footer-column-title">Company</p>
                <ul>
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/solutions">Solutions</Link>
                  </li>
                  <li>
                    <Link href="/industries">Industries</Link>
                  </li>
                  <li>
                    <Link href="/projects">Projects</Link>
                  </li>
                  <li>
                    <Link href="/resources">Resources</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                </ul>
              </div>
              <div className="footer-column">
                <p className="footer-column-title">Products</p>
                <ul>
                  {categories.slice(0, 4).map((c) => (
                    <li key={c.id}>
                      <Link href="/products" onClick={() => filterCategory(c.slug)}>
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="footer-column">
                <p className="footer-column-title">Get in Touch</p>
                <ul className="footer-contact-list">
                  <li>
                    <a href="tel:+63288431177">+63 2 8843 1177</a>
                  </li>
                  <li>
                    <a href="mailto:sales_ergo@ergo.com.ph">sales_ergo@ergo.com.ph</a>
                  </li>
                  <li>
                    <span>2634 Rockefeller St. Brgy. San Isidro, Makati City</span>
                  </li>
                  <li>
                    <span>Mon – Fri, 8:00 AM – 6:00 PM</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2026 Ergo Contracts Philippines, Inc. All rights reserved.</p>
              <div className="footer-bottom-links">
                <span>Innovate and Inspire.</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Admin launcher: dev-only convenience link. Hidden in production so it
          never appears on the live site; production login goes through the real
          /admin route. `import.meta.env.PROD` is true only for the Vite prod
          build. */}
      {import.meta.env.DEV && (
        <button onClick={onAdminLogin} className="admin-launcher">
          Admin
        </button>
      )}
      <button
        className={`back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <ArrowUpRight size={18} />
      </button>
      {toast && (
        <div
          className={`toast show ${toast.type === "success" ? "toast-success" : "toast-error"}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </>
  );
}
