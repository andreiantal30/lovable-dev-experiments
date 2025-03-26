export async function fetchNewsFromServer() {
    const apiKey = import.meta.env.VITE_NEWS_API_KEY; // use your .env
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?language=en&pageSize=30`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );
    const json = await response.json();
    return json.articles;
  }
  