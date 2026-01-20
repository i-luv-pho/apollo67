"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    router.push(`/deck?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <h1
          className="text-6xl font-semibold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Deck
        </h1>

        {/* Tagline */}
        <p className="text-xl text-[var(--text-muted)] mb-12">
          AI-powered pitch decks in seconds
        </p>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic (e.g., Sustainable Energy)"
              className="w-full px-6 py-4 text-lg border border-[var(--border)] rounded-lg bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--text)] focus:border-transparent transition-all"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full px-6 py-4 text-lg font-medium bg-[var(--text)] text-white rounded-lg hover:bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Generating..." : "Generate Deck"}
            </button>
          </div>
        </form>

        {/* Examples */}
        <div className="mt-12">
          <p className="text-sm text-[var(--text-dim)] mb-4">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Sustainable Energy", "AI Startup", "Coffee Shop Business", "University Overview"].map((example) => (
              <button
                key={example}
                onClick={() => setTopic(example)}
                className="px-4 py-2 text-sm border border-[var(--border)] rounded-full hover:bg-[var(--surface)] transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
