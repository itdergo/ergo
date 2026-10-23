import { jsx, jsxs } from "react/jsx-runtime";
import { useSite } from "@/lib/site-context";
import { ScrollReveal } from "@/lib/site-ui-primitives";
import { ArrowUpRight, Clock, Globe, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { KineticHeading } from "@/components/fx";
function ContactSection() {
  const { handleSubmit, formStatus } = useSite();
  return /* @__PURE__ */ jsx(ScrollReveal, { children: /* @__PURE__ */ jsx("section", { className: "section", id: "contact", children: /* @__PURE__ */ jsxs("div", { className: "container contact-grid", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("span", { className: "section-label", children: "Contact" }),
      /* @__PURE__ */ jsx(KineticHeading, { as: "h2", className: "section-heading", text: "Get a Free Consultation" }),
      /* @__PURE__ */ jsx("p", { className: "section-intro", children: "Tell us about your space and requirements." }),
      /* @__PURE__ */ jsxs("div", { className: "contact-details", children: [
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(Phone, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Phone" }),
            /* @__PURE__ */ jsx("p", { children: "+63 2 8843 1177 \xA0|\xA0 0939 264 3566" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(Mail, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Email" }),
            /* @__PURE__ */ jsx("p", { children: "sales_ergo@ergo.com.ph" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(MapPin, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Office" }),
            /* @__PURE__ */ jsx("p", { children: "2634 Rockefeller St. Brgy. San Isidro, Makati City, 1200 Philippines" }),
            /* @__PURE__ */ jsxs(
              "a",
              {
                className: "directions-link",
                href: "https://www.google.com/maps/dir/?api=1&destination=2634+Rockefeller+Street,+San+Isidro,+Makati+City,+Philippines",
                target: "_blank",
                rel: "noopener noreferrer",
                children: [
                  "Get directions ",
                  /* @__PURE__ */ jsx(ArrowUpRight, { size: 13 })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(Globe, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Facebook" }),
            /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx(
              "a",
              {
                href: "https://www.facebook.com/profile.php?id=61595001456946",
                target: "_blank",
                rel: "noopener noreferrer",
                style: { color: "inherit" },
                children: "ERGO Contracts Philippines"
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(Clock, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Business Hours" }),
            /* @__PURE__ */ jsx("p", { children: "Mon \u2013 Fri, 8:00 AM \u2013 6:00 PM" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "contact-detail", children: [
          /* @__PURE__ */ jsx("div", { className: "icon-tile", children: /* @__PURE__ */ jsx(ShieldCheck, { size: 19 }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("small", { children: "Response Time" }),
            /* @__PURE__ */ jsx("p", { children: "We respond within 24 hours" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "contact-form", onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "form-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "consult-name", children: [
            "Full name",
            " ",
            /* @__PURE__ */ jsx("span", { className: "required", "aria-hidden": "true", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "consult-name",
              name: "name",
              autoComplete: "name",
              required: true,
              "aria-required": "true",
              placeholder: "Juan Dela Cruz"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "consult-email", children: [
            "Email",
            " ",
            /* @__PURE__ */ jsx("span", { className: "required", "aria-hidden": "true", children: "*" })
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "consult-email",
              name: "email",
              type: "email",
              autoComplete: "email",
              required: true,
              "aria-required": "true",
              placeholder: "sales@ergo.com.ph"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "consult-company", children: "Company" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "consult-company",
              name: "company",
              autoComplete: "organization",
              placeholder: "Company name"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "consult-phone", children: "Phone" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              id: "consult-phone",
              name: "phone",
              type: "tel",
              autoComplete: "tel",
              placeholder: "+63 ..."
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-field message-field", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "consult-message", children: [
          "Message",
          " ",
          /* @__PURE__ */ jsx("span", { className: "required", "aria-hidden": "true", children: "*" })
        ] }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "consult-message",
            name: "message",
            required: true,
            "aria-required": "true",
            rows: 4,
            placeholder: "Tell us about your project..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("button", { type: "submit", className: "button-primary submit-button", children: [
        "Send Request ",
        /* @__PURE__ */ jsx(Send, { size: 15 })
      ] }),
      formStatus && /* @__PURE__ */ jsx("p", { className: "form-status", children: formStatus })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "branch-network", children: /* @__PURE__ */ jsx("p", { className: "section-intro", children: "Visit a showroom near you, or reach any of our representative offices and retail partners across the Philippines and overseas." }) }),
    /* @__PURE__ */ jsx("div", { className: "contact-map", children: /* @__PURE__ */ jsx(
      "iframe",
      {
        title: "ERGO Contracts Philippines office location map",
        src: "https://www.google.com/maps?q=2634%20Rockefeller%20Street%2C%20San%20Isidro%2C%20Makati%20City%2C%20Philippines&z=17&output=embed",
        loading: "lazy",
        referrerPolicy: "no-referrer-when-downgrade",
        allowFullScreen: true
      }
    ) })
  ] }) }) });
}
export {
  ContactSection
};
