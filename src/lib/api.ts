export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const rawToken = localStorage.getItem("authToken");
  const token = (rawToken && rawToken !== "undefined" && rawToken !== "null" && rawToken.trim() !== "") ? rawToken.trim() : null;
  
  const headers = new Headers(init?.headers);
  if (token && typeof input === "string" && input.startsWith("/api/")) {
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let res: Response;
  try {
    res = await fetch(input, { ...init, headers });
  } catch (err) {
    // If a transient network glitch occurs on a GET request, retry once after 250ms
    if (!init?.method || init.method.toUpperCase() === "GET") {
      await new Promise(resolve => setTimeout(resolve, 250));
      res = await fetch(input, { ...init, headers });
    } else {
      throw err;
    }
  }

  if ((res.status === 401 || res.status === 403) && typeof input === "string" && !input.includes("/api/auth/login") && !input.includes("/api/auth/register")) {
    const currentToken = localStorage.getItem("authToken");
    if (currentToken) {
      console.warn(`[apiFetch] Session token invalid or expired (${res.status}). Clearing token.`);
      localStorage.removeItem("authToken");
      localStorage.removeItem("currentUser");
      window.dispatchEvent(new Event("auth_session_expired"));
    }
  }
  return res;
}
