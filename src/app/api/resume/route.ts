/**
 * POST /api/resume
 *
 * Analyzes a resume using the LLM. Accepts either:
 *   { text: string, targetRole?: string }   — pre-extracted resume text
 *   { content: string, targetRole?: string } — alias for text
 *
 * Returns a structured ATS review:
 *   { atsScore, strengths[], weaknesses[], suggestions[], improvedBullets[], fullReport }
 *
 * The full report is a markdown document. The structured fields are parsed
 * from the model's response.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { completeChat } from "@/lib/ai";
import { getPersonality } from "@/lib/personalities";
import { trackEvent, estimateTokens } from "@/lib/analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_RESUME_LENGTH = 20000;

const RESUME_SYSTEM = `You are an expert ATS resume reviewer and recruiter.
When given a resume, you MUST respond with EXACTLY two sections in this format:

===JSON===
{a single valid JSON object}
===END===

The JSON object must have these keys:
- atsScore: integer 0-100
- strengths: array of short strings
- weaknesses: array of short strings
- suggestions: array of actionable strings
- improvedBullets: array of strings, each a rewritten impactful bullet

After the JSON block, write a detailed markdown report with headings:
## ATS Score
## Strengths
## Weaknesses
## Keyword Gaps
## Improved Bullet Points
## Priority Action List

Be specific and reference the actual resume content. Do not include any text before ===JSON===.`;

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const resumeText = (body.text ?? body.content ?? "").trim();
    const targetRole = (body.targetRole ?? "").trim();

    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }
    if (resumeText.length > MAX_RESUME_LENGTH) {
      return NextResponse.json(
        { error: `Resume too long (max ${MAX_RESUME_LENGTH} chars)` },
        { status: 413 }
      );
    }

    const userPrompt = `Target role: ${targetRole || "Software Engineer (general)"}\n\nResume:\n${resumeText}\n\nAnalyze this resume for ATS compatibility and provide your response in the required format.`;

    const personality = getPersonality("resume");

    const responseText = await completeChat([
      { role: "system", content: `${personality.systemPrompt}\n\n${RESUME_SYSTEM}` },
      { role: "user", content: userPrompt },
    ]);

    // Parse the structured JSON block
    let parsed: {
      atsScore: number;
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      improvedBullets: string[];
    } | null = null;

    const jsonMatch = responseText.match(/===JSON===\s*([\s\S]*?)\s*===END===/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[1].trim());
      } catch {
        /* ignore parse error, fall back to defaults */
      }
    }

    // The full report is everything after the END marker, or the whole text.
    let fullReport = responseText;
    if (jsonMatch) {
      const afterEnd = responseText.split("===END===");
      if (afterEnd.length > 1) fullReport = afterEnd.slice(1).join("===END===").trim();
    }

    const atsScore = clamp(parsed?.atsScore ?? 0, 0, 100);
    const strengths = ensureArray(parsed?.strengths);
    const weaknesses = ensureArray(parsed?.weaknesses);
    const suggestions = ensureArray(parsed?.suggestions);
    const improvedBullets = ensureArray(parsed?.improvedBullets);

    // Persist document + analysis (no user linking in this demo)
    const doc = await db.document.create({
      data: {
        name: targetRole ? `Resume — ${targetRole}` : "Resume",
        type: "resume",
        mimeType: "text/plain",
        size: resumeText.length,
        content: resumeText,
      },
    });

    const analysis = await db.resumeAnalysis.create({
      data: {
        documentId: doc.id,
        atsScore,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        suggestions: JSON.stringify(suggestions),
        improvedBullets: JSON.stringify(improvedBullets),
        fullReport,
      },
    });

    await trackEvent({
      event: "resume_analyzed",
      mentor: "resume",
      tokensUsed: estimateTokens(resumeText) + estimateTokens(responseText),
      responseMs: Date.now() - startedAt,
      metadata: { analysisId: analysis.id, atsScore },
    });

    return NextResponse.json({
      analysisId: analysis.id,
      atsScore,
      strengths,
      weaknesses,
      suggestions,
      improvedBullets,
      fullReport,
    });
  } catch (e) {
    console.error("[/api/resume POST]", e);
    return NextResponse.json(
      { error: "Failed to analyze resume. Please try again." },
      { status: 500 }
    );
  }
}

function clamp(n: number, min: number, max: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function ensureArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => typeof x === "string")
    .map((x) => (x as string).slice(0, 500))
    .slice(0, 30);
}
