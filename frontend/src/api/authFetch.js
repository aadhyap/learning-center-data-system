
const API_URL = "http://127.0.0.1:8000";

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
