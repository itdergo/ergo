/**
 * components/sections/products.tsx — Product grid section with search and filtering.
 *
 * Features:
 * - Search input: filters products by name, category, description (real-time)
 * - Category filter buttons: filter by product category
 * - Product grid: responsive 3-column grid of TiltCard-wrapped product cards
 * - Each card: photo with zoom lightbox, category badge, wishlist button,
 *   title, description, "View Details" and "Request Quote" links
 * - Lightbox: full-screen image viewer with Escape/click-to-close
 * - Empty state: "No products found" message when filters match nothing
 *
 * Data flow:
 * - Receives products, categories, searchQuery, selectedCategory from useSite()
 * - filteredProducts is memoized in context (search + category filtering)
 * - Card click navigates to contact section (unless clicking a link/button)
 *
 * Uses: TiltCard (3D hover effect), Lightbox, ScrollReveal, Framer Motion
 */
import { useState } from "react";
import { useSite } from "@/lib/site-context";
import { srcSet } from "@/lib/types";
import { TiltCard, ScrollReveal } from "@/lib/site-ui-primitives";
import { Archive, ArrowRight, ArrowUpRight, Heart, Search, Maximize2 } from "lucide-react";
import { Lightbox } from "@/components/ui/lightbox";

export function ProductsSection() {
  const {
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    scrollToContact,
  } = useSite();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  // Lightbox state: stores image src + alt for full-screen viewer
  const [lightboxAlt, setLightboxAlt] = useState("");

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
            <h2 className="section-heading">A complete furniture ecosystem.</h2>
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
                // TiltCard wraps each product card for 3D hover effect
                key={p.id}
                className="product-card"
                maxTilt={6}
                onClick={(e) => {
                  // Card click: navigate to contact (unless clicking interactive elements)
                  if ((e.target as HTMLElement).closest("a,button")) return;
                  scrollToContact();
                }}
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
                  <button className="product-wishlist" aria-label="Add to wishlist">
                    {/* Wishlist button: decorative (no backend integration) */}
                    <Heart size={16} />
                  </button>
                </div>
                <div className="product-text">
                  <div className="card-title-row">
                    <h3 className="card-title">{p.name}</h3>
                    <ArrowUpRight className="arrow-icon" size={17} />
                  </div>
                  <p className="card-description">{p.shortDescription || p.description}</p>
                  <div className="product-actions">
                    <a href={`/products/${p.slug}`} className="product-cta">
                      View Details <ArrowRight size={13} />
                    </a>
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
        </div>
      </section>
      <Lightbox src={lightboxSrc} alt={lightboxAlt} onClose={closeLightbox} />
    </ScrollReveal>
  );
}
