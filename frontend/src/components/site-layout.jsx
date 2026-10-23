import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
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
  { label: "Contact", href: "/contact" }
];
function SiteLayout({
  children,
  onAdminLogin
}) {
  const { categories, loading, toast, filterCategory } = useSite();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setMobileOpen(false);
    setMobileProductsOpen(false);
    setProductsOpen(false);
  }, [location]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setMobileProductsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);
  const isActive = (href) => {
    const path = href.split("#")[0];
    const loc = location.split("#")[0];
    return path === "/" ? loc === "/" : loc.startsWith(path);
  };
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "site-loading", children: /* @__PURE__ */ jsxs("div", { className: "site-loading-inner", children: [
      /* @__PURE__ */ jsx("div", { className: "spinner" }),
      /* @__PURE__ */ jsx("p", { children: "Loading..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(motion.div, { className: "scroll-progress", style: { scaleX } }),
    /* @__PURE__ */ jsx("a", { className: "skip-link", href: "#main-content", children: "Skip to main content" }),
    /* @__PURE__ */ jsxs("div", { className: "site", children: [
      /* @__PURE__ */ jsxs("header", { className: `site-header ${scrolled ? "scrolled" : ""}`, children: [
        /* @__PURE__ */ jsxs("nav", { className: "nav-shell", "aria-label": "Main navigation", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", className: "brand-link", "aria-label": "ERGO Contracts Philippines \u2014 home", children: /* @__PURE__ */ jsx(
            "img",
            {
              className: "brand-logo",
              src: asset("ergo-logo.jpg"),
              alt: "ERGO Contracts Philippines"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "desktop-nav", children: [
            /* @__PURE__ */ jsx(Link, { className: `nav-link ${isActive("/") ? "active" : ""}`, href: "/", children: "Home" }),
            /* @__PURE__ */ jsxs("div", { className: `product-nav ${productsOpen ? "is-open" : ""}`, children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: `nav-link dropdown-trigger ${isActive("/products") ? "active" : ""}`,
                  "aria-expanded": productsOpen,
                  "aria-haspopup": "true",
                  onClick: () => setProductsOpen((o) => !o),
                  children: [
                    "Products ",
                    /* @__PURE__ */ jsx(ChevronDown, { size: 13 })
                  ]
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "product-menu", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: "/products",
                    onClick: () => {
                      setProductsOpen(false);
                      filterCategory(null);
                    },
                    children: "All Products"
                  }
                ),
                categories.map((c) => /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: "/products",
                    onClick: () => {
                      setProductsOpen(false);
                      filterCategory(c.slug);
                    },
                    children: c.name
                  },
                  c.id
                ))
              ] })
            ] }),
            NAV.slice(1).map((n) => /* @__PURE__ */ jsx(
              Link,
              {
                className: `nav-link ${isActive(n.href) ? "active" : ""}`,
                href: n.href,
                children: n.label
              },
              n.label
            ))
          ] }),
          /* @__PURE__ */ jsx(Link, { className: "nav-cta", href: "/contact", children: "Get a Free Consultation" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "menu-toggle",
              "aria-label": mobileOpen ? "Close menu" : "Open menu",
              "aria-expanded": mobileOpen,
              onClick: () => setMobileOpen((o) => !o),
              children: mobileOpen ? /* @__PURE__ */ jsx(X, { size: 22 }) : /* @__PURE__ */ jsx(Menu, { size: 22 })
            }
          )
        ] }),
        mobileOpen && /* @__PURE__ */ jsx(
          "div",
          {
            className: "mobile-nav-scrim",
            onClick: () => setMobileOpen(false),
            "aria-hidden": "true"
          }
        ),
        mobileOpen && /* @__PURE__ */ jsxs("div", { className: "mobile-nav", role: "dialog", "aria-label": "Mobile navigation", children: [
          /* @__PURE__ */ jsx(Link, { href: "/", onClick: () => setMobileOpen(false), children: "Home" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              className: "mobile-product-toggle",
              "aria-expanded": mobileProductsOpen,
              onClick: () => setMobileProductsOpen((o) => !o),
              children: [
                "Products ",
                /* @__PURE__ */ jsx(ChevronDown, { size: 16 })
              ]
            }
          ),
          mobileProductsOpen && /* @__PURE__ */ jsxs("div", { className: "mobile-submenu", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: "/products",
                onClick: () => {
                  setMobileOpen(false);
                  filterCategory(null);
                },
                children: "All Products"
              }
            ),
            categories.map((c) => /* @__PURE__ */ jsx(
              Link,
              {
                href: "/products",
                onClick: () => {
                  setMobileOpen(false);
                  filterCategory(c.slug);
                },
                children: c.name
              },
              c.id
            ))
          ] }),
          NAV.slice(1).map((n) => /* @__PURE__ */ jsx(Link, { href: n.href, onClick: () => setMobileOpen(false), children: n.label }, n.label)),
          /* @__PURE__ */ jsx(Link, { className: "mobile-cta", href: "/contact", onClick: () => setMobileOpen(false), children: "Get a Free Consultation" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("main", { id: "main-content", tabIndex: -1, children }),
      /* @__PURE__ */ jsx("footer", { className: "site-footer", children: /* @__PURE__ */ jsxs("div", { className: "container footer-inner", children: [
        /* @__PURE__ */ jsxs("div", { className: "footer-grid", children: [
          /* @__PURE__ */ jsxs("div", { className: "footer-brand-block", children: [
            /* @__PURE__ */ jsxs("picture", { children: [
              /* @__PURE__ */ jsx("source", { srcSet: srcSet("ergo-logo.jpg"), type: "image/webp", sizes: "92px" }),
              /* @__PURE__ */ jsx(
                "img",
                {
                  className: "footer-logo",
                  src: asset("ergo-logo.jpg"),
                  alt: "ERGO",
                  loading: "lazy",
                  decoding: "async"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "footer-summary", children: "Thoughtfully designed furniture and workplace solutions for offices, institutions, and homes across the Philippines and Southeast Asia." }),
            /* @__PURE__ */ jsxs("div", { className: "footer-social", children: [
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "https://www.facebook.com/profile.php?id=61595001456946",
                  target: "_blank",
                  rel: "noreferrer",
                  "aria-label": "Facebook",
                  className: "footer-social-link",
                  children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) })
                }
              ),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: "mailto:sales_ergo@ergo.com.ph",
                  "aria-label": "Email",
                  className: "footer-social-link",
                  children: /* @__PURE__ */ jsxs(
                    "svg",
                    {
                      width: "18",
                      height: "18",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      children: [
                        /* @__PURE__ */ jsx("path", { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
                        /* @__PURE__ */ jsx("polyline", { points: "22,6 12,13 2,6" })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx("a", { href: "tel:+63288431177", "aria-label": "Phone", className: "footer-social-link", children: /* @__PURE__ */ jsx(
                "svg",
                {
                  width: "18",
                  height: "18",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  children: /* @__PURE__ */ jsx("path", { d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
                }
              ) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "footer-column", children: [
            /* @__PURE__ */ jsx("p", { className: "footer-column-title", children: "Company" }),
            /* @__PURE__ */ jsxs("ul", { children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/", children: "Home" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/solutions", children: "Solutions" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/industries", children: "Industries" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/projects", children: "Projects" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/resources", children: "Resources" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/contact", children: "Contact" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "footer-column", children: [
            /* @__PURE__ */ jsx("p", { className: "footer-column-title", children: "Products" }),
            /* @__PURE__ */ jsx("ul", { children: categories.slice(0, 4).map((c) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { href: "/products", onClick: () => filterCategory(c.slug), children: c.name }) }, c.id)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "footer-column", children: [
            /* @__PURE__ */ jsx("p", { className: "footer-column-title", children: "Get in Touch" }),
            /* @__PURE__ */ jsxs("ul", { className: "footer-contact-list", children: [
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "tel:+63288431177", children: "+63 2 8843 1177" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "mailto:sales_ergo@ergo.com.ph", children: "sales_ergo@ergo.com.ph" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("span", { children: "2634 Rockefeller St. Brgy. San Isidro, Makati City" }) }),
              /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("span", { children: "Mon \u2013 Fri, 8:00 AM \u2013 6:00 PM" }) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "footer-bottom", children: [
          /* @__PURE__ */ jsx("p", { children: "\xA9 2026 Ergo Contracts Philippines, Inc. All rights reserved." }),
          /* @__PURE__ */ jsx("div", { className: "footer-bottom-links", children: /* @__PURE__ */ jsx("span", { children: "Innovate and Inspire." }) })
        ] })
      ] }) })
    ] }),
    import.meta.env.DEV && /* @__PURE__ */ jsx("button", { onClick: onAdminLogin, className: "admin-launcher", children: "Admin" }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: `back-to-top ${showBackToTop ? "visible" : ""}`,
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        "aria-label": "Back to top",
        children: /* @__PURE__ */ jsx(ArrowUpRight, { size: 18 })
      }
    ),
    toast && /* @__PURE__ */ jsx(
      "div",
      {
        className: `toast show ${toast.type === "success" ? "toast-success" : "toast-error"}`,
        role: "status",
        "aria-live": "polite",
        children: toast.message
      }
    )
  ] });
}
export {
  SiteLayout
};
