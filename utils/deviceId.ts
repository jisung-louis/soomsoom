import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

/**
 * ----------------------------------------------------------------------------
 * deviceId.ts
 * ----------------------------------------------------------------------------
 * 목적
 *  - "설치 1회" 동안 쓸 고유 ID(install UUID)를 생성/저장/재사용한다.
 *  - 앱이 처음 실행되면 UUID를 만들어 안전한 저장소에 보관하고,
 *    이후에는 같은 값을 계속 제공한다(메모리 캐시 + 영구 저장소).
 *
 * 저장 위치(플랫폼별)
 *  - iOS: expo-secure-store → iOS Keychain 사용
 *          • 기기 잠금 해제 후 접근 가능(AFTER_FIRST_UNLOCK)
 *          • **참고:** iOS 환경/백업/복원 시나리오에 따라 앱 삭제 후에도
 *            Keychain 데이터가 남아 있을 수 있다(항상 보장 X)
 *  - Android: expo-secure-store → EncryptedSharedPreferences
 *             • 앱 삭제 시 데이터 삭제(= 재설치하면 새 UUID)
 *  - Web: SecureStore 미지원일 수 있어 AsyncStorage로 폴백
 *
 * 핵심 포인트
 *  1) 보안 저장소가 가능하면 거기에 우선 저장(가능하면 SecureStore, 아니면 AsyncStorage)
 *  2) RFC4122 v4 형식의 고품질 랜덤 UUID 생성(Expo Crypto 사용)
 *  3) in-flight Promise 공유로 동시 초기화 경쟁 조건 방지
 *  4) 메모리 캐시(uuidCache)로 불필요한 IO 최소화
 *
 * 주의
 *  - 이 ID는 "설치 단위" 식별자다. 사용자를 영구 식별하려면 반드시 "로그인 계정"과
 *    서버 매핑을 사용하자. (재설치 후 같은 사용자 연결은 계정이 책임)
 *  - 테스트 시 새 설치처럼 만들고 싶으면 clearInstallUuid()를 사용(프로덕션 노출 주의)
 */

const KEY = 'deviceUUID';

// 같은 런타임에서 재호출 시 저장소 접근을 피하기 위한 메모리 캐시
let uuidCache: string | null = null;

// 앱 시작 직후 여러 곳에서 동시에 초기화 호출해도 1회만 실제 작업되도록 공유하는 Promise
let inFlight: Promise<string> | null = null;

/**
 * 현재 환경에서 SecureStore를 쓸 수 있는지 확인한다.
 * - Web/에뮬레이터/특정 환경에서는 false가 될 수 있음 → AsyncStorage 폴백 사용
 */
async function storageIsSecureAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * 주어진 key/value를 우선 SecureStore(가능한 경우)에, 아니면 AsyncStorage에 저장한다.
 * - iOS에서는 Keychain 접근 레벨을 AFTER_FIRST_UNLOCK로 지정(디바이스 잠금 해제 후 접근 가능)
 *   • 이 옵션은 **iOS에서만 의미**가 있으며, Android/Web에서는 무시된다.
 */
async function saveItem(key: string, value: string) {
  const secure = await storageIsSecureAvailable();
  if (secure) {
    try {
      await SecureStore.setItemAsync(key, value, {
        // iOS only: 첫 잠금 해제 이후 접근 가능. 앱 실행 시점 접근성/안정성의 무난한 선택지.
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
      });
      return;
    } catch {
      // SecureStore 저장 실패 시 아래 AsyncStorage로 폴백
    }
  }
  await AsyncStorage.setItem(key, value);
}

/**
 * 저장된 값을 읽는다. 가능하면 SecureStore에서 읽고, 없거나 실패하면 AsyncStorage에서 읽는다.
 */
async function getItem(key: string): Promise<string | null> {
  const secure = await storageIsSecureAvailable();
  if (secure) {
    try {
      const v = await SecureStore.getItemAsync(key);
      if (v) return v;
    } catch {
      // 무시하고 AsyncStorage 시도
    }
  }
  return await AsyncStorage.getItem(key);
}

/**
 * RFC4122 v4 UUID 생성.
 * - 16바이트 랜덤 생성 → 버전/버전트 비트 세팅 → 8-4-4-4-12 형식 문자열로 변환
 * - Math.random()이 아닌 고품질 난수(Expo Crypto) 사용으로 충돌 확률 최소화
 */
async function generateUuidV4(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  // set version(4) & variant(10xx)
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/**
 * 저장된 UUID가 있으면 반환, 없으면 새로 생성 후 저장하여 반환.
 * - 예외 발생 시, 플랫폼/시간 기반의 간단한 대체 문자열을 반환(로그인 등 앱 흐름 차단 방지)
 */
export async function getOrCreateInstallUuid(): Promise<string> {
  try {
    const exists = await getItem(KEY);
    if (exists) {
      // 기존에 저장된 값이 전체 UUID인 경우 8자로 정규화하여 반환
      return exists.length > 8 ? exists.slice(0, 8) : exists;
    }

    const id = await generateUuidV4();
    const shortId = id.slice(0, 8);
    await saveItem(KEY, shortId);
    return shortId;
  } catch {
    // 예외 발생 시 간단한 8자리 fallback 반환
    const fallbackShort = String(Date.now()).slice(-8);
    // 캐시 일관성 유지: 예외 시에도 같은 런타임에서는 동일 문자열을 돌려준다.
    uuidCache = fallbackShort;
    return fallbackShort;
  }
}

/**
 * 설치 UUID 초기화(최초 1회 IO) + 메모리 캐시 세팅.
 * - 동시 호출 시 inFlight Promise를 공유하여 경쟁 조건 방지
 */
export async function initInstallUuid(): Promise<string> {
  if (uuidCache) return uuidCache;      // 이미 캐시가 있으면 즉시 반환
  if (inFlight) return inFlight;        // 초기화 진행 중이면 같은 Promise 공유

  inFlight = (async () => {
    const local = await getOrCreateInstallUuid();
    uuidCache = local;                  // 메모리 캐시 세팅
    inFlight = null;                    // 초기화 완료 표시
    return local;
  })();

  return inFlight;
}

/**
 * 가능한 한 빠르게(캐시 우선) 설치 UUID를 얻는다.
 * - 캐시가 없으면 저장소에서 읽어오고, 거기에도 없으면 initInstallUuid()로 생성
 */
export async function getCachedInstallUuid(): Promise<string> {
  if (uuidCache) return uuidCache;

  const saved = await getItem(KEY);
  if (saved) {
    const normalized = saved.length > 8 ? saved.slice(0, 8) : saved;
    // 저장된 값이 길다면 8자로 정규화하여 저장소에 반영(일관성 유지)
    if (normalized !== saved) {
      await saveItem(KEY, normalized);
    }
    uuidCache = normalized;
    return normalized;
  }
  return initInstallUuid();
}

/**
 * (테스트/디버그 전용) 저장된 설치 UUID 제거.
 * - iOS에서는 Keychain에서 먼저 삭제 시도 후, AsyncStorage도 정리
 * - 프로덕션에서는 노출/사용 주의(사용자 식별에 영향 가능)
 */
export async function clearInstallUuid() {
  const secure = await storageIsSecureAvailable();
  if (secure) {
    try {
      await SecureStore.deleteItemAsync(KEY);
    } catch {}
  }
  await AsyncStorage.removeItem(KEY);
  uuidCache = null;
}

/**
 * 소셜 로그아웃 등 특정 시점에 설치 UUID를 회전(재발급)한다.
 * - 기존 저장된 UUID를 제거한 뒤 새 UUID를 생성/저장하여 반환한다.
 */
export async function rotateInstallUuid(): Promise<string> {
  await clearInstallUuid();
  return initInstallUuid();
}