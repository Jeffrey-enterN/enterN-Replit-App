import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { 
  addMobileAuthToRequest, 
  saveMobileToken, 
  getMobileToken,
  clearMobileToken, 
  isIOSDevice, 
  isMobileDevice 
} from './mobile-auth-helper';

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
    
    // If unauthorized on a mobile device, clear the mobile token
    if (res.status === 401 && isMobileDevice()) {
      console.log('Unauthorized response - clearing mobile token');
      clearMobileToken();
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
  try {
    // Prepare headers with content type if data is provided
    const headers: Record<string, string> = data 
      ? { "Content-Type": "application/json" } 
      : {};
    
    // Add request ID for tracing issues
    const requestId = `req_${Math.random().toString(36).substring(2, 10)}`;
    headers['X-Request-ID'] = requestId;
    
    // Add mobile auth token to request headers if on mobile
    const requestOptions = addMobileAuthToRequest({
      method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include", // Important for cookies to be sent
    });
    
    // Add enhanced logging for debugging
    if (isMobileDevice()) {
      const token = getMobileToken();
      console.log(`[${requestId}] Making ${method} request to ${url}`, { 
        hasMobileToken: !!token,
        hasData: !!data
      });
    }
    
    const res = await fetch(url, requestOptions);
    
    // Handle auth token from response for mobile devices
    if (isMobileDevice()) {
      try {
        // Attempt to parse the response to check for mobile token
        const clonedRes = res.clone();
        const jsonData = await clonedRes.json();
        
        // If the response contains a mobile token in the metadata, save it
        if (jsonData && jsonData._meta && jsonData._meta.mobileToken) {
          console.log(`[${requestId}] Mobile authentication token received`);
          saveMobileToken(jsonData._meta.mobileToken);
        }
      } catch (e) {
        // Silently fail - not all responses will be JSON or have tokens
        if (isMobileDevice()) {
          console.log(`[${requestId}] Response couldn't be parsed as JSON (normal for some endpoints)`);
        }
      }
    }

    // If response is not ok, enhance error handling
    if (!res.ok) {
      console.error(`[${requestId}] API request failed: ${method} ${url} - Status: ${res.status}`);
    }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Add mobile auth token to request headers if on mobile
    const requestOptions = addMobileAuthToRequest({
      credentials: "include"
    });
    
    try {
      const res = await fetch(queryKey[0] as string, requestOptions);
      
      // Handle auth token from response for mobile devices
      if (isMobileDevice() && res.ok) {
        try {
          // Attempt to parse the response to check for mobile token
          const clonedRes = res.clone();
          const data = await clonedRes.json();
          
          // If the response contains a mobile token in the metadata, save it
          if (data && data._meta && data._meta.mobileToken) {
            console.log('Mobile authentication token received from query');
            saveMobileToken(data._meta.mobileToken);
          }
          
          // Return the original parsed data
          await throwIfResNotOk(res);
          return data;
        } catch (e) {
          // If JSON parsing fails, continue with normal flow
        }
      }

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        if (isMobileDevice()) {
          console.log('Unauthorized in query - clearing mobile token');
          clearMobileToken();
        }
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error (${queryKey[0]}):`, error);
      throw error;
    }
  };

// Helper to detect if we're on iOS
const isIOS = typeof window !== 'undefined' ? 
  /iPad|iPhone|iPod/.test(navigator.userAgent) : false;

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
