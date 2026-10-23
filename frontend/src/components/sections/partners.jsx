import { jsx, jsxs } from "react/jsx-runtime";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { webpLogo } from "@/lib/types";
import { motion } from "framer-motion";
import { KineticHeading } from "@/components/fx";
const partners = [
  { name: "BDO", logo: "BDO.png" },
  { name: "UnionBank", logo: "UNIONBANK.png" },
  { name: "RCBC", logo: "RCBC.png" },
  { name: "Veterans Bank", logo: "veterans bank.png" },
  { name: "Coca-Cola", logo: "coca cola.png" },
  { name: "Honda", logo: "honda.png" },
  { name: "Emerson", logo: "emerson.png" },
  { name: "JGC", logo: "JGC.png" },
  { name: "CDO", logo: "CDO.png" },
  { name: "FEU", logo: "FEU.png" },
  { name: "UST", logo: "UST.png" },
  { name: "TIP", logo: "Technological Institute of the Philippines.png" },
  { name: "Areneta", logo: "araneta.png" },
  { name: "Analog", logo: "analog.png" },
  { name: "Five Star", logo: "fivestar.png" },
  { name: "Bloomberry", logo: "bloomberry.png" },
  { name: "Don Mariano", logo: "Don Mariano.png" },
  { name: "Suysing", logo: "suysing.png" },
  { name: "Ulticare", logo: "ulticare.png" },
  { name: "Table Group", logo: "table group.png" },
  { name: "House of Investments", logo: "house of investments.png" },
  { name: "House of Representatives", logo: "house of representatives.png" },
  { name: "BFAR", logo: "BFAR Bureau of Fisheries and Aquatic Resources.png" },
  { name: "Lalawigan ng Cavite", logo: "lalawigan ng cavite.png" },
  { name: "Sagisag ng Pampanga", logo: "sagisag ning pampanga.png" },
  { name: "Amicassa", logo: "amicassa.png" },
  { name: "Bareka", logo: "bareka.png" },
  { name: "Allsectech", logo: "allsectech.png" },
  { name: "OSAVE", logo: "OSAVE.png" },
  { name: "Bernhard Schulte", logo: "Bernhard Schulte Shipmanagement.png" }
];
function LogoRow({ logos, reverse = false }) {
  const doubled = [...logos, ...logos];
  return /* @__PURE__ */ jsx("div", { className: "partners-marquee-row", children: /* @__PURE__ */ jsx(
    motion.div,
    {
      className: "partners-marquee-track",
      animate: { x: reverse ? ["0%", "50%"] : ["50%", "0%"] },
      transition: { duration: 40, ease: "linear", repeat: Infinity },
      children: doubled.map((p, i) => /* @__PURE__ */ jsx("div", { className: "partner-marquee-card", title: p.name, children: /* @__PURE__ */ jsxs("picture", { children: [
        /* @__PURE__ */ jsx("source", { srcSet: webpLogo(p.logo), type: "image/webp", sizes: "128px" }),
        /* @__PURE__ */ jsx(
          "img",
          {
            src: `/images/partners/${p.logo}`,
            alt: `${p.name} logo`,
            loading: "eager",
            decoding: "async"
          }
        )
      ] }) }, `${p.name}-${i}`))
    }
  ) });
}
function PartnersSection() {
  const mid = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, mid);
  const row2 = partners.slice(mid);
  return /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsxs("section", { className: "section section--sm", id: "partners", children: [
    /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "section-head", children: [
      /* @__PURE__ */ jsx("span", { className: "section-label", children: "Partners" }),
      /* @__PURE__ */ jsx(
        KineticHeading,
        {
          as: "h2",
          className: "section-heading section-heading--md",
          text: "Our partners and clients."
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "section-intro", children: "From banks and universities to government agencies and global brands \u2014 the Philippines\u2019 most trusted institutions choose ERGO." })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "partners-marquee", children: [
      /* @__PURE__ */ jsx(LogoRow, { logos: row1 }),
      /* @__PURE__ */ jsx(LogoRow, { logos: row2, reverse: true })
    ] })
  ] }) });
}
export {
  PartnersSection
};
