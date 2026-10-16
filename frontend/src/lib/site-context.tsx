/**
 * lib/site-context.tsx — Site-wide state management via React Context.
 *
 * SiteProvider wraps the entire public site and provides:
 * - Data fetching: loads categories, products, industries, solutions, resources
 * - Search & filter state: searchQuery, selectedCategory, filteredProducts
 * - Form handling: contact form submission with status feedback
 * - Toast notifications: success/error messages with auto-dismiss
 * - Navigation helpers: scrollToContact, filterCategory
 *
 * Data loading strategy:
 * - Critical data (categories, products) loaded immediately on mount
 * - Secondary data (industries, solutions, resources) loaded after 500ms delay
 *   to prioritize above-the-fold content
 *
 * Usage: const { products, filteredProducts, handleSubmit } = useSite();
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type FormEvent,
  type ReactNode,
} from "react";
import { api } from "@/lib/api";
import type { Category, Product, Industry, Solution, Resource } from "@/lib/types";

export interface Toast {
  message: string;
  type: "success" | "error";
}

export interface SiteState {
  categories: Category[];
  products: Product[];
  industries: Industry[];
  solutions: Solution[];
  resources: Resource[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  filteredProducts: Product[];
  formStatus: string;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  toast: Toast | null;
  showToast: (t: Toast) => void;
  filterCategory: (slug: string | null) => void;
  scrollToContact: () => void;
}

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [formStatus, setFormStatus] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    // Critical data — loaded immediately
    Promise.all([
      // Critical path: categories + products loaded in parallel for immediate render
      api.getCategories(),
      api.getProducts({ status: "active", limit: 100 }),
    ])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Secondary data — loaded after a delay
    const secondaryTimer = setTimeout(() => {
      // Secondary data delayed 500ms to avoid blocking critical rendering
      Promise.all([api.getIndustries(), api.getSolutions(), api.getResources()])
        .then(([inds, sols, res]) => {
          setIndustries(inds);
          setSolutions(sols);
          setResources(res);
        })
        .catch(() => {});
    }, 500);

    return () => clearTimeout(secondaryTimer);
  }, []);

  useEffect(() => {
    // Auto-dismiss toast after 4 seconds
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(
    // Memoized filter: products filtered by search query AND selected category
    () =>
      products.filter((p) => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(q) ||
          (p.category?.name ?? "").toLowerCase().includes(q) ||
          (p.shortDescription ?? "").toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q);
        const matchesCategory = !selectedCategory || p.category?.slug === selectedCategory;
        return matchesSearch && matchesCategory;
      }),
    [products, searchQuery, selectedCategory],
  );

  const showToast = useCallback((t: Toast) => setToast(t), []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    // Form submission: creates inquiry via API, shows toast + status message
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.createInquiry({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        company: String(data.get("company") || ""),
        phone: String(data.get("phone") || ""),
        message: String(data.get("message") || ""),
        source: "website",
      });
      setFormStatus("Thank you! Your inquiry has been submitted. We will get back to you soon.");
      setToast({ message: "Inquiry submitted successfully!", type: "success" });
      (event.target as HTMLFormElement).reset();
    } catch {
      setFormStatus("Failed to submit. Please try again.");
      setToast({ message: "Failed to submit. Please try again.", type: "error" });
    }
  }, []);

  const filterCategory = useCallback((slug: string | null) => {
    setSelectedCategory(slug);
  }, []);

  const scrollToContact = useCallback(() => {
    // Smooth scroll to contact section
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const value: SiteState = {
    categories,
    products,
    industries,
    solutions,
    resources,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    formStatus,
    handleSubmit,
    toast,
    showToast,
    filterCategory,
    scrollToContact,
  };

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteState {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within a SiteProvider");
  return ctx;
}
