const TOKEN_KEY = "todo_app_auth_token";
const EXP_KEY = "todo_app_auth_exp";

function getJwtExpSeconds(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(atob(payload));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

export function saveToken(token: string, expiresInSeconds: number): void {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expFromApi = nowSeconds + expiresInSeconds;
  const expFromJwt = getJwtExpSeconds(token);
  const effectiveExp = expFromJwt ?? expFromApi;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXP_KEY, String(effectiveExp));
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXP_KEY);
}

export function getToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const expRaw = localStorage.getItem(EXP_KEY);
  if (!token || !expRaw) return null;
  const exp = Number(expRaw);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(exp) || exp <= nowSeconds) {
    clearToken();
    return null;
  }
  return token;
}
