import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TiltCard, ScrollReveal } from "../site-ui-primitives";

describe("TiltCard", () => {
  it("renders children", () => {
    render(
      <TiltCard>
        <div data-testid="child">Hello</div>
      </TiltCard>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <TiltCard className="custom-class">
        <div>Content</div>
      </TiltCard>,
    );
    expect(document.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("defaults to empty className", () => {
    render(
      <TiltCard>
        <span>Test</span>
      </TiltCard>,
    );
    // Should render without errors
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});

describe("ScrollReveal", () => {
  it("renders children", () => {
    render(
      <ScrollReveal>
        <div data-testid="child">World</div>
      </ScrollReveal>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(
      <ScrollReveal className="custom-class">
        <div>Content</div>
      </ScrollReveal>,
    );
    expect(document.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("accepts delay prop without crashing", () => {
    render(
      <ScrollReveal delay={0.5}>
        <div>Delayed content</div>
      </ScrollReveal>,
    );
    expect(screen.getByText("Delayed content")).toBeInTheDocument();
  });
});
