import { createFileRoute } from "@tanstack/react-router";
import { LinkInBio } from "@/components/site/LinkInBio";

export const Route = createFileRoute("/B1")({
  head: () => ({
    meta: [
      { title: "B1 — i ♡ scaling" },
      { name: "description", content: "B1 — links" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: LinkInBio,
});
