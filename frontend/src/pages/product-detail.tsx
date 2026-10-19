/**
 * pages/product-detail.tsx — Individual product detail page.
 *
 * Fetches a single product by slug and displays:
 * - Breadcrumb navigation (Home → Products → Product Name)
 * - Product image with WebP srcSet and placeholder fallback
 * - Category badge, product name, description
 * - "Request a Quote" and "All products" action buttons
 * - Contact information for specifications
 *
 * SEO: Sets product-specific metadata and injects BreadcrumbList +
 * Product structured data.
 *
 * States: loading (fetching), ok (found), missing (not found).
 * Uses useEffect with cleanup flag to prevent state updates after unmount.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, ArrowRight, Archive } from "lucide-react";
import { api } from "@/lib/api";
import { useSeo, useJsonLd, absoluteUrl } from "@/lib/seo";
import { breadcrumbs, productSchema } from "@/lib/structured-data";
import { asset, srcSet } from "@/lib/types";
import type { Product } from "@/lib/types";

export function ProductDetailPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    // Fetch product by slug; cleanup flag prevents state update after unmount
    let alive = true;
    setStatus("loading");
    api
      .getProduct(slug)
      .then((p) => {
        if (!alive) return;
        setProduct(p);
        setStatus("ok");
      })
      .catch(() => alive && setStatus("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);

  const title = product
    ? `${product.name} | ERGO Contracts Philippines`
    : "Product | ERGO Contracts Philippines";
  const description =
    product?.shortDescription ||
    product?.description ||
    "ERGO Contracts Philippines product range.";

  useSeo({
    // SEO: product-specific title, description, image
    title,
    description,
    path: `/products/${slug}`,
    image: product?.imageUrl ?? undefined,
    type: "article",
  });

  useJsonLd(
    // Structured data: BreadcrumbList + Product schema
    "breadcrumbs",
    breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Products", path: "/products" },
      { name: product?.name ?? slug, path: `/products/${slug}` },
    ]),
  );

  useJsonLd(
    "product",
    product
      ? productSchema({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          imageUrl: product.imageUrl,
          categoryName: product.category?.name ?? null,
        })
      : {},
  );

  if (status === "loading") {
    return (
      <section className="section">
        <div className="container">
          <p className="loading-note">Loading product…</p>
        </div>
      </section>
    );
  }

  if (status === "missing" || !product) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="section-heading">Product not found</h1>
          <p className="section-intro">
            We couldn’t find that product. Browse the full range instead.
          </p>
          <Link className="button-primary" href="/products">
            View all products <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    );
  }

  const photo = product.imageUrl ? product.imageUrl.split("/").pop()! : null;
  // Extract filename from image URL for WebP srcSet generation

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <Link href="/products">Products</Link>
          <ChevronRight size={13} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="product-detail">
          <div className="product-detail-media">
            {photo ? (
              <picture>
                <source
                  srcSet={srcSet(photo)}
                  type="image/webp"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
                <img
                  src={asset(photo)}
                  alt={`${product.name} by ERGO Contracts Philippines`}
                  width={800}
                  height={600}
                  decoding="async"
                />
              </picture>
            ) : (
              <div className="product-photo-placeholder">
                <div className="product-placeholder-content">
                  <Archive size={38} strokeWidth={1.5} />
                  <span>{product.name}</span>
                </div>
              </div>
            )}
          </div>

          <div className="product-detail-body">
            {product.category && <span className="product-badge">{product.category.name}</span>}
            <h1 className="section-heading">{product.name}</h1>
            <p className="product-detail-desc">{product.description || product.shortDescription}</p>
            <div className="hero-actions">
              <Link className="button-primary" href="/contact">
                Request a Quote <ArrowRight size={15} />
              </Link>
              <Link className="button-secondary" href="/products">
                All products
              </Link>
            </div>
            <p className="product-detail-note">
              Need specifications, finishes or dimensions?{" "}
              <a
                href={`mailto:sales_ergo@ergo.com.ph?subject=${encodeURIComponent(`Specification request: ${product.name}`)}`}
              >
                Email us
              </a>{" "}
              or call +63 2 8843 1177.
            </p>
            <link rel="canonical" href={absoluteUrl(`/products/${product.slug}`)} />
          </div>
        </div>
      </div>
    </section>
  );
}
