import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = '';
    
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } else {
        // Fallback to plain text
        errorMessage = await res.text();
      }
    } catch (e) {
      // If JSON parsing fails, get text
      errorMessage = res.statusText;
    }
    
    // Provide a more user-friendly message
    throw new Error(errorMessage || `Error ${res.status}: Please try again later`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Helper to detect if we're on iOS
const isIOS = typeof window !== 'undefined' ? 
  /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream : false;

// Helper to detect if we're on any mobile device
const isMobile = typeof window !== 'undefined' ? 
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) : false;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // Enable window focus refetching on mobile devices to refresh state after app switches
      refetchOnWindowFocus: isMobile,
      // Mobile devices should have a shorter stale time to avoid persistence issues
      staleTime: isMobile ? 5 * 60 * 1000 : Infinity, // 5 minutes for mobile, infinite for desktop
      // Add retries for mobile to handle temporary connection drops
      retry: isMobile ? 2 : false,
      // Add a retry delay for mobile to avoid hammering the server
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    },
    mutations: {
      // Mobile needs retries to handle potential connection issues
      retry: isMobile ? 1 : false,
    },
  },
});
