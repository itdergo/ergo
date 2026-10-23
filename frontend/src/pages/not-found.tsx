/**
 * pages/not-found.tsx — 404 Not Found page.
 *
 * Displayed when no route matches. Shows:
 * - "404" label
 * - "Page not found" heading
 * - Navigation links to products and contact pages
 *
 * SEO: Sets 404-specific title and description.
 */
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useSeo } from "@/lib/seo";

export function NotFoundPage() {
  useSeo({
    title: "Page not found | ERGO Contracts Philippines",
    description: "The page you were looking for could not be found.",
    path: "/404",
  });

  return (
    <section className="section">
      <div className="container">
        <span className="section-label">404</span>
        <h1 className="section-heading">Page not found</h1>
        <p className="section-intro">
          That page doesn’t exist or has moved. Try the product range or get in touch.
        </p>
        <div className="hero-actions">
          <Link className="button-primary" href="/products">
            Browse products <ArrowRight size={15} />
          </Link>
          <Link className="button-secondary" href="/contact">
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
