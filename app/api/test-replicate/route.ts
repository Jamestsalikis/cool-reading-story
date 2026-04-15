import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function GET() {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return NextResponse.json({ error: 'No REPLICATE_API_TOKEN set' });
  }

  try {
    const res = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'wait=30',
        },
        body: JSON.stringify({
          input: {
            prompt: 'a red cat sitting on a mat, watercolor illustration',
            num_outputs: 1,
            aspect_ratio: '4:3',
            output_format: 'webp',
          },
        }),
      }
    );

    const httpStatus = res.status;
    const body = await res.json();

    return NextResponse.json({
      httpStatus,
      predictionStatus: body.status,
      output: body.output,
      error: body.error,
      detail: body.detail,
      tokenPrefix: token.slice(0, 8) + '...',
    });
  } catch (err: unknown) {
    return NextResponse.json({
      fetchError: err instanceof Error ? err.message : String(err),
    });
  }
}
