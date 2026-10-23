/**
 * components/sections/products.tsx — Product grid section with search and filtering.
 *
 * Features:
 * - Search input: filters products by name, category, description (real-time)
 * - Category filter buttons: filter by product category
 * - Product grid: responsive 3-column grid of TiltCard-wrapped product cards
 * - Each card: photo with zoom lightbox, category badge, wishlist button,
 *   linked title, description, "View Details" and "Request Quote" links
 * - Lightbox: full-screen image viewer with Escape/click-to-close
 * - Empty state: "No products found" message when filters match nothing
 *
 * Data flow:
 * - Receives products, categories, searchQuery, selectedCategory from useSite()
 * - filteredProducts is memoized in context (search + category filtering)
 * - Navigation happens through explicit links (title + "View Details"), never
 *   through a whole-card click handler
 *
 * Uses: TiltCard (3D hover effect), Lightbox, ScrollReveal, Framer Motion
 */
import { useState } from "react";
import { Link } from "wouter";
import { useSite } from "@/lib/site-context";
import { srcSet } from "@/lib/types";
import { TiltCard, ScrollReveal } from "@/lib/site-ui-primitives";
import { Archive, ArrowRight, ArrowUpRight, Heart, Search, Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";
import { KineticHeading } from "@/components/fx";

export function ProductsSection() {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    showToast,
  } = useSite();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Lightbox state: stores image src + alt for full-screen viewer
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  // Wishlist: client-side toggle with toast confirmation

  const openLightbox = (src: string, alt: string) => {
    // Open/close lightbox handlers
    setLightboxSrc(src);
    setLightboxAlt(alt);
  };
  const closeLightbox = () => {
    setLightboxSrc(null);
    setLightboxAlt("");
  };
  return (
    <ScrollReveal>
      <section className="section" id="products">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Our Products</span>
            <KineticHeading
              as="h2"
              className="section-heading"
              text="A complete furniture ecosystem."
            />
            <p className="section-intro">
              From a single ergonomic chair to a fully fitted workplace.
            </p>
          </div>
          <div className="product-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                aria-label="Search products"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="category-filters">
              <button
                className={`filter-btn ${!selectedCategory ? "active" : ""}`}
                onClick={() => setSelectedCategory(null)}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  className={`filter-btn ${selectedCategory === c.slug ? "active" : ""}`}
                  onClick={() => setSelectedCategory(c.slug)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <TiltCard
                // TiltCard wraps each product card for a 3D hover effect.
                // The card itself is NOT clickable: navigation is exposed through
                // the product title link and the explicit "View Details" /
                // "Request Quote" actions. A whole-card click handler used to
                // compete with those controls (and was unreachable by keyboard).
                key={p.id}
                className="product-card"
                maxTilt={6}
              >
                <div className={`product-photo${p.imageUrl ? "" : " product-photo-placeholder"}`}>
                  {p.imageUrl ? (
                    <>
                      <picture>
                        <source
                          srcSet={srcSet(p.imageUrl.split("/").pop()!)}
                          type="image/webp"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                        <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" />
                      </picture>
                      <button
                        // Zoom button: opens lightbox with product image
                        className="product-zoom-btn"
                        aria-label={`View ${p.name} photo`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(p.imageUrl!, `${p.name} by ERGO Contracts Philippines`);
                        }}
                      >
                        <Maximize2 size={16} />
                      </button>
                    </>
                  ) : (
                    <div className="product-placeholder-content">
                      <Archive size={38} strokeWidth={1.5} />
                      <span>{p.name}</span>
                    </div>
                  )}
                  {p.category && <span className="product-badge">{p.category.name}</span>}
                  <button
                    className={`product-wishlist ${wishlist.has(p.id) ? "active" : ""}`}
                    aria-label={wishlist.has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={wishlist.has(p.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const next = new Set(wishlist);
                      if (next.has(p.id)) next.delete(p.id);
                      else next.add(p.id);
                      setWishlist(next);
                      showToast({
                        message: next.has(p.id)
                          ? `${p.name} added to your wishlist`
                          : `${p.name} removed from your wishlist`,
                        type: "success",
                      });
                    }}
                  >
                    {/* Wishlist toggle (client-side) */}
                    <Heart size={16} />
                  </button>
                </div>
                <div className="product-text">
                  <div className="card-title-row">
                    <h3 className="card-title">
                      {/* The title is the card's primary link target — it gives
                          keyboard and screen-reader users a way to open the
                          product, which the removed whole-card click did not. */}
                      <Link href={`/products/${p.slug}`} className="card-title-link">
                        {p.name}
                      </Link>
                    </h3>
                    <ArrowUpRight className="arrow-icon" size={17} aria-hidden="true" />
                  </div>
                  <p className="card-description">{p.shortDescription || p.description}</p>
                  <div className="product-actions">
                    <Link href={`/products/${p.slug}`} className="product-cta">
                      View Details <ArrowRight size={13} />
                    </Link>
                    <a href="#contact" className="product-cta product-cta-quote">
                      Request Quote
                    </a>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="products-empty">
              <p>No products match your search.</p>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <a className="text-link section-cta" href="/contact">
            Request a product quote <ArrowRight size={15} />
          </a>
        </div>
      </section>
      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
    </ScrollReveal>
  );
}
