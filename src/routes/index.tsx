import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { captureRefFromUrl, trackPageView } from "@/lib/tracking";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { WhyJoin } from "@/components/site/WhyJoin";
import { BuiltFor } from "@/components/site/BuiltFor";
import { Testimonial } from "@/components/site/Testimonial";
import { Apply } from "@/components/site/Apply";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "B1 Scale — Land More Brand Deals. Scale Your Creator Income." },
      {
        name: "description",
        content:
          "The B1 Team connects creators with brands actively looking for sponsorships, partnerships, and long-term collaborations. Free to apply.",
      },
      { property: "og:title", content: "B1 Scale — Land More Brand Deals" },
      {
        property: "og:description",
        content:
          "Get matched with brands looking for creator partnerships. Fast review. Free to apply.",
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
        <HowItWorks />
        <WhyJoin />
        <BuiltFor />
        <Testimonial />
        <Apply />
      </main>
      <Footer />
    </div>
  );
}
