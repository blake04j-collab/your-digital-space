import { useState } from "react";
import { Section } from "./Section";

type Platform = "instagram" | "tiktok";

function estimateEarnings(followers: number): string {
  if (followers <= 5000) return "$1,750";
  if (followers <= 15000) return "$3,000";
  if (followers <= 75000) return "$4,500";
  if (followers <= 150000) return "$6,000";
  return "$9,000+";
}

export function Estimator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [handle, setHandle] = useState("");
  const [followers, setFollowers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    handle: string;
    platform: Platform;
    earnings: string;
    followers: number;
  } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanHandle = handle.trim().replace(/^@/, "");
    const followerNum = Number(followers.replace(/,/g, ""));

    if (!cleanHandle) {
      setError("Please enter your creator handle.");
      return;
    }
    if (!Number.isFinite(followerNum) || followerNum <= 0) {
      setError("Follower count must be a positive number.");
      return;
    }

    setError(null);
    setResult({
      handle: cleanHandle,
      platform,
      earnings: estimateEarnings(followerNum),
      followers: followerNum,
    });
  }

  function handleReset() {
    setResult(null);
    setHandle("");
    setFollowers("");
  }

  return (
    <Section
      id="estimator"
      eyebrow="Earnings Estimator"
      title={
        <>
          Estimate How Much You<br />
          Could Earn With <em className="not-italic text-lime">B1Scale.</em>
        </>
      }
      lead="Enter your Instagram or TikTok handle and follower count to see your potential monthly earnings."
    >
      <div className="mt-10 rounded-2xl border border-hairline bg-surface-1 p-6 md:p-8">
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Platform */}
            <div>
              <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["instagram", "tiktok"] as Platform[]).map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`rounded-xl border px-4 py-3 font-display text-base tracking-[0.15em] transition-colors ${
                      platform === p
                        ? "border-lime bg-lime-soft text-lime"
                        : "border-hairline bg-surface-2 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p === "instagram" ? "Instagram" : "TikTok"}
                  </button>
                ))}
              </div>
            </div>

            {/* Handle */}
            <div>
              <label
                htmlFor="creator-handle"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Creator Handle
              </label>
              <div className="flex items-center rounded-xl border border-hairline bg-surface-2 px-4 focus-within:border-lime">
                <span className="text-muted-foreground">@</span>
                <input
                  id="creator-handle"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="yourhandle"
                  maxLength={50}
                  className="w-full bg-transparent py-3 pl-1 text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Followers */}
            <div>
              <label
                htmlFor="follower-count"
                className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Follower Count
              </label>
              <input
                id="follower-count"
                type="number"
                inputMode="numeric"
                min={1}
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="e.g. 25000"
                className="w-full rounded-xl border border-hairline bg-surface-2 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:border-lime focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm font-light text-destructive">{error}</p>
            )}

            <button
              type="submit"
              className="shimmer-cta w-full rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.01]"
            >
              Calculate My Earnings ›
            </button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-4 py-1.5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse-lime" />
              Your Estimate
            </div>
            <p className="font-display text-2xl tracking-wider text-foreground">
              @{result.handle}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              {result.platform === "instagram" ? "Instagram" : "TikTok"} ·{" "}
              {result.followers.toLocaleString()} followers
            </p>

            <div className="my-8 rounded-2xl border-[1.5px] border-lime bg-lime-soft p-8">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Estimated Monthly Earnings
              </p>
              <p className="mt-3 font-display text-[clamp(3rem,12vw,5.5rem)] leading-none tracking-wide text-lime">
                {result.earnings}
              </p>
              <p className="mt-3 text-xs font-light text-muted-foreground">
                per month with B1Scale partnership
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="#apply"
                className="shimmer-cta rounded-xl bg-lime px-8 py-4 font-display text-lg tracking-[0.15em] text-primary-foreground shadow-lime transition-transform hover:scale-[1.02]"
              >
                Apply to Join B1Scale ›
              </a>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-hairline bg-surface-2 px-8 py-4 font-display text-lg tracking-[0.15em] text-foreground transition-colors hover:bg-surface-1"
              >
                Recalculate
              </button>
            </div>

            <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
              * Estimates based on average B1Scale partner earnings. Actual results vary.
            </p>
          </div>
        )}
      </div>
    </Section>
  );
}
