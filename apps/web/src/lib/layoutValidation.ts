import { FunnelBlock } from "@/components/DragDropBuilder";

export function layoutSanityCheck(sections: FunnelBlock[]) {
  if (sections.filter(s => s.type === "cta").length > 1) {
    throw new Error("Only one primary CTA allowed");
  }
}

export function validateFunnelStructure(blocks: FunnelBlock[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for multiple CTAs
  const ctaCount = blocks.filter(b => b.type === "cta").length;
  if (ctaCount > 1) {
    errors.push("Only one primary CTA allowed");
  }

  // Check for hero section
  const hasHero = blocks.some(b => b.type === "hero");
  if (!hasHero) {
    errors.push("Funnel must have a hero section");
  }

  // Check hero is first
  if (blocks.length > 0 && blocks[0].type !== "hero") {
    errors.push("Hero section must be first");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
