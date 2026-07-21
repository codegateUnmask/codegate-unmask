const KEY = 'unmask_client_token';

export function getClientToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(KEY);
  if (!token) {
    token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(KEY, token);
  }
  return token;
}
