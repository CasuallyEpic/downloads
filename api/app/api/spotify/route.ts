import { NextRequest, NextResponse } from 'next/server';
import {
  validateUrlParam,
  getSongDetails,
  downloadSong,
  encodeRFC5987ValueChars,
} from '../../../lib/spotify-utils';

// GET /api/spotify?action=get-details&url=...
// GET /api/spotify?action=download&url=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    if (action === 'get-details') {
      const data = await getSongDetails(url);
      if (data.error) {
        return NextResponse.json(
          { error: data.message },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, ...data });
    }

    if (action === 'download') {
      const songDetails = await getSongDetails(url);
      if (songDetails.error) {
        return NextResponse.json(
          { error: songDetails.message },
          { status: 500 }
        );
      }

      const song = songDetails.songs?.[0];
      let filename = 'song.mp3';

      if (song?.title) {
        const sanitizedTitle = song.title
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
          .trim();
        filename = `${sanitizedTitle}.mp3`;
      }

      const response = await downloadSong(url);
      if (response.error) {
        return NextResponse.json(
          { error: response.message },
          { status: 500 }
        );
      }

      const headers = new Headers();
      for (const [key, value] of (response as any).headers?.entries?.() || []) {
        if (key.toLowerCase() !== 'content-disposition') {
          headers.set(key, value);
        }
      }

      const encodedFilename = encodeRFC5987ValueChars(filename);
      const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '') || 'song.mp3';

      headers.set(
        'Content-Disposition',
        `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
      );
      headers.set(
        'Content-Type',
        (response as any).headers?.get?.('content-type') || 'audio/mpeg'
      );
      headers.set('Access-Control-Allow-Origin', '*');

      return new NextResponse((response as any).body, {
        status: (response as any).status || 200,
        headers,
      });
    }

    return NextResponse.json(
      { message: 'Spotify API - use ?action=get-details&url=... or ?action=download&url=...' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}