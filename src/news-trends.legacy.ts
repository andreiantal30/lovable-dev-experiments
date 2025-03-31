// Define a simple type for API handlers
type APIRoute = {
  (context: { request: Request }): Promise<Response>;
};

// NEW: Redirect to internal API instead of NewsAPI.org directly
export const GET: APIRoute = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/news"); // adjust port if different
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch from internal News API");
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Proxy NewsAPI error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch news from backend", details: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

// Optional: Allow preflight
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