import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureRefFromUrl, trackPageView } from "@/lib/tracking";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { Stuck } from "@/components/site/Stuck";
import { Process } from "@/components/site/Process";


import { Apply } from "@/components/site/Apply";

import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B1 Scale — Creator Growth, From Zero to Scale" },
      {
        name: "description",
        content:
          "We scale creators at any stage — faceless, anonymous, or established. Private partnerships built around you, no audience required.",
      },
      { property: "og:title", content: "B1 Scale — Creator Growth, From Zero to Scale" },
      {
        property: "og:description",
        content:
          "Private creator growth partner. Revenue, engagement, and scaling infrastructure — for creators at every stage, faceless welcome.",
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
        <Apply />
      </main>
      <Footer />
    </div>
  );
}
