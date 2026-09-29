import { NextRequest, NextResponse } from 'next/server';
import { handleWhisperTranscribeRequest } from '@/server/whisperStt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await handleWhisperTranscribeRequest(body);
    if (result.error) {
      return NextResponse.json(result, { status: result.upstreamStatus || 500 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/stt/transcribe] Route error:', error);
    return NextResponse.json(
      { text: '', error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
