import { jsx } from "react/jsx-runtime";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from "react";
import { api } from "@/lib/api";
const SiteContext = createContext(null);
function SiteProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formStatus, setFormStatus] = useState("");
  const [toast, setToast] = useState(null);
  useEffect(() => {
    Promise.all([
      // Critical path: categories + products loaded in parallel for immediate render
      api.getCategories(),
      api.getProducts({ status: "active", limit: 100 })
    ]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods.data);
      setLoading(false);
    }).catch(() => setLoading(false));
    const secondaryTimer = setTimeout(() => {
      Promise.all([api.getIndustries(), api.getSolutions(), api.getResources()]).then(([inds, sols, res]) => {
        setIndustries(inds);
        setSolutions(sols);
        setResources(res);
      }).catch(() => {
      });
    }, 500);
    return () => clearTimeout(secondaryTimer);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4e3);
    return () => clearTimeout(timer);
  }, [toast]);
  const filteredProducts = useMemo(
    // Memoized filter: products filtered by search query AND selected category
    () => products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || p.name.toLowerCase().includes(q) || (p.category?.name ?? "").toLowerCase().includes(q) || (p.shortDescription ?? "").toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q);
      const matchesCategory = !selectedCategory || p.category?.slug === selectedCategory;
      return matchesSearch && matchesCategory;
    }),
    [products, searchQuery, selectedCategory]
  );
  const showToast = useCallback((t) => setToast(t), []);
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      await api.createInquiry({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        company: String(data.get("company") || ""),
        phone: String(data.get("phone") || ""),
        message: String(data.get("message") || ""),
        source: "website"
      });
      setFormStatus("Thank you! Your inquiry has been submitted. We will get back to you soon.");
      setToast({ message: "Inquiry submitted successfully!", type: "success" });
      event.target.reset();
    } catch {
      setFormStatus("Failed to submit. Please try again.");
      setToast({ message: "Failed to submit. Please try again.", type: "error" });
    }
  }, []);
  const filterCategory = useCallback((slug) => {
    setSelectedCategory(slug);
  }, []);
  const scrollToContact = useCallback(() => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  }, []);
  const value = {
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
    scrollToContact
  };
  return /* @__PURE__ */ jsx(SiteContext.Provider, { value, children });
}
function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within a SiteProvider");
  return ctx;
}
export {
  SiteProvider,
  useSite
};
