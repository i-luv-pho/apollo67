"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import "./deck.css";

interface Slide {
  id: number;
  type: string;
  html: string;
}

interface DeckData {
  title: string;
  slides: Slide[];
  sources: string[];
}

function DeckContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") || "";

  const [deck, setDeck] = useState<DeckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Generate deck on mount
  useEffect(() => {
    if (!topic) {
      setError("No topic provided");
      setLoading(false);
      return;
    }

    const generateDeck = async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate deck");
        }

        const data = await response.json();
        setDeck(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    generateDeck();
  }, [topic]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!deck) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, deck.slides.length));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 1));
      }
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      }
    },
    [deck, isFullscreen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const nextSlide = () => {
    if (deck) setCurrentSlide((prev) => Math.min(prev + 1, deck.slides.length));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1
          className="text-4xl font-semibold mb-4"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Generating your deck...
        </h1>
        <p className="text-[var(--text-muted)]">{topic}</p>
        <div className="mt-8 w-8 h-8 border-2 border-[var(--text)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-red-600 mb-4">Error</h1>
        <p className="text-[var(--text-muted)]">{error}</p>
        <a
          href="/"
          className="mt-8 px-6 py-3 bg-[var(--text)] text-white rounded-lg"
        >
          Try Again
        </a>
      </div>
    );
  }

  if (!deck) return null;

  return (
    <div className={`min-h-screen flex flex-col ${isFullscreen ? "bg-black" : ""}`}>
      {/* Toolbar */}
      <header
        className={`fixed top-0 left-0 right-0 h-16 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between px-5 z-50 transition-opacity ${
          isFullscreen ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
          >
            Deck
          </span>
          <div className="w-px h-6 bg-[var(--border)]" />
          <span className="text-lg">{deck.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert("PNG export coming soon!")}
            className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded hover:bg-[var(--bg)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            PNG
          </button>
          <button
            onClick={() => alert("PPTX export coming soon!")}
            className="px-4 py-2 text-sm font-medium border border-[var(--border)] rounded hover:bg-[var(--bg)] flex items-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            PPTX
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Beta</span>
          </button>
        </div>
      </header>

      {/* Viewer */}
      <main
        className={`flex-1 flex items-center justify-center ${
          isFullscreen ? "p-0 bg-black" : "py-24 px-16"
        }`}
        onClick={nextSlide}
      >
        <div
          className={`relative w-full ${
            isFullscreen ? "max-w-full max-h-full" : "max-w-4xl"
          } aspect-video`}
        >
          {deck.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-white rounded shadow-lg overflow-hidden transition-all duration-300 ${
                index + 1 === currentSlide
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-[0.98] pointer-events-none"
              } ${isFullscreen ? "rounded-none shadow-none" : ""}`}
              dangerouslySetInnerHTML={{ __html: slide.html }}
              style={{
                padding: "60px 70px",
                display: "flex",
                flexDirection: "column",
              }}
            />
          ))}
        </div>
      </main>

      {/* Navigation */}
      <nav
        className={`fixed bottom-0 left-0 right-0 h-14 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-center gap-4 z-50 transition-opacity ${
          isFullscreen ? "opacity-0 pointer-events-none" : ""
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm text-[var(--text-muted)] min-w-[70px] text-center">
          <strong className="text-[var(--text)] font-semibold">{currentSlide}</strong> / {deck.slides.length}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        <div className="absolute right-5 flex items-center gap-4 text-xs text-[var(--text-dim)]">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-muted)]">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-muted)]">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-muted)]">F</kbd>
            Fullscreen
          </span>
        </div>
      </nav>
    </div>
  );
}

export default function DeckPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--text)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DeckContent />
    </Suspense>
  );
}
