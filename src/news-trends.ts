
// Define a simple type for API handlers
type APIRoute = {
  (context: { request: Request }): Promise<Response>;
};

export const GET: APIRoute = async ({ request }) => {
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

  const response = await fetch(
    `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${NEWS_API_KEY}`,
      },
    }
  );

  const data = await response.json();

  return new Response(JSON.stringify(data.articles), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
