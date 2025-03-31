
import { fetchNewsFromServer } from "@/lib/fetchNewsFromServer";
import { generateCulturalTrends, CulturalTrend } from "@/lib/generateCulturalTrends";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    console.log("⚡ API endpoint: Fetching news trends...");
    
    // Direct server-side call to NewsAPI using environment variable
    const apiKey = import.meta.env.VITE_NEWS_API_KEY || "ca7eb7fe6b614e7095719eb52b15f728";
    console.log("🔑 Using API key:", apiKey.substring(0, 5) + "...");
    
    // Multiple fallback approaches
    let headlines = [];
    let error = null;
    
    // Try the first approach - direct API call
    try {
      const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey=${apiKey}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📰 Fetched ${data.articles.length} headlines from NewsAPI`);
        
        // Map to consistent format
        headlines = data.articles.map((article: any) => ({
          title: article.title || "Untitled",
          source: article.source?.name || "Unknown Source",
          publishedAt: article.publishedAt || new Date().toISOString(),
        }));
      } else {
        error = `NewsAPI responded with status: ${response.status}`;
        console.error(error);
      }
    } catch (err) {
      error = `Failed to fetch from NewsAPI: ${err}`;
      console.error(error);
    }
    
    // If no headlines and we have a server utility, try that
    if (headlines.length === 0 && typeof fetchNewsFromServer === 'function') {
      try {
        console.log("🔄 Attempting to fetch through server utility...");
        const serverHeadlines = await fetchNewsFromServer();
        if (Array.isArray(serverHeadlines) && serverHeadlines.length > 0) {
          console.log(`📰 Fetched ${serverHeadlines.length} headlines from server utility`);
          headlines = serverHeadlines;
        }
      } catch (serverError) {
        console.error("❌ Server utility failed:", serverError);
      }
    }
    
    // If still no headlines, use sample data as last resort
    if (headlines.length === 0) {
      console.log("⚠️ Using sample headlines as fallback");
      headlines = generateSampleHeadlines();
    }
    
    // Now generate cultural trends from whatever headlines we have
    const trends = await generateCulturalTrends(headlines);
    console.log(`🧠 Generated ${trends.length} cultural trends`);
    
    // Ensure each trend follows the CulturalTrend interface
    const formattedTrends: CulturalTrend[] = trends.map(trend => ({
      id: trend.id || uuidv4(),
      title: trend.title,
      description: trend.description,
      source: trend.source || "NewsAPI",
      platformTags: trend.platformTags || [],
      category: trend.category || "Uncategorized",
      addedOn: trend.addedOn instanceof Date ? trend.addedOn : new Date(),
    }));

    return new Response(JSON.stringify(formattedTrends), {
      headers: { 
        "Content-Type": "application/json",
        // Add CORS headers to allow browser requests
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      status: 200,
    });
  } catch (e) {
    console.error("❌ API error:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate news trends", details: String(e) }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          // Add CORS headers to allow error responses
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    );
  }
}

// Function to generate sample headlines as a last resort
function generateSampleHeadlines() {
  return [
    {
      title: "Global Tech Giants Announce Collaboration on AI Safety Standards",
      source: "Tech Today",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Study Shows Rising Interest in Sustainable Products Among Gen Z",
      source: "Market Watch",
      publishedAt: new Date().toISOString()
    },
    {
      title: "New Social Media Platform Focuses on Mental Health and Wellbeing",
      source: "Digital Trends",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Remote Work Culture Continues to Evolve Post-Pandemic",
      source: "Work Life",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Experts Warn of Growing Digital Divide in Education",
      source: "Education Weekly",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Music Industry Sees Shift as Independent Artists Gain Market Share",
      source: "Music Insider",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Plant-Based Food Market Experiences Record Growth",
      source: "Food Industry News",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Researchers Develop New Biodegradable Plastic Alternative",
      source: "Science Daily",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Visual Storytelling Becoming Essential for Brand Marketing",
      source: "Marketing Trends",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Health Wearables Market to Double in Size by Next Year",
      source: "Health Tech",
      publishedAt: new Date().toISOString()
    }
  ];
}

// Add OPTIONS handler for CORS preflight requests
export function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    },
    status: 204
  });
}
