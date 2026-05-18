import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureRefFromUrl, trackPageView } from "@/lib/tracking";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { Stuck } from "@/components/site/Stuck";
import { Process } from "@/components/site/Process";
import { Plans } from "@/components/site/Plans";
import { Fit } from "@/components/site/Fit";
import { Apply } from "@/components/site/Apply";

import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B1 Scale — Monetization Systems for Elite Creators" },
      {
        name: "description",
        content:
          "B1 Scale helps modern creators optimize monetization, fan engagement, and backend growth systems. Private partnerships for high-revenue subscription brands.",
      },
      { property: "og:title", content: "B1 Scale — Monetization Systems for Elite Creators" },
      {
        property: "og:description",
        content:
          "Private creator growth partner. Revenue optimization, fan engagement, scaling infrastructure — built for high-ticket creator brands.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    captureRefFromUrl();
    trackPageView("/");
  }, []);
  return (
    <div className="min-h-screen bg-background text-foreground grain">
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Services />
        <Stuck />
        <Process />
        <Plans />
        <Fit />
        <Apply />
      </main>
      <Footer />
    </div>
  );
}
