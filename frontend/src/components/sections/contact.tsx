/**
 * components/sections/contact.tsx — Contact form and information section.
 *
 * Two-column layout with contact details and inquiry form:
 * - Left column: phone, email, office (with Google Maps directions link),
 *   Facebook, business hours, response time
 * - Right column: inquiry form (name, email, company, phone, message)
 *   with submit handling via site context
 * - Below: embedded Google Maps iframe showing office location
 *
 * Form submission:
 * - Uses handleSubmit from useSite() context
 * - Creates inquiry via API with source: "website"
 * - Shows success/error toast and inline status message
 * - Resets form on successful submission
 */
import { useSite } from "@/lib/site-context";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { ArrowUpRight, Clock, Globe, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";

export function ContactSection() {
  const { handleSubmit, formStatus } = useSite();
  return (
    <ScrollReveal>
      <section className="section" id="contact">
        <div className="container contact-grid">
          <div>
            <span className="section-label">Contact</span>
            <h2 className="section-heading">Request a Consultation</h2>
            <p className="section-intro">Tell us about your space and requirements.</p>
            <div className="contact-details">
              <div className="contact-detail">
                <div className="icon-tile">
                  <Phone size={19} />
                </div>
                <div>
                  <small>Phone</small>
                  <p>+63 2 8843 1177 &nbsp;|&nbsp; 0939 264 3566</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="icon-tile">
                  <Mail size={19} />
                </div>
                <div>
                  <small>Email</small>
                  <p>sales_ergo@ergo.com.ph</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="icon-tile">
                  <MapPin size={19} />
                </div>
                <div>
                  <small>Office</small>
                  <p>2634 Rockefeller St. Brgy. San Isidro, Makati City, 1200 Philippines</p>
                  <a
                    className="directions-link"
                    href="https://www.google.com/maps/dir/?api=1&destination=2634+Rockefeller+Street,+San+Isidro,+Makati+City,+Philippines"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get directions <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
              <div className="contact-detail">
                <div className="icon-tile">
                  <Globe size={19} />
                </div>
                <div>
                  <small>Facebook</small>
                  <p>
                    <a
                      href="https://www.facebook.com/profile.php?id=61595001456946"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit" }}
                    >
                      ERGO Contracts Philippines
                    </a>
                  </p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="icon-tile">
                  <Clock size={19} />
                </div>
                <div>
                  <small>Business Hours</small>
                  <p>Mon – Fri, 8:00 AM – 6:00 PM</p>
                </div>
              </div>
              <div className="contact-detail">
                <div className="icon-tile">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <small>Response Time</small>
                  <p>We respond within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            {/* Form submission handled by site context (api.createInquiry) */}
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="consult-name">Full name *</label>
                <input id="consult-name" name="name" required placeholder="Juan Dela Cruz" />
              </div>
              <div className="form-field">
                <label htmlFor="consult-email">Email *</label>
                <input
                  id="consult-email"
                  name="email"
                  type="email"
                  required
                  placeholder="juan@company.com"
                />
              </div>
              <div className="form-field">
                <label htmlFor="consult-company">Company</label>
                <input id="consult-company" name="company" placeholder="Company name" />
              </div>
              <div className="form-field">
                <label htmlFor="consult-phone">Phone</label>
                <input id="consult-phone" name="phone" type="tel" placeholder="+63 ..." />
              </div>
            </div>
            <div className="form-field message-field">
              <label htmlFor="consult-message">Message *</label>
              <textarea
                id="consult-message"
                name="message"
                required
                rows={4}
                placeholder="Tell us about your project..."
              />
            </div>
            <button type="submit" className="button-primary submit-button">
              Send Request <Send size={15} />
            </button>
            {formStatus && <p className="form-status">{formStatus}</p>}
          </form>
          <div className="contact-map">
            {/* Google Maps embed: lazy-loaded iframe showing office location */}
            <iframe
              title="ERGO Contracts Philippines office location map"
              src="https://www.google.com/maps?q=2634%20Rockefeller%20Street%2C%20San%20Isidro%2C%20Makati%20City%2C%20Philippines&z=17&output=embed"
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
