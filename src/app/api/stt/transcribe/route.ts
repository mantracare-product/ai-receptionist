import { NextRequest, NextResponse } from 'next/server';
import { handleWhisperTranscribeRequest } from '@/server/whisperStt';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await handleWhisperTranscribeRequest(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/stt/transcribe] Error:', error);
    return NextResponse.json(
      { text: '', error: String(error?.message || error) },
      { status: 500 }
    );
  }
}
