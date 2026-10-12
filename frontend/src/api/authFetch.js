const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "googleToken";

let googleToken = sessionStorage.getItem(TOKEN_KEY);

export function getAuthToken() {
  return googleToken;
}

export function setAuthToken(token) {
  googleToken = token;

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
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

  if (response.status === 401) {
    setAuthToken(null);
    window.location.reload();
  }

  return response;
}
