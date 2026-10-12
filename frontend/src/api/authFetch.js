
const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "student_progress_google_token";

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

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });
}
