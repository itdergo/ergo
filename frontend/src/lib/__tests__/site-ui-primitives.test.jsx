import { jsx } from "react/jsx-runtime";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TiltCard, ScrollReveal } from "../site-ui-primitives";
describe("TiltCard", () => {
  it("renders children", () => {
    render(
      /* @__PURE__ */ jsx(TiltCard, {
        children: /* @__PURE__ */ jsx("div", { "data-testid": "child", children: "Hello" }),
      }),
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
  it("applies custom className", () => {
    render(
      /* @__PURE__ */ jsx(TiltCard, {
        className: "custom-class",
        children: /* @__PURE__ */ jsx("div", { children: "Content" }),
      }),
    );
    expect(document.querySelector(".custom-class")).toBeInTheDocument();
  });
  it("defaults to empty className", () => {
    render(
      /* @__PURE__ */ jsx(TiltCard, {
        children: /* @__PURE__ */ jsx("span", { children: "Test" }),
      }),
    );
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
describe("ScrollReveal", () => {
  it("renders children", () => {
    render(
      /* @__PURE__ */ jsx(ScrollReveal, {
        children: /* @__PURE__ */ jsx("div", { "data-testid": "child", children: "World" }),
      }),
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
  it("applies custom className", () => {
    render(
      /* @__PURE__ */ jsx(ScrollReveal, {
        className: "custom-class",
        children: /* @__PURE__ */ jsx("div", { children: "Content" }),
      }),
    );
    expect(document.querySelector(".custom-class")).toBeInTheDocument();
  });
  it("accepts delay prop without crashing", () => {
    render(
      /* @__PURE__ */ jsx(ScrollReveal, {
        delay: 0.5,
        children: /* @__PURE__ */ jsx("div", { children: "Delayed content" }),
      }),
    );
    expect(screen.getByText("Delayed content")).toBeInTheDocument();
  });
});
