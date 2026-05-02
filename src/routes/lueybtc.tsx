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
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Rotating rainbow halo behind text */}
      <div
        className="absolute h-[120vmin] w-[120vmin] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff0000)",
          animation: "luey-spin 8s linear infinite",
        }}
      />

      {/* Pulsing rainbow ring */}
      <div
        className="absolute h-[70vmin] w-[70vmin] rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 90deg, #ff0080, #ff8c00, #ffd500, #00ff88, #00d4ff, #7a00ff, #ff0080)",
          filter: "blur(40px)",
          animation: "luey-spin 6s linear infinite reverse, luey-pulse 3s ease-in-out infinite",
        }}
      />

      {/* The word */}
      <h1
        className="relative z-10 font-black tracking-tight select-none"
        style={{
          fontSize: "clamp(6rem, 28vw, 24rem)",
          backgroundImage:
            "linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #00ffff, #0000ff, #8b00ff, #ff0000)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextStroke: "2px rgba(255,255,255,0.15)",
          filter:
            "drop-shadow(0 0 20px rgba(255, 0, 128, 0.8)) drop-shadow(0 0 40px rgba(0, 200, 255, 0.7)) drop-shadow(0 0 80px rgba(255, 215, 0, 0.6))",
          animation: "luey-rainbow 4s linear infinite",
        }}
      >
        LUEY
      </h1>

      {/* Floating rainbow orbs */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-70"
          style={{
            width: `${20 + i * 8}vmin`,
            height: `${20 + i * 8}vmin`,
            background: `conic-gradient(from ${i * 60}deg, #ff0080, #ffd500, #00ff88, #00d4ff, #7a00ff, #ff0080)`,
            filter: "blur(30px)",
            top: `${10 + i * 12}%`,
            left: `${(i * 17) % 80}%`,
            animation: `luey-float ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes luey-rainbow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes luey-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes luey-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes luey-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(5vmin, -8vmin) scale(1.1); }
          66% { transform: translate(-6vmin, 4vmin) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
