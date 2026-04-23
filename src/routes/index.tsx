import { createFileRoute } from "@tanstack/react-router";
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
      { title: "B1SCALE — Turn Your Attention Into Income" },
      {
        name: "description",
        content:
          "B1SCALE works with creators in fitness, looks, and lifestyle to turn audience into real brand income. i ♡ scaling.",
      },
      { property: "og:title", content: "B1SCALE — Turn Your Attention Into Income" },
      {
        property: "og:description",
        content:
          "Creator partnership program. Direct brand network. Real deals. Apply for priority placement.",
      },
    ],
  }),
  component: Index,
});

function Index() {
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
