import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureRefFromUrl, trackPageView } from "@/lib/tracking";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Testimonial } from "@/components/site/Testimonial";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WhyJoin } from "@/components/site/WhyJoin";
import { Apply } from "@/components/site/Apply";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cloud Agency — Grow Your Audience. Increase Your Income." },
      {
        name: "description",
        content:
          "Cloud Agency helps creators unlock high-value opportunities, increase revenue, and build long-term sustainable income from their content.",
      },
      { property: "og:title", content: "Cloud Agency — Scale Your Creator Income" },
      {
        property: "og:description",
        content:
          "Premium creator growth and monetization. Apply in under a minute.",
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
    <div className="min-h-screen text-foreground">
      <Nav />
      <main>
        <Hero />
        <Testimonial />
        <HowItWorks />
        <WhyJoin />
        <Apply />
      </main>
      <Footer />
    </div>
  );
}
