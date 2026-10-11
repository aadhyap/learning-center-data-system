const API_URL = import.meta.env.VITE_API_URL;

let googleToken = null;

export function setAuthToken(token) {
  googleToken = token;
}

export async function authFetch(path, options = {}) {
  const headers = new Headers(options.headers);

  if (googleToken) {
    headers.set("Authorization", `Bearer ${googleToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  return response;
}
