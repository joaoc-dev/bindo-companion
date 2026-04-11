/** Same-origin `/api/...` URLs; use Vite proxy in dev (see WebApp vite.config). */
const baseUrl = '';

export const companionInstance = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorData: { error?: string; message?: string } =
          await response.json();
        if (errorData.error || errorData.message) {
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      }
      catch {
        // response body not JSON
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    const data = contentType?.includes('application/json')
      ? await response.json()
      : null;

    return {
      data,
      status: response.status,
      headers: response.headers,
    } as T;
  }
  catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Network error: Failed to fetch from ${fullUrl}. ${error.message}`,
      );
    }
    throw error;
  }
};

export default companionInstance;
