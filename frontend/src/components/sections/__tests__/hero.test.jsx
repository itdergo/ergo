import { jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
vi.mock("framer-motion", () => {
  const createMotion = (tag) => {
    const MotionComponent = ({ children, ...props }) => {
      const {
        variants,
        initial,
        animate,
        transition,
        whileHover,
        whileTap,
        whileFocus,
        whileDrag,
        drag,
        dragConstraints,
        exit,
        layout,
        layoutId,
        ...domProps
      } = props;
      return React.createElement(tag, domProps, children);
    };
    MotionComponent.displayName = `motion.${tag}`;
    return MotionComponent;
  };
  return {
    motion: {
      div: createMotion("div"),
      span: createMotion("span"),
      h1: createMotion("h1"),
      p: createMotion("p"),
      a: createMotion("a"),
      img: createMotion("img")
    },
    useScroll: () => ({ scrollY: 0 }),
    useTransform: (_, __, output) => output[0],
    useSpring: (val) => val,
    useMotionValue: () => ({ set: () => {
    } }),
    useInView: () => true
  };
});
vi.mock("lucide-react", () => ({
  ArrowRight: () => React.createElement("span", { "data-testid": "arrow-right" }),
  ChevronDown: () => React.createElement("span", { "data-testid": "chevron-down" })
}));
import { HeroSection } from "../hero";
describe("HeroSection", () => {
  it("renders without crashing", () => {
    const { container } = render(/* @__PURE__ */ jsx(HeroSection, {}));
    expect(container).toBeDefined();
  });
});
