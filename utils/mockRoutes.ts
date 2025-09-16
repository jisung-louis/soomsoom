// 간단한 목 라우트 정의: method+match → handler

export type MockHandlerContext = {
  url: string;
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
};

export type MockRoute = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  match: (endpoint: string) => boolean;
  handler: (ctx: MockHandlerContext) => any | Promise<any>;
};

// 샘플 목 데이터들 (필요 시 추가/수정)
export const mockRoutes: MockRoute[] = [
  // 디바이스 로그인 (익명 토큰)
  {
    method: 'POST',
    match: (e) => e === '/auth/device',
    handler: () => ({
      accessToken: 'mock.access.token.ANON',
      refreshToken: 'mock.refresh.token.ANON',
    }),
  },
  // 소셜 로그인(테스트용 ROLE_USER)
  {
    method: 'POST',
    match: (e) => e === '/auth/social',
    handler: () => ({
      accessToken: 'mock.access.token.USER',
      refreshToken: 'mock.refresh.token.USER',
    }),
  },
  // 소유 아이템 목록
  {
    method: 'GET',
    match: (e) => e.startsWith('/users/me/owned-items'),
    handler: () => ({
      content: [],
      totalElements: 0,
      page: 1,
      size: 0,
    }),
  },
  // 아이템 카탈로그
  {
    method: 'GET',
    match: (e) => e.startsWith('/items'),
    handler: () => ({
      content: [],
      totalElements: 0,
    }),
  },
];


