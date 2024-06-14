import { tv } from "tailwind-variants";

export const PaperCoreVariants = tv({
  slots: {
    base: "group rounded-xl border-1 border-container-stroke-separator",
  },
  variants: {
    size: {
      l: { base: "p-6" },
      m: { base: "p-4" },
      s: { base: "p-3" },
    },
    container: {
      "1": { base: "bg-container-1" },
      "2": { base: "bg-container-2" },
      "3": { base: "bg-container-3" },
      "4": { base: "bg-container-4" },
      action: { base: "bg-container-action" },
      inverse: { base: "bg-container-inverse" },
    },
  },
  defaultVariants: {
    size: "m",
    container: "1",
  },
});
