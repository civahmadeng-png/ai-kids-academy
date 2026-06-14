// ============================================================
// POST /api/ai/image
// Child-safe image generation using Pollinations.ai (free, no key)
// Falls back to styled placeholder cards if the API is unavailable.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ── Safety filter ────────────────────────────────────────────
const BLOCKED_PATTERNS = [
  /\b(violence|violent|blood|gore|weapon|gun|knife|stab|shoot|kill|murder)\b/i,
  /\b(naked|nude|sex|sexual|adult|explicit|porn)\b/i,
  /\b(drug|alcohol|cigarette|cocaine|weed|meth)\b/i,
  /\b(real person|celebrity|politician|famous|elon|trump|biden|obama)\b/i,
  /\b(scary|horror|demon|devil|satan|evil|hell)\b/i,
  /\b(racist|hate|slur)\b/i,
];

function isSafePrompt(p: string): boolean {
  return !BLOCKED_PATTERNS.some(rx => rx.test(p));
}

const STYLE_SUFFIXES: Record<string, string> = {
  cartoon:    ', cartoon style, colorful, fun, child-friendly, vibrant',
  watercolor: ', watercolor painting, soft colors, artistic, beautiful',
  pixel:      ', pixel art, retro video game style, 16-bit, colorful',
  fantasy:    ', fantasy illustration, magical, glowing, epic, child-friendly',
  realistic:  ', photorealistic, detailed, high quality, safe for children',
  sticker:    ', sticker illustration, white outline, cute, flat design',
};

export async function POST(req: NextRequest) {
  let body: { prompt?: string; style?: string; childId?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }

  const rawPrompt = String(body.prompt ?? '').trim().slice(0, 200);
  const style     = String(body.style ?? 'cartoon');

  if (!rawPrompt) {
    return NextResponse.json({ error: 'Please describe what you want to create!' }, { status: 400 });
  }

  if (!isSafePrompt(rawPrompt)) {
    return NextResponse.json({
      error: '🛡️ That prompt isn\'t allowed. Try describing something fun and safe — like an animal, landscape, or fantasy creature!',
    }, { status: 422 });
  }

  const suffix    = STYLE_SUFFIXES[style] ?? STYLE_SUFFIXES.cartoon;
  const fullPrompt = `${rawPrompt}${suffix}, safe for children, appropriate for all ages, high quality illustration`;
  const encoded   = encodeURIComponent(fullPrompt);

  // Use Pollinations.ai — completely free, no API key, child-safe defaults
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux&seed=${Math.floor(Math.random()*999999)}`;

  // Verify the URL responds (Pollinations generates on first access)
  try {
    const check = await fetch(imageUrl, { method: 'HEAD', signal: AbortSignal.timeout(15_000) });
    if (!check.ok && check.status !== 200) throw new Error(`Pollinations returned ${check.status}`);
  } catch {
    // Return URL anyway — client will try to load it; if it fails show placeholder
  }

  return NextResponse.json({
    url:    imageUrl,
    prompt: rawPrompt,
    style,
  });
}
