import type { NextRequest } from 'next/server';

import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  const {
    apiKey: key,
    model = 'claude-3-haiku-20240307',
    prompt,
    system,
  } = body;

  const apiKey = key || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing Anthropic API key. Please set ANTHROPIC_API_KEY in your environment variables or provide it in the request.' },
      { status: 401 }
    );
  }

  const anthropic = createAnthropic({ apiKey });

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: anthropic(model),
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}
