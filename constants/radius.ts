/**
 * 숨숨 디자인 시스템 기반 radius 값 정의
 * 2px ~ 24px, 2px 단위
 */

export const radius = {
  r2: 2,
  r4: 4,
  r6: 6,
  r8: 8,
  r10: 10,
  r12: 12,
  r14: 14,
  r16: 16,
  r18: 18,
  r20: 20,
  r22: 22,
  r24: 24,
  max: 999,
} as const;

export type RadiusKey = keyof typeof radius; 