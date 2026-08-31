import { NextResponse } from "next/server";

// Open-ended search against the real YouTube catalog — used only as a
// fallback alongside the hand-curated list in lib/musicTracks.ts (never in
// place of it). safeSearch=strict + videoCategoryId=10 (Music) narrow things
// down, but unlike the curated list this isn't manually vetted, so the UI
// must label these results separately from the trusted playlist.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ results: [] });

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [], error: "YouTube qidiruvi sozlanmagan" }, { status: 200 });
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "12");
  url.searchParams.set("safeSearch", "strict");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("videoCategoryId", "10"); // Music
  url.searchParams.set("q", q);
  url.searchParams.set("key", apiKey);

  let res: Response;
  try {
    res = await fetch(url.toString());
  } catch {
    return NextResponse.json({ results: [], error: "Qidiruvda xatolik" }, { status: 200 });
  }

  if (!res.ok) {
    return NextResponse.json({ results: [], error: "Qidiruvda xatolik" }, { status: 200 });
  }

  const data = (await res.json()) as {
    items?: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }[];
  };

  const results = (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
    }));

  return NextResponse.json({ results });
}
