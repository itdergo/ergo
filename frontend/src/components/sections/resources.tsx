/**
 * components/sections/resources.tsx — Resources and catalogues section.
 *
 * Displays downloadable resources in a 4-column grid with:
 * - File type icon (ShieldCheck for warranty, FileText for others)
 * - Title, description, and download link
 * - "Download" or "View page" label based on file type
 * - Scroll-triggered entrance animations
 *
 * Data: resources array from useSite() context (loaded from API)
 * Links open in new tab with rel="noopener noreferrer"
 */
import { useSite } from "@/lib/site-context";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowRight, FileText, ShieldCheck } from "lucide-react";

export function ResourcesSection() {
  const { resources } = useSite();
  return (
    <ScrollReveal>
      <section className="section section-muted" id="resources">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Resources & Catalog</span>
            <h2 className="section-heading">Brochures & specifications.</h2>
            <p className="section-intro">Download our catalogues and product specifications.</p>
          </div>
          <div className="resource-grid">
            {resources.map((r, i) => (
              <motion.a
                className="resource-card"
                href={r.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="icon-tile">
                  {r.fileType === "warranty" ? <ShieldCheck size={21} /> : <FileText size={21} />}
                  {/* File type icon: ShieldCheck for warranty docs, FileText for others */}
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <p className="card-description">{r.description}</p>
                  <span className="download-label">
                    {r.fileType === "warranty" ? "View page" : "Download"}
                    {r.fileType === "warranty" ? (
                      <ArrowRight size={13} />
                    ) : (
                      <ArrowDownToLine size={13} />
                    )}
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
