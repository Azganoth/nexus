export type AccessToken = string | null;

let accessToken: AccessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function storeAccessToken(token: AccessToken): void {
  accessToken = token;
}
