import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";
function ProductsView() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const load = () => {
    api.getProducts({ limit: 100 }).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  };
  useEffect(() => {
    load();
    api.getCategories().then(setCategories);
  }, []);
  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await api.deleteProduct(id);
    load();
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-6", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Products" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => {
            setEditing(null);
            setShowForm(true);
          },
          className: "bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsx(Plus, { size: 16 }),
            " Add Product"
          ]
        }
      )
    ] }),
    showForm && // Modal form: shown for both add and edit operations
    /* @__PURE__ */ jsx(
      ProductForm,
      {
        product: editing,
        categories,
        onClose: () => setShowForm(false),
        onSave: () => {
          setShowForm(false);
          load();
        }
      }
    ),
    loading ? /* @__PURE__ */ jsx("p", { children: "Loading..." }) : /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full", children: [
      /* @__PURE__ */ jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500", children: "Name" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500", children: "Category" }),
        /* @__PURE__ */ jsx("th", { className: "text-left px-4 py-3 text-xs font-medium text-gray-500", children: "Status" }),
        /* @__PURE__ */ jsx("th", { className: "text-right px-4 py-3 text-xs font-medium text-gray-500", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: products.map((p) => /* @__PURE__ */ jsxs("tr", { className: "border-t", children: [
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm", children: p.name }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3 text-sm text-gray-500", children: p.category?.name || "-" }),
        /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx(
          "span",
          {
            className: `px-2 py-1 text-xs rounded-full ${p.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`,
            children: p.status
          }
        ) }),
        /* @__PURE__ */ jsxs("td", { className: "px-4 py-3 text-right", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                setEditing(p);
                setShowForm(true);
              },
              className: "text-blue-600 mr-3",
              children: /* @__PURE__ */ jsx(Edit, { size: 16 })
            }
          ),
          /* @__PURE__ */ jsx("button", { onClick: () => handleDelete(p.id), className: "text-red-600", children: /* @__PURE__ */ jsx(Trash2, { size: 16 }) })
        ] })
      ] }, p.id)) })
    ] }) })
  ] });
}
function ProductForm({
  // ProductForm: controlled form with all product fields
  product,
  categories,
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    categoryId: product?.categoryId || "",
    imageUrl: product?.imageUrl || "",
    price: product?.price?.toString() || "",
    status: product?.status || "draft",
    isFeatured: product?.isFeatured || false
  });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      categoryId: form.categoryId || null,
      price: form.price ? parseInt(form.price) : null,
      status: form.status
    };
    try {
      if (product) await api.updateProduct(product.id, data);
      else await api.createProduct(data);
      onSave();
    } catch {
      alert("Failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50", children: /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxs("h3", { className: "text-lg font-bold mb-4", children: [
      product ? "Edit" : "Add",
      " Product"
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Name" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.name,
              onChange: (e) => setForm({ ...form, name: e.target.value }),
              className: "w-full border rounded-lg px-3 py-2 text-sm",
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Slug" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              value: form.slug,
              onChange: (e) => setForm({ ...form, slug: e.target.value }),
              className: "w-full border rounded-lg px-3 py-2 text-sm",
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Short Description" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: form.shortDescription,
            onChange: (e) => setForm({ ...form, shortDescription: e.target.value }),
            className: "w-full border rounded-lg px-3 py-2 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Description" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: form.description,
            onChange: (e) => setForm({ ...form, description: e.target.value }),
            className: "w-full border rounded-lg px-3 py-2 text-sm",
            rows: 3
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Category" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.categoryId,
              onChange: (e) => setForm({ ...form, categoryId: e.target.value }),
              className: "w-full border rounded-lg px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "None" }),
                categories.map((c) => /* @__PURE__ */ jsx("option", { value: c.id, children: c.name }, c.id))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Price" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              value: form.price,
              onChange: (e) => setForm({ ...form, price: e.target.value }),
              className: "w-full border rounded-lg px-3 py-2 text-sm"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Image URL" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: form.imageUrl,
            onChange: (e) => setForm({ ...form, imageUrl: e.target.value }),
            className: "w-full border rounded-lg px-3 py-2 text-sm"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium mb-1", children: "Status" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: form.status,
              onChange: (e) => setForm({ ...form, status: e.target.value }),
              className: "w-full border rounded-lg px-3 py-2 text-sm",
              children: [
                /* @__PURE__ */ jsx("option", { value: "draft", children: "Draft" }),
                /* @__PURE__ */ jsx("option", { value: "active", children: "Active" }),
                /* @__PURE__ */ jsx("option", { value: "archived", children: "Archived" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-end", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "checkbox",
              checked: form.isFeatured,
              onChange: (e) => setForm({ ...form, isFeatured: e.target.checked }),
              className: "rounded"
            }
          ),
          " ",
          "Featured"
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: onClose, className: "px-4 py-2 text-sm text-gray-600", children: "Cancel" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: saving,
            className: "bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50",
            children: saving ? "Saving..." : "Save"
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  ProductsView
};
