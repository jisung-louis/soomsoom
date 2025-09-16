import { apiClient } from './apiClient';
import { environmentConfig } from '../configs/environment';
import { Platform, Linking, Alert } from 'react-native';
import * as Application from 'expo-application';

// 서버에서 받는 버전 정보 타입
export interface VersionInfo {
  currentVersion: string;           // 현재 최신 버전
  minSupportedVersion: string;     // 최소 지원 버전
  forceUpdate: boolean;            // 강제 업데이트 여부
  updateMessage?: string;          // 업데이트 메시지
  storeUrl: {
    ios?: string;                  // iOS 앱스토어 URL
    android?: string;              // Android 플레이스토어 URL
  };
}

// 앱 버전 정보 타입
export interface AppVersionInfo {
  version: string;                 // 현재 앱 버전
  buildNumber: string;             // 빌드 번호
  platform: 'ios' | 'android';    // 플랫폼
}

/**
 * 현재 앱의 버전 정보를 가져옵니다
 */
export function getCurrentAppVersion(): AppVersionInfo {
  return {
    version: Application.nativeApplicationVersion || '1.0.0',
    buildNumber: Application.nativeBuildVersion || '1',
    platform: Platform.OS as 'ios' | 'android',
  };
}

/**
 * 서버에서 최신 버전 정보를 가져옵니다
 */
export async function checkLatestVersion(): Promise<VersionInfo> {
  try {
    // Prod 환경: 실제 서버 API 호출
    const currentApp = getCurrentAppVersion();
    const queryParams = new URLSearchParams({
      platform: currentApp.platform,
      currentVersion: currentApp.version,
    });
    const response = await apiClient.get<VersionInfo>(`/version/check?${queryParams.toString()}`);
    return response;
  } catch (error) {
    console.error('❌ 서버 버전 체크 실패:', error);
    
    // 서버 실패 시 fallback: 앱스토어 API 직접 조회
    // (실제 구현 시에는 앱스토어 API 연동)
    console.log('🔄 앱스토어 API로 fallback (구현 예정)');
    
    // 최종 fallback: 로컬 캐시 또는 기본값
    return {
      currentVersion: '1.0.0',
      minSupportedVersion: '1.0.0',
      forceUpdate: false,
      updateMessage: '서버 연결에 문제가 있습니다. 나중에 다시 확인해주세요.',
      storeUrl: {
        ios: 'https://apps.apple.com/app/soomsoom/id123456789',
        android: 'https://play.google.com/store/apps/details?id=com.soomsoom.app',
      },
    };
  }
}

/**
 * 버전 비교 함수 (semantic versioning)
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;
    
    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }
  
  return 0;
}

/**
 * 앱스토어로 이동하는 함수
 */
export async function openAppStore(storeUrl: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(storeUrl);
    if (canOpen) {
      await Linking.openURL(storeUrl);
    } else {
      console.warn('앱스토어 URL을 열 수 없습니다:', storeUrl);
    }
  } catch (error) {
    console.error('앱스토어 열기 실패:', error);
  }
}

/**
 * 업데이트 알림을 표시하는 함수
 */
export function showUpdateAlert(
  versionInfo: VersionInfo,
  onUpdate: () => void,
  onCancel?: () => void
): void {
  const { currentVersion, forceUpdate, updateMessage, storeUrl } = versionInfo;
  const platform = Platform.OS as 'ios' | 'android';
  const storeUrlForPlatform = storeUrl[platform];
  
  if (!storeUrlForPlatform) {
    console.warn(`${platform}용 앱스토어 URL이 없습니다.`);
    return;
  }

  const message = updateMessage || `새로운 버전 ${currentVersion}이 있습니다. 업데이트하시겠습니까?`;
  
  Alert.alert(
    '업데이트 알림',
    message,
    [
      {
        text: '업데이트',
        onPress: () => {
          openAppStore(storeUrlForPlatform);
          onUpdate();
        },
      },
      ...(forceUpdate ? [] : [{
        text: '나중에',
        onPress: onCancel,
        style: 'cancel' as const,
      }]),
    ],
    { cancelable: !forceUpdate }
  );
}

/**
 * 앱 시작 시 버전 체크를 수행하는 함수
 */
export async function checkAppVersionOnStart(): Promise<void> {
  try {
    console.log('🔍 앱 버전 체크 시작...');
    
    const currentApp = getCurrentAppVersion();
    const latestVersion = await checkLatestVersion();
    
    console.log('📱 현재 앱 버전:', currentApp.version);
    console.log('🌐 서버 최신 버전:', latestVersion.currentVersion);
    console.log('⚠️ 최소 지원 버전:', latestVersion.minSupportedVersion);
    
    // 최소 지원 버전보다 낮으면 강제 업데이트
    const isBelowMinVersion = compareVersions(currentApp.version, latestVersion.minSupportedVersion) < 0;
    const isOutdated = compareVersions(currentApp.version, latestVersion.currentVersion) < 0;
    
    if (isBelowMinVersion || (isOutdated && latestVersion.forceUpdate)) {
      console.log('🚨 강제 업데이트 필요');
      showUpdateAlert(
        { ...latestVersion, forceUpdate: true },
        () => console.log('✅ 업데이트 진행'),
        () => console.log('❌ 업데이트 취소')
      );
    } else if (isOutdated) {
      console.log('💡 선택적 업데이트 가능');
      showUpdateAlert(
        latestVersion,
        () => console.log('✅ 업데이트 진행'),
        () => console.log('⏰ 나중에 업데이트')
      );
    } else {
      console.log('✅ 최신 버전입니다');
    }
    
  } catch (error) {
    console.error('❌ 버전 체크 실패:', error);
    // 버전 체크 실패해도 앱은 정상 동작
  }
}
