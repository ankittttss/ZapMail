const API_BASE_URL = 'http://localhost:5000/app';
const SEARCH_API_URL = `${API_BASE_URL}/search`;
const GET_ALL_API_URL = `${API_BASE_URL}/getAll`;

export const fetchEmails = async (page: number, limit: number) => {
  const response = await fetch(`${GET_ALL_API_URL}?page=${page}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch emails');
  }
  
  return await response.json();
};

// Search across entire database
const buildSearchUrl = (baseUrl: string, filters: Record<string, string | undefined>): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') {
      params.append(key, value);
    }
  });
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

// Option 1: Server-side pagination for search results
export const searchEmails = async (filters: {
  from?: string;
  to?: string;
  category?: string;
  subject?: string;
  page?: number;
  limit?: number;
}) => {
  const { page = 1, limit = 10, ...searchFilters } = filters;
  const url = buildSearchUrl(SEARCH_API_URL, {
    ...searchFilters,
    page: page.toString(),
    limit: limit.toString()
  });
  
  const response = await fetch(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to search emails');
  }
  
  return await response.json();
};