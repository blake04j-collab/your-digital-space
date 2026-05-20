import { createFileRoute } from "@tanstack/react-router";
import { LueyLinkInBio } from "@/components/site/LueyLinkInBio";

export const Route = createFileRoute("/luebtc")({
  head: () => ({
    meta: [
      { title: "L5 — making girls famous" },
      { name: "description", content: "L5 — social media marketing" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: LueyLinkInBio,
});
