import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lueybtc")({
  head: () => ({
    meta: [
      { title: "Luey — i ♡ scaling" },
      { name: "description", content: "Luey — links" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: LueyBtc,
});

function LueyBtc() {
  return <div />;
}
