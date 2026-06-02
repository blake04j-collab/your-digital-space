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
      { title: "B1 Scale — Full-Service Social Media & Creator Management Agency" },
      {
        name: "description",
        content:
          "B1 Scale is a full-service social media, creator management, and marketing agency. We handle content, growth, and monetization for creators at every stage.",
      },
      { property: "og:title", content: "B1 Scale — Creator Management & Marketing Agency" },
      {
        property: "og:description",
        content:
          "Content, social media, and monetization handled end-to-end. Built for creators ready to scale.",
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
