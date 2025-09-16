// 간단한 JWT 디코더 (header.payload.signature 형식에서 payload만 파싱)
// 실패 시 null 반환

export interface JwtPayload {
  [key: string]: any;
}

function base64UrlDecode(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '==='.slice(0, (4 - (base64.length % 4)) % 4);
    if (typeof atob === 'function') {
      // RN 환경에서도 atob가 폴리필되어 있는 경우가 있음
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(padded), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
    }
    // Node-like 환경 처리
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const buff = require('buffer').Buffer.from(padded, 'base64');
    return buff.toString('utf8');
  } catch {
    return '';
  }
}

export function decodeJwt(token: string | null | undefined): JwtPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}


