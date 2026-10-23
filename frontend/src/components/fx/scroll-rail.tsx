/**
 * components/fx/scroll-rail.tsx — Section progress rail.
 *
 * A fixed right-hand rail of dots, one per landing chapter. The active dot is
 * driven by scroll position (not IntersectionObserver, which never fires for
 * chapters shorter than the rootMargin band) and each dot carries a condensed
 * label on hover.
 *
 * Desktop-only: at <=1023px the rail would sit on top of the content, so it is
 * hidden rather than squeezed. Under `prefers-reduced-motion` it does not mount.
 */
import { useEffect, useState } from "react";
import { useFxEnabled } from "./hooks";

const SECTIONS = [
  { id: "home", label: "Intro" },
  { id: "about", label: "About" },
  { id: "products", label: "Products" },
  { id: "solutions", label: "Solutions" },
  { id: "industries", label: "Industries" },
  { id: "projects", label: "Projects" },
  { id: "testimonials", label: "Clients" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
];

export function ScrollRail() {
  const enabled = useFxEnabled();
  const [active, setActive] = useState(SECTIONS[0].id);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const update = () => {
      const probe = window.scrollY + window.innerHeight * 0.4;
      let current = SECTIONS[0].id;
      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= probe) current = section.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <nav className="scroll-rail" aria-label="Section progress">
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={`scroll-rail-dot${active === section.id ? " active" : ""}`}
          data-label={section.label}
          aria-label={`Jump to ${section.label}`}
          aria-current={active === section.id ? "true" : undefined}
        />
      ))}
    </nav>
  );
}
