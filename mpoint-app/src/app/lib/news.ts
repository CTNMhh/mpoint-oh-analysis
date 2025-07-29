export type News = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  date: Date;
  author?: string;
  category?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  readTime?: string; // Lesedauer
};

export async function getNews() {
  try {
    const response = await fetch('/api/news', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const news: News[] = await response.json();
    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export async function createNews(newsData: Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'isPublished'>) {
  try {
    const response = await fetch('/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newsData),
    });

    if (!response.ok) {
      throw new Error('Failed to create news');
    }

    const news: News = await response.json();
    return news;
  } catch (error) {
    console.error('Error creating news:', error);
    throw error;
  }
}
