"use server";

export async function fetchOpenGraphData(url: string): Promise<{ title?: string; description?: string; image?: string } | null> {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return null;
  } catch (e) {
    return null;
  }


  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BOU-Study-Pilot-Bot/1.0',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) return null;
    const html = await response.text();

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i) || html.match(/<meta name="description" content="([^"]+)"/i);
    const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);

    return {
      title: titleMatch ? titleMatch[1] : undefined,
      description: descMatch ? descMatch[1] : undefined,
      image: imgMatch ? imgMatch[1] : undefined,
    };
  } catch (error) {
    console.error("Failed to fetch OG data for", url, error);
    return null;
  }
}
