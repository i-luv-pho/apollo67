import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a pitch deck generator. You create clean, professional 7-slide pitch decks.

Your output must be a valid JSON object with this exact structure:
{
  "title": "Deck Title",
  "slides": [
    {
      "id": 1,
      "type": "title",
      "html": "<div class='slide-content slide-center'><h1>Title</h1><p class='slide-subtitle'>Subtitle</p></div>"
    }
  ],
  "sources": ["Source 1", "Source 2"]
}

SLIDE STRUCTURE (7 slides):
1. Title - Company/topic name + tagline (centered)
2. Problem - What pain point you solve (with stats)
3. Solution - Your answer to the problem
4. How - How it works (3-4 bullet points)
5. Scale - Key numbers/metrics (use stat-grid)
6. Impact - Results or benefits
7. CTA - Call to action with contact

CSS CLASSES AVAILABLE:
- .slide-content - main container
- .slide-center - centers content (for title/CTA slides)
- h1 - main title (52px Fraunces)
- h2 - section title (36px Fraunces)
- .slide-subtitle - subtitle text (22px Inter, gray)
- .label - section label (11px uppercase)
- ul/li - bullet points
- .stat-grid - 3-column grid for stats
- .stat-item, .stat-number, .stat-label - stat components
- .sources - citation at bottom

RULES:
- Every stat needs a source
- Keep text concise
- Use real data when possible
- Clean, professional tone
- NO gradients, NO icons, NO decorations

Return ONLY the JSON object, no markdown, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Create a 7-slide pitch deck about: "${topic}"

Research and include real statistics with sources. Make it professional and compelling.`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from AI");
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }

    const deckData = JSON.parse(jsonMatch[0]);

    return NextResponse.json(deckData);
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate deck" },
      { status: 500 }
    );
  }
}
