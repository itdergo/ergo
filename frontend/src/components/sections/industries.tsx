/**
 * components/sections/industries.tsx — Industries grid section.
 *
 * Renders industry cards in a 4-column grid. Each card displays:
 * - Industry image (from industryImages mapping) or icon fallback
 * - Industry name
 *
 * The component handles missing images gracefully by showing the industry
 * icon in a styled container instead. All cards maintain consistent 4:3
 * aspect ratio for visual alignment.
 *
 * Data: industries array from useSite() context
 * Images: industryImages mapping from lib/image-maps.ts
 */
import { asset, srcSet } from "@/lib/types";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { getIcon } from "@/lib/image-maps";
import { industryImages } from "@/lib/image-maps";
import { useSite } from "@/lib/site-context";

/**
 * Industries section. The industries are seeded and their images ship in
 * public/images — this renders them.
 *
 * Every card keeps the same media box (4:3) whether it holds a photo or the
 * icon fallback, so `object-fit: cover` crops all photos identically and the
 * labels align regardless of how long the name is.
 */
export function IndustriesSection() {
  const { industries } = useSite();

  if (industries.length === 0) return null;
  // Early return: hide section if no industries loaded

  return (
    <ScrollReveal>
      <section className="section" id="industries">
        <div className="container">
          <div className="section-head">
            <span className="section-label">Industries</span>
            <h2 className="section-heading">Built for the spaces you run.</h2>
            <p className="section-intro">
              ERGO furnishes the environments where people learn, work, gather and recover — across
              the Philippines and Southeast Asia.
            </p>
          </div>
          <div className="industry-grid">
            {industries.map((ind) => {
              const photo = industryImages[ind.name];
              // Look up image by industry name; fallback to icon if not found
              return (
                <div className="industry-card" key={ind.id}>
                  <div className="industry-image">
                    {photo ? (
                      <picture>
                        <source
                          srcSet={srcSet(photo)}
                          type="image/webp"
                          sizes="(max-width: 1023px) 50vw, 25vw"
                        />
                        <img
                          src={asset(photo)}
                          alt={`${ind.name} furniture installations by ERGO Contracts Philippines`}
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={300}
                        />
                      </picture>
                    ) : (
                      <div className="industry-icon">{getIcon(ind.icon, 20)}</div>
                    )}
                  </div>
                  <span>{ind.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
