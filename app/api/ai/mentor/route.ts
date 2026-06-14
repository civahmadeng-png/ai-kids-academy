import { type NextRequest } from 'next/server';
import { handleAIRequest } from '@/lib/server/ai-handler';

export const runtime = 'nodejs';
export const maxDuration = 35; // seconds

export async function POST(req: NextRequest) {
  return handleAIRequest(req);
}
