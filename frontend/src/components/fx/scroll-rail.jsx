import { jsx } from "react/jsx-runtime";
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
  { id: "contact", label: "Contact" }
];
function ScrollRail() {
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
  return /* @__PURE__ */ jsx("nav", { className: "scroll-rail", "aria-label": "Section progress", children: SECTIONS.map((section) => /* @__PURE__ */ jsx(
    "a",
    {
      href: `#${section.id}`,
      className: `scroll-rail-dot${active === section.id ? " active" : ""}`,
      "data-label": section.label,
      "aria-label": `Jump to ${section.label}`,
      "aria-current": active === section.id ? "true" : void 0
    },
    section.id
  )) });
}
export {
  ScrollRail
};
