
import { fetchNewsFromServer } from "@/lib/fetchNewsFromServer";
import { generateCulturalTrends } from "@/lib/generateCulturalTrends";

export async function GET() {
  try {
    console.log("⚡ API endpoint: Fetching news trends...");
    const headlines = await fetchNewsFromServer();
    console.log(`📰 Fetched ${headlines.length} headlines`);
    
    const trends = await generateCulturalTrends(headlines);
    console.log(`🧠 Generated ${trends.length} cultural trends`);

    return new Response(JSON.stringify(trends), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate news trends", details: String(e) }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
