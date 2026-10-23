/**
 * components/sections/faq.tsx — Frequently asked questions section.
 *
 * Renders categorized FAQ items in a 3-column grid with:
 * - 3 categories: Products, Services, Process
 * - Each category has 4 Q&A pairs
 * - Accordion behavior: click to expand/collapse individual answers
 * - "Expand all / Collapse all" toggle button
 * - Animated height transitions for smooth expand/collapse
 * - Question numbers, icons, and chevron indicators
 *
 * State management:
 * - openKey: tracks which single item is open (format: "categoryIndex-itemIndex")
 * - allOpen: when true, all items are expanded regardless of openKey
 *
 * FAQ data is hardcoded in the faqCategories constant.
 */
import { motion } from "framer-motion";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { Layers, ClipboardCheck, Settings, Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqCategories = [
  // Static FAQ data: 3 categories with 4 Q&As each
  {
    title: "Products",
    icon: Layers,
    faqs: [
      {
        q: "What ergonomic features do your chairs include?",
        a: "Our seating lines include adjustable seat height, lumbar support, synchro-tilt mechanisms, breathable mesh backs, and adjustable armrests. Executive models add headrests, depth-adjustable seats, and polished aluminum bases. Every chair is designed to support natural movement throughout the workday.",
      },
      {
        q: "Can I customize colors, fabrics, and configurations?",
        a: "Yes. We offer extensive customization across all product lines — fabric and leather options, frame finishes, and configuration choices for systems furniture. Our team will guide you through available options during the consultation to match your brand and interior design.",
      },
      {
        q: "What is the difference between your seating lines?",
        a: "We offer four seating tiers: Executive (premium leather, high-back, polished bases), Managerial (ergonomic task chairs with advanced adjustability), Staff (durable, all-day comfort for high-use environments), and Public/Institutional (heavy-duty seating for arenas, auditoriums, and waiting areas). Each line is engineered for its specific use case.",
      },
      {
        q: "Are your products BIFMA-certified?",
        a: "Yes. Our seating and systems furniture are engineered to meet or exceed BIFMA (Business and Institutional Furniture Manufacturers Association) standards for safety, durability, and structural integrity. This ensures long-term performance in commercial environments.",
      },
    ],
  },
  {
    title: "Services",
    icon: ClipboardCheck,
    faqs: [
      {
        q: "Do you provide free space planning?",
        a: "Yes. We offer complimentary space planning for projects with four or more workstations. Our team will assess your floor plan, workflow requirements, and team size, then provide optimized layout recommendations with 3D visualization — all at no cost.",
      },
      {
        q: "Can you work with my architect or interior designer?",
        a: "Absolutely. We regularly collaborate with architects, interior designers, and project managers. We provide detailed specifications, Revit models, finish samples, and technical drawings to support your design process from concept through installation.",
      },
      {
        q: "Do you handle full office fit-outs?",
        a: "Yes. We provide end-to-end workplace solutions — from space planning and furniture specification to delivery, installation, and after-sales support. Our project management team coordinates every stage to keep your fit-out on schedule and on budget.",
      },
      {
        q: "What is your typical project timeline?",
        a: "Standard product orders ship within 2-3 weeks. Full office fit-outs typically run 4-8 weeks depending on project size, customization requirements, and installation complexity. We provide a detailed project schedule during the proposal phase.",
      },
    ],
  },
  {
    title: "Process",
    icon: Settings,
    faqs: [
      {
        q: "How do I get a quote?",
        a: "Request a free consultation through our contact form, email sales_ergo@ergo.com.ph, or call +63 2 8843 1177. We will schedule a site visit or virtual meeting to assess your needs, then provide a detailed proposal within 48 hours.",
      },
      {
        q: "What warranties do you offer?",
        a: "All ERGO products carry comprehensive warranties. Seating: 5-10 years covering structural integrity and manufacturing defects. Systems furniture: 5 years. Institutional seating: 5-7 years. Extended warranty options are available for high-use environments.",
      },
      {
        q: "Do you offer maintenance and after-sales support?",
        a: "Yes. Our after-sales team provides ongoing maintenance, parts replacement, and warranty support. We offer annual maintenance contracts for clients with large installations to keep furniture performing like new for years.",
      },
      {
        q: "Can I visit your showroom?",
        a: "Yes. Our showroom is located at 2634 Rockefeller St. Brgy. San Isidro, Makati City. Visit Monday to Friday, 8:00 AM – 6:00 PM to see our full product range and material samples. We recommend scheduling an appointment for dedicated consultation time.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    icon: ClipboardCheck,
    faqs: [
      {
        q: "Do you deliver outside Metro Manila?",
        a: "Yes, we deliver nationwide across the Philippines. Delivery fees vary by location and order size. For bulk orders or provincial deliveries, we coordinate with trusted logistics partners to ensure safe, on-time arrival. Contact us for a delivery quote to your area.",
      },
      {
        q: "How is furniture shipped and installed?",
        a: "All furniture is professionally packed in protective materials to prevent damage during transit. Our installation team delivers, assembles, and installs every piece at your site. We also remove all packaging materials and position furniture exactly according to your approved layout plan.",
      },
      {
        q: "What if my order arrives damaged?",
        a: "We stand behind the quality of every shipment. If any item arrives damaged, notify us within 48 hours with photos. We will arrange a replacement or repair at no cost to you, and our after-sales team will handle the entire process from claim to resolution.",
      },
      {
        q: "Can I track my order status?",
        a: "Yes. Once your order is confirmed and scheduled, your account manager will provide regular updates on production, shipping, and installation milestones. You can also contact us anytime for real-time order status and delivery scheduling.",
      },
    ],
  },
  {
    title: "Pricing & Payment",
    icon: Layers,
    faqs: [
      {
        q: "Do you offer payment terms or installment plans?",
        a: "Yes. We offer flexible payment terms for corporate and institutional clients, including 30-day, 60-day, and 90-day terms for approved accounts. We also accept major credit cards, bank transfers, and purchase orders. Contact our sales team to discuss options for your organization.",
      },
      {
        q: "Are there volume discounts for bulk orders?",
        a: "Absolutely. We offer tiered pricing based on order volume — the more you order, the lower the per-unit cost. We also offer special pricing for long-term partnerships, repeat clients, and multi-phase projects. Request a custom quote for your specific requirements.",
      },
      {
        q: "Is there a minimum order quantity?",
        a: "For standard products, there is no minimum — we serve single-unit orders to full office fit-outs. Custom or made-to-order items may have minimum quantities depending on the product and materials. Contact us and we will guide you based on your project needs.",
      },
      {
        q: "Do you offer leasing or rental options?",
        a: "Yes, we offer furniture leasing and short-term rental solutions for events, project-based needs, and companies preferring operational expenses over capital expenditure. Rental terms range from daily to multi-year agreements. Contact us for a tailored rental proposal.",
      },
    ],
  },
  {
    title: "General",
    icon: Settings,
    faqs: [
      {
        q: "How long has ERGO been in business?",
        a: "ERGO has been designing and manufacturing workplace furniture since 1986 — over 40 years. We have completed over 500 projects across the Philippines, serving corporate offices, government agencies, educational institutions, and commercial spaces with German-engineered seating and systems furniture.",
      },
      {
        q: "Where are your products manufactured?",
        a: "Our products are manufactured in our facility in the Philippines, using German engineering standards and quality processes. We source high-grade materials including German mechanisms, BIFMA-compliant components, and premium upholstery fabrics. Every product undergoes rigorous quality control before delivery.",
      },
      {
        q: "Do you offer site assessment and consultation?",
        a: "Yes. We provide complimentary site assessments for projects with four or more workstations. Our team will visit your location to measure spaces, assess workflow requirements, and recommend optimal furniture solutions. This service includes a detailed layout plan and product specifications at no cost.",
      },
      {
        q: "How do I contact sales or support?",
        a: "You can reach us through multiple channels: call +63 2 8843 1177, email sales_ergo@ergo.com.ph, or fill out our contact form on the website. Our sales team is available Monday to Friday, 8:00 AM to 6:00 PM. For existing clients, your dedicated account manager is your primary point of contact for support and inquiries.",
      },
    ],
  },
  {
    title: "Custom & Bulk Orders",
    icon: Layers,
    faqs: [
      {
        q: "Can I request a custom furniture design?",
        a: "Yes. Our design and engineering team can develop custom furniture solutions tailored to your specific requirements, dimensions, and aesthetic preferences. Custom projects typically require a minimum order volume and a longer lead time. Contact our sales team to discuss your custom project needs.",
      },
      {
        q: "What is the lead time for custom orders?",
        a: "Standard product orders ship within 2-3 weeks. Custom or made-to-order items typically require 4-8 weeks depending on complexity, materials, and production schedule. We provide a detailed timeline during the proposal phase and keep you informed at every production milestone.",
      },
      {
        q: "Do you provide CAD drawings or technical specifications?",
        a: "Yes. We provide comprehensive technical documentation including CAD drawings, BOM (bill of materials), material specifications, and installation guides. These are essential for architects, interior designers, and contractors who need to coordinate furniture with other building systems.",
      },
      {
        q: "Can you match existing furniture or brand colors?",
        a: "Absolutely. We offer custom color matching and can match specific Pantone, RAL, or brand colors across our upholstery and finish options. Provide us with your color reference, and our team will source matching materials. Custom color runs may have minimum order requirements.",
      },
    ],
  },
];

function FaqItem({
  // FaqItem: individual accordion item with animated height
  q,
  a,
  isOpen,
  onToggle,
  index,
  answerId,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
  /** DOM id of the answer region, referenced by the toggle's aria-controls. */
  answerId: string;
}) {
  return (
    <motion.div
      className={`faq-item ${isOpen ? "open" : ""}`}
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <span className="faq-question-text">
          <span className="faq-number" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          {q}
        </span>
        <motion.span
          className="faq-chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          aria-hidden="true"
        >
          {isOpen ? <Minus size={16} /> : <Plus size={16} />}
        </motion.span>
      </button>
      <motion.div
        className="faq-answer"
        id={answerId}
        role="region"
        aria-label={q}
        aria-live="polite"
        /* A collapsed answer is animated to height 0 and opacity 0, but it
           stays in the accessibility tree. Hide it from assistive tech until
           it is actually open. */
        aria-hidden={!isOpen}
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <p>{a}</p>
      </motion.div>
    </motion.div>
  );
}

export function FaqSection() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [allOpen, setAllOpen] = useState(false);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set([0]));

  const toggleCat = (ci: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(ci)) {
        next.delete(ci);
      } else {
        next.add(ci);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allOpen) {
      setOpenKey(null);
      setAllOpen(false);
    } else {
      setAllOpen(true);
    }
  };

  const totalFaqs = faqCategories.reduce((sum, cat) => sum + cat.faqs.length, 0);

  return (
    <ScrollReveal>
      <section className="section section--sm" id="faq">
        <div className="container">
          <div className="section-head">
            <span className="section-label">FAQ</span>
            <h2 className="section-heading section-heading--md">Expert answers, zero guesswork.</h2>
            <p className="section-intro">
              Everything you need to know about our products, services, and process.
            </p>
          </div>
          <div className="faq-toolbar">
            <span className="faq-count">{totalFaqs} questions</span>
            <button
              type="button"
              className="faq-toggle-all"
              onClick={toggleAll}
              aria-expanded={allOpen}
            >
              {allOpen ? "Collapse all" : "Expand all"}
            </button>
          </div>
          <div className="faq-categories">
            {faqCategories.map((cat, ci) => {
              const Icon = cat.icon;
              const isCatExpanded = allOpen || expandedCats.has(ci);
              return (
                <div className="faq-category" key={cat.title}>
                  {/* The heading wraps the toggle button rather than sitting
                      inside it: <button> may only contain phrasing content, so
                      an <h3> nested in one was invalid HTML and made the
                      heading's role ambiguous for assistive technology. */}
                  <h3 className="faq-category-heading">
                    <button
                      type="button"
                      className="faq-category-head"
                      onClick={() => toggleCat(ci)}
                      aria-expanded={isCatExpanded}
                    >
                      <span className="faq-category-icon">
                        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="faq-category-title">{cat.title}</span>
                      <span className="faq-cat-toggle" aria-hidden="true">
                        {isCatExpanded ? "−" : "+"}
                      </span>
                    </button>
                  </h3>
                  {isCatExpanded && (
                    <div className="faq-list">
                      {cat.faqs.map((faq, fi) => {
                        const key = `${ci}-${fi}`;
                        const isOpen = allOpen || openKey === key;
                        return (
                          <FaqItem
                            key={key}
                            index={fi}
                            q={faq.q}
                            a={faq.a}
                            answerId={`faq-answer-${ci}-${fi}`}
                            isOpen={isOpen}
                            onToggle={() => {
                              if (allOpen) {
                                setAllOpen(false);
                                setOpenKey(key);
                              } else {
                                setOpenKey(openKey === key ? null : key);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
