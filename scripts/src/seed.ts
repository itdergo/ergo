/**
 * Database seed script for ERGO Contracts Web.
 *
 * Populates the database with initial data: an admin user, product categories,
 * sample products, industries, solutions, and downloadable resources.
 * Uses scrypt for password hashing (format-compatible with backend auth).
 * All inserts use `onConflictDoNothing()` so the script is idempotent.
 *
 * Environment variables:
 *   ADMIN_EMAIL    — admin email (default: admin@ergo.com.ph)
 *   ADMIN_PASSWORD — admin password (auto-generated if not set)
 *
 * Usage: npm run seed
 */
import { db, users, categories, products, industries, solutions, resources } from "@ergo/database";
import { scrypt, randomBytes, type ScryptOptions } from "node:crypto";

/**
 * Password hashing — MUST stay format-compatible with backend/src/lib/auth.ts.
 * Format: scrypt$N$r$p$<salt-b64>$<hash-b64>
 */
const SCRYPT_PARAMS: ScryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

// Promisify the callback-based scrypt function for use in async/await flow
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  opts: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, opts, (err, derived) =>
      err ? reject(err) : resolve(derived as Buffer),
    );
  });
}

/**
 * Hash a password with scrypt and return the formatted hash string.
 * Format: scrypt$N$r$p$<salt-b64>$<hash-b64>
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, 64, SCRYPT_PARAMS);
  const { N, r, p } = SCRYPT_PARAMS;
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${derived.toString("base64")}`;
}

/**
 * Main seed function — creates admin user, categories, products, industries,
 * solutions, and resources. Exits with code 0 on success, 1 on failure.
 */
async function seed() {
  console.log("Seeding database...");

  // Admin credentials: use env vars or generate a random password
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ergo.com.ph";
  const generatedPassword = randomBytes(12).toString("base64url");
  const adminPassword = process.env.ADMIN_PASSWORD || generatedPassword;

  // Insert admin user — skip if email already exists (idempotent)
  await db
    .insert(users)
    .values({
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      name: "Admin User",
      role: "admin",
    })
    .onConflictDoNothing();

  if (process.env.ADMIN_PASSWORD) {
    console.log(`  Admin user created: ${adminEmail} (password from ADMIN_PASSWORD)`);
  } else {
    console.log(`  Admin user created: ${adminEmail}`);
    console.log(
      `  GENERATED ADMIN PASSWORD — store it now, it will not be shown again: ${generatedPassword}`,
    );
  }

  // Insert product categories — onConflictDoNothing makes this safe to re-run
  const cats = await db
    .insert(categories)
    .values([
      {
        name: "Seating",
        slug: "seating",
        description:
          "Executive, staff, public, sofas, barstools and leisure chairs engineered for comfort.",
        orderIndex: 1,
      },
      {
        name: "Desking & Tables",
        slug: "desking-tables",
        description:
          "Conference, executive, and freestanding tables built for collaboration and focus.",
        orderIndex: 2,
      },
      {
        name: "Systems Furniture",
        slug: "systems-furniture",
        description:
          "Modular workstation systems — ES 32, 50, 60, 80 — adaptable to any workspace.",
        orderIndex: 3,
      },
      {
        name: "Filing & Storage",
        slug: "filing-storage",
        description:
          "Compactors, mobile peds, and filing laterals that maximize every square meter.",
        orderIndex: 4,
      },
      {
        name: "Commercial & Institutional",
        slug: "commercial-institutional",
        description: "Arena, stadium, cinema, and public seating for high-traffic environments.",
        orderIndex: 5,
      },
      {
        name: "Residential & Home Office",
        slug: "residential-home-office",
        description: "Kitchen systems and space-saving furniture designed for modern living.",
        orderIndex: 6,
      },
    ])
    .onConflictDoNothing()
    .returning();
  console.log(`  ${cats.length} categories created`);

  // Insert sample products linked to categories by index
  await db
    .insert(products)
    .values([
      {
        name: "Executive Chair",
        slug: "executive-chair",
        imageUrl: "/images/product-executive-chair.jpg",
        categoryId: cats[0]?.id,
        shortDescription: "Premium executive seating with lumbar support",
        description:
          "High-back executive chair with premium upholstery, adjustable armrests, and synchronized tilt mechanism.",
        status: "active",
        orderIndex: 1,
        isFeatured: true,
      },
      {
        name: "Conference Table 12ft",
        slug: "conference-table-12ft",
        imageUrl: "/images/product-conference-setup.jpg",
        categoryId: cats[1]?.id,
        shortDescription: "12-foot conference table for 12-14 people",
        description:
          "Solid wood conference table with integrated cable management and power modules.",
        status: "active",
        orderIndex: 2,
        isFeatured: true,
      },
      {
        name: "ES 32 Workstation",
        slug: "es-32-workstation",
        imageUrl: "/images/product-systems.jpg",
        categoryId: cats[2]?.id,
        shortDescription: "Modular workstation system ES 32",
        description:
          "Flexible modular workstation with 32mm panel system, available in multiple configurations.",
        status: "active",
        orderIndex: 3,
      },
      {
        name: "Mobile Pedestal",
        slug: "mobile-pedestal",
        imageUrl: "/images/product-mobile-pedestal.jpg",
        categoryId: cats[3]?.id,
        shortDescription: "3-drawer mobile pedestal with lock",
        description: "Steel mobile pedestal with 3 drawers, lock, and casters for easy mobility.",
        status: "active",
        orderIndex: 4,
      },
      {
        name: "Arena Seating A200",
        slug: "arena-seating-a200",
        imageUrl: "/images/product-group-seating.jpg",
        categoryId: cats[4]?.id,
        shortDescription: "Fixed arena seat with fold-down mechanism",
        description: "Heavy-duty arena seating with fold-down seat, cup holder, and row numbering.",
        status: "active",
        orderIndex: 5,
        isFeatured: true,
      },
      {
        name: "Kitchen System K100",
        slug: "kitchen-system-k100",
        imageUrl: "/images/product-kitchen-system.jpg",
        categoryId: cats[5]?.id,
        shortDescription: "Complete kitchen system for modern homes",
        description:
          "Modular kitchen system with soft-close hinges, pull-out organizers, and quartz countertop options.",
        status: "active",
        orderIndex: 6,
      },
    ])
    .onConflictDoNothing();
  console.log("  6 products created");

  // Insert industry verticals served by ERGO
  await db
    .insert(industries)
    .values([
      { name: "Academe", slug: "academe", icon: "GraduationCap", orderIndex: 1 },
      { name: "Arenas & Stadiums", slug: "arenas-stadiums", icon: "Building2", orderIndex: 2 },
      { name: "Banks & Finance", slug: "banks-finance", icon: "Landmark", orderIndex: 3 },
      { name: "BPO & Technology", slug: "bpo-technology", icon: "Monitor", orderIndex: 4 },
      { name: "Cinemas", slug: "cinemas", icon: "Film", orderIndex: 5 },
      { name: "Corporate Offices", slug: "corporate-offices", icon: "Briefcase", orderIndex: 6 },
      { name: "Government", slug: "government", icon: "Building2", orderIndex: 7 },
      { name: "Semiconductor", slug: "semiconductor", icon: "Factory", orderIndex: 8 },
    ])
    .onConflictDoNothing();
  console.log("  8 industries created");

  // Insert service solutions offered
  await db
    .insert(solutions)
    .values([
      {
        title: "Space Planning & Design",
        description:
          "We help you plan layouts, select products, and visualize functional spaces before a single piece is delivered.",
        icon: "PencilRuler",
        orderIndex: 1,
      },
      {
        title: "Project Management",
        description:
          "End-to-end coordination — from specification and procurement to scheduling — keeping complex fit-outs on track.",
        icon: "ClipboardList",
        orderIndex: 2,
      },
      {
        title: "Delivery & Installation",
        description:
          "Professional delivery and on-site installation by trained crews, with minimal disruption to your operations.",
        icon: "Truck",
        orderIndex: 3,
      },
      {
        title: "After-Sales Support",
        description:
          "Ongoing maintenance, parts, and warranty support to keep your furniture performing for years.",
        icon: "ShieldCheck",
        orderIndex: 4,
      },
    ])
    .onConflictDoNothing();
  console.log("  4 solutions created");

  // Insert downloadable resources (catalogues, warranty docs)
  await db
    .insert(resources)
    .values([
      {
        title: "General Catalogue",
        description: "The full ERGO product range across seating, desking, systems, and storage.",
        fileUrl: "https://ergo.com.ph/General%20Catalogue.pdf",
        fileType: "pdf",
        orderIndex: 1,
      },
      {
        title: "Theater & Stadium Catalogue",
        description: "Seating solutions for arenas, stadiums, and cinemas.",
        fileUrl: "https://ergo.com.ph/Theater-Stadium.pdf",
        fileType: "pdf",
        orderIndex: 2,
      },
      {
        title: "Aluminum Collection",
        description: "Aluminum-framed seating and furniture collection.",
        fileUrl: "https://ergo.com.ph/Aluminum%20Collection.pdf",
        fileType: "pdf",
        orderIndex: 3,
      },
      {
        title: "Beta 2 Series",
        description: "The Beta 2 seating series specifications.",
        fileUrl: "https://ergo.com.ph/Beta%202.pdf",
        fileType: "pdf",
        orderIndex: 4,
      },
      {
        title: "Kappa 3 Series",
        description: "The Kappa 3 seating series specifications.",
        fileUrl: "https://ergo.com.ph/Kappa%203.pdf",
        fileType: "pdf",
        orderIndex: 5,
      },
      {
        title: "Product Warranty",
        description: "ERGO product warranty terms and coverage.",
        fileUrl: "https://ergo.com.ph/warranty.html",
        fileType: "warranty",
        orderIndex: 6,
      },
    ])
    .onConflictDoNothing();
  console.log("  6 resources created");

  console.log("\nSeed complete!");
  process.exit(0);
}

// Execute seed and handle any unhandled errors
seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
