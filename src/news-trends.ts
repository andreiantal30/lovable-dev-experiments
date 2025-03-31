
// Define a simple type for API handlers
type APIRoute = {
  (context: { request: Request }): Promise<Response>;
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || "ca7eb7fe6b614e7095719eb52b15f728";
    console.log("Using API key:", NEWS_API_KEY.substring(0, 5) + "...");

    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`,
      {
        headers: {
          "X-Api-Key": NEWS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch from NewsAPI");
    }

    const data = await response.json();

    return new Response(JSON.stringify(data.articles), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error("NewsAPI error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news", details: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
