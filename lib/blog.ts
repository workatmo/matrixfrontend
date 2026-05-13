import { slugify } from "@/lib/seo";

export type BlogCategory = {
  slug: string;
  name: string;
  description: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  datePublishedISO: string;
  dateModifiedISO?: string;
  imagePath?: string;
  sections: Array<
    | { type: "p"; text: string }
    | { type: "h2"; text: string }
    | { type: "ul"; items: string[] }
  >;
};

export const blogCategories: BlogCategory[] = [
  {
    slug: "tyre-guide",
    name: "Tyre Guide",
    description: "Simple, practical advice for choosing the right tyres.",
  },
  {
    slug: "maintenance",
    name: "Maintenance",
    description: "Tyre care tips to improve safety and tyre life.",
  },
  {
    slug: "reviews",
    name: "Reviews",
    description: "Brand and tyre comparisons to help you buy confidently.",
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: slugify("Best tyres for UK roads"),
    title: "Best tyres for UK roads (2026 guide)",
    description:
      "A practical guide to choosing tyres for UK weather and roads, including all-season vs summer, mileage tips, and what to check before you buy.",
    categorySlug: "tyre-guide",
    datePublishedISO: "2026-04-28",
    imagePath: "/tyre-placeholder.svg",
    sections: [
      { type: "p", text: "UK roads and weather can change quickly, so tyre choice matters for safety, comfort and running costs." },
      { type: "h2", text: "All-season vs summer vs winter" },
      {
        type: "ul",
        items: [
          "All-season: good year-round option for many UK drivers",
          "Summer: best for warmer conditions and precise handling",
          "Winter: best for cold temperatures and improved grip in snow/ice",
        ],
      },
      { type: "h2", text: "What to check before buying" },
      {
        type: "ul",
        items: [
          "Correct tyre size (sidewall or vehicle handbook)",
          "Load index and speed rating",
          "Tread pattern and wet-grip rating",
          "Your budget vs expected mileage",
        ],
      },
      { type: "p", text: "If you’re unsure, start by matching the exact size and then choose a season suited to your driving." },
    ],
  },
  {
    slug: slugify("How to choose car tyres"),
    title: "How to choose car tyres: size, season, and value",
    description:
      "Learn how to choose tyres by size, season, and usage. A simple checklist to avoid mistakes and get the best value for your car.",
    categorySlug: "maintenance",
    datePublishedISO: "2026-04-28",
    imagePath: "/tyre-placeholder.svg",
    sections: [
      { type: "p", text: "Choosing tyres is easier when you follow a clear checklist." },
      { type: "h2", text: "Step 1: Match the tyre size" },
      { type: "p", text: "Use the size printed on your current tyre sidewall (e.g. 205/55R16) or check the handbook." },
      { type: "h2", text: "Step 2: Pick the right season" },
      {
        type: "ul",
        items: [
          "All-season for convenience and year-round UK driving",
          "Summer for warm-weather performance",
          "Winter for cold conditions and better traction",
        ],
      },
      { type: "h2", text: "Step 3: Maintain for longer life" },
      {
        type: "ul",
        items: [
          "Check tyre pressure monthly",
          "Rotate tyres if recommended",
          "Get alignment checked if you notice uneven wear",
        ],
      },
    ],
  },
  {
    slug: slugify("Top tyre brands in the UK"),
    title: "Top tyre brands in the UK: how to compare",
    description:
      "A simple way to compare tyre brands by performance, mileage and price—plus how to choose the right option for your daily driving.",
    categorySlug: "reviews",
    datePublishedISO: "2026-04-28",
    imagePath: "/tyre-placeholder.svg",
    sections: [
      { type: "p", text: "Brand is a useful signal, but the best tyre depends on your vehicle, size and driving needs." },
      { type: "h2", text: "Compare brands using these factors" },
      {
        type: "ul",
        items: [
          "Wet grip and braking",
          "Road noise and comfort",
          "Expected mileage",
          "Value for money",
        ],
      },
      { type: "p", text: "If you mainly drive in cities, comfort and wet grip often matter more than high-speed handling." },
    ],
  },
];

export function getBlogCategory(slug: string): BlogCategory | null {
  return blogCategories.find((c) => c.slug === slug) ?? null;
}

export function getBlogPost(slug: string): BlogPost | null {
  return blogPosts.find((p) => p.slug === slug) ?? null;
}

export function listBlogPostsByCategory(categorySlug: string): BlogPost[] {
  return blogPosts.filter((p) => p.categorySlug === categorySlug);
}

