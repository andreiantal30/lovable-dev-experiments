import { fetchNewsFromServer } from "@/lib/fetchNewsFromServer";
import { generateCulturalTrends } from "@/lib/generateCulturalTrends";

export async function GET() {
  try {
    const headlines = await fetchNewsFromServer();
    const trends = await generateCulturalTrends(headlines);

    return new Response(JSON.stringify(trends), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate news trends", details: e }),
      { status: 500 }
    );
  }
}
