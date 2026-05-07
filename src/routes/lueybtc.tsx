import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lueybtc")({
  head: () => ({
    meta: [
      { title: "Luey — after hours" },
      { name: "description", content: "Luey — after hours" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "googlebot", content: "noindex, nofollow" },
    ],
  }),
  component: LueyBtc,
});

function LueyBtc() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #15082a 0%, #05030a 70%)" }}
    >
      {/* Disco speckle */}
      <div
        className="absolute inset-[-20%]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.2px)",
          backgroundSize: "44px 44px",
          opacity: 0.18,
          animation: "luey-speckle-spin 60s linear infinite",
        }}
      />

      {/* Haze layers */}
      <div
        className="absolute h-[120vmin] w-[120vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,45,146,0.45), transparent 60%)",
          filter: "blur(60px)",
          top: "-10%",
          left: "-15%",
          mixBlendMode: "screen",
          animation: "luey-haze 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute h-[110vmin] w-[110vmin] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(34,224,255,0.4), transparent 60%)",
          filter: "blur(70px)",
          bottom: "-15%",
          right: "-10%",
          mixBlendMode: "screen",
          animation: "luey-haze 18s ease-in-out infinite reverse",
        }}
      />

      {/* Spotlight cones from top */}
      <div
        className="absolute top-0 left-1/2 origin-top"
        style={{
          width: "60vmin",
          height: "120vh",
          marginLeft: "-30vmin",
          background:
            "linear-gradient(180deg, rgba(255,45,146,0.55), transparent 70%)",
          clipPath: "polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)",
          filter: "blur(20px)",
          mixBlendMode: "screen",
          animation: "luey-sweep-a 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-0 left-1/2 origin-top"
        style={{
          width: "55vmin",
          height: "120vh",
          marginLeft: "-27vmin",
          background:
            "linear-gradient(180deg, rgba(34,224,255,0.5), transparent 70%)",
          clipPath: "polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)",
          filter: "blur(22px)",
          mixBlendMode: "screen",
          animation: "luey-sweep-b 9s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-0 left-1/2 origin-top"
        style={{
          width: "50vmin",
          height: "120vh",
          marginLeft: "-25vmin",
          background:
            "linear-gradient(180deg, rgba(122,44,255,0.5), transparent 70%)",
          clipPath: "polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)",
          filter: "blur(24px)",
          mixBlendMode: "screen",
          animation: "luey-sweep-c 11s ease-in-out infinite",
        }}
      />

      {/* Wordmark + tagline (upper area) */}
      <div className="absolute top-[8vh] left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <h1
          className="font-display text-white leading-none tracking-wide"
          style={{
            fontSize: "clamp(4rem, 14vw, 12rem)",
            animation: "luey-beat 0.5s ease-in-out infinite",
            filter:
              "drop-shadow(0 0 12px rgba(255,45,146,0.9)) drop-shadow(0 0 28px rgba(34,224,255,0.7)) drop-shadow(0 0 60px rgba(122,44,255,0.5))",
          }}
        >
          LUEY
        </h1>
        <p
          className="mt-3 text-white/70"
          style={{
            fontSize: "clamp(0.7rem, 1vw, 0.9rem)",
            letterSpacing: "0.45em",
            textTransform: "uppercase",
          }}
        >
          After Hours · Est. Nowhere
        </p>
      </div>

      {/* Floor glow */}
      <div
        className="absolute"
        style={{
          bottom: "4vh",
          left: "50%",
          transform: "translateX(-50%)",
          width: "60vmin",
          height: "12vmin",
          background:
            "radial-gradient(ellipse, rgba(255,45,146,0.55), rgba(34,224,255,0.25) 50%, transparent 75%)",
          filter: "blur(20px)",
          animation: "luey-beat 0.5s ease-in-out infinite",
          mixBlendMode: "screen",
        }}
      />

      {/* Dancer silhouette */}
      <div
        className="absolute z-10"
        style={{
          bottom: "5vh",
          left: "50%",
          transform: "translateX(-50%)",
          height: "62vh",
          animation: "luey-sway 2s ease-in-out infinite",
          transformOrigin: "50% 95%",
          filter:
            "drop-shadow(-6px 0 8px rgba(255,45,146,0.85)) drop-shadow(6px 0 8px rgba(34,224,255,0.85)) drop-shadow(0 0 24px rgba(122,44,255,0.5))",
        }}
      >
        <svg
          viewBox="0 0 200 500"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Dancer silhouette"
        >
          {/* Hair flowing */}
          <path
            d="M 78 50 C 55 40, 48 70, 55 100 C 60 120, 70 130, 80 135 L 92 90 Z"
            fill="#000"
          />
          {/* Head */}
          <circle cx="100" cy="60" r="22" fill="#000" />
          {/* Neck */}
          <rect x="95" y="78" width="10" height="12" fill="#000" />
          {/* Raised arm (up & to the side) */}
          <path
            d="M 105 92 C 130 75, 155 50, 168 30 L 178 38 C 168 62, 145 92, 120 108 Z"
            fill="#000"
          />
          {/* Other arm out and slightly down */}
          <path
            d="M 95 95 C 70 105, 45 130, 35 155 L 48 162 C 60 142, 80 122, 100 115 Z"
            fill="#000"
          />
          {/* Torso with hip tilt */}
          <path
            d="M 82 95 L 118 95 C 124 140, 130 180, 132 220 L 70 225 C 72 185, 76 140, 82 95 Z"
            fill="#000"
          />
          {/* Hip/skirt asymmetric */}
          <path
            d="M 68 218 L 134 218 C 138 245, 140 270, 138 290 L 64 292 C 64 268, 64 242, 68 218 Z"
            fill="#000"
          />
          {/* Front leg (bent knee) */}
          <path
            d="M 78 285 C 78 330, 68 370, 60 410 C 56 430, 54 450, 56 470 L 76 472 C 80 450, 86 425, 92 395 C 98 360, 100 320, 98 285 Z"
            fill="#000"
          />
          {/* Back leg (straighter, planted) */}
          <path
            d="M 110 285 C 112 330, 118 370, 124 410 C 128 432, 132 455, 132 472 L 152 472 C 150 450, 146 425, 140 395 C 134 360, 130 320, 128 285 Z"
            fill="#000"
          />
          {/* Heels */}
          <ellipse cx="66" cy="476" rx="14" ry="4" fill="#000" />
          <ellipse cx="142" cy="476" rx="14" ry="4" fill="#000" />
        </svg>
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      <style>{`
        @keyframes luey-beat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes luey-sweep-a {
          0%, 100% { transform: rotate(-12deg); }
          50% { transform: rotate(14deg); }
        }
        @keyframes luey-sweep-b {
          0%, 100% { transform: rotate(10deg); }
          50% { transform: rotate(-16deg); }
        }
        @keyframes luey-sweep-c {
          0%, 100% { transform: rotate(-6deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes luey-haze {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4vmin, -3vmin) scale(1.08); }
        }
        @keyframes luey-speckle-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes luey-sway {
          0%, 100% { transform: translateX(-50%) rotate(-2deg); }
          50% { transform: translateX(-50%) rotate(2deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
