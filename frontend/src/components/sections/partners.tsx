/**
 * components/sections/partners.tsx — Partner logos marquee section.
 *
 * Displays partner/client logos in an infinite scrolling marquee with:
 * - Original logo colors (no grayscale filter)
 * - Smooth Framer Motion infinite scroll animation
 * - Pause on hover for readability
 * - Two rows scrolling in opposite directions for visual interest
 * - Responsive design that adapts to screen size
 *
 * Data: 30 partner logos in public/images/partners/
 */
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { webpLogo } from "@/lib/types";
import { motion } from "framer-motion";

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
  { name: "Bernhard Schulte", logo: "Bernhard Schulte Shipmanagement.png" },
];

function LogoRow({ logos, reverse = false }: { logos: typeof partners; reverse?: boolean }) {
  const doubled = [...logos, ...logos];
  return (
    <div className="partners-marquee-row">
      <motion.div
        className="partners-marquee-track"
        animate={{ x: reverse ? ["0%", "50%"] : ["50%", "0%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((p, i) => (
          <div className="partner-marquee-card" key={`${p.name}-${i}`} title={p.name}>
            <picture>
              {/* WebP first: the source PNGs were 0.5–2.3 MB each, the WebP set is ~19 KB per logo.
                  Eager on purpose — the marquee track is ~10 000px wide, so lazy images never
                  enter the viewport and the cards render blank. */}
              <source srcSet={webpLogo(p.logo)} type="image/webp" sizes="128px" />
              <img
                src={`/images/partners/${p.logo}`}
                alt={`${p.name} logo`}
                loading="eager"
                decoding="async"
              />
            </picture>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function PartnersSection() {
  const mid = Math.ceil(partners.length / 2);
  const row1 = partners.slice(0, mid);
  const row2 = partners.slice(mid);

  return (
    <ScrollReveal>
      <section className="section section-muted" id="partners">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Partners</span>
            <h2 className="section-heading">Our partners and clients.</h2>
            <p className="section-intro">
              From banks and universities to government agencies and global brands — the
              Philippines&rsquo; most trusted institutions choose ERGO.
            </p>
          </div>
        </div>
        <div className="partners-marquee">
          <LogoRow logos={row1} />
          <LogoRow logos={row2} reverse />
        </div>
      </section>
    </ScrollReveal>
  );
}
