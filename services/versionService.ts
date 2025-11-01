import { apiClient } from './apiClient';
import { storeUrlForPlatform } from '../constants/externalUrl';
import { Platform, Linking, Alert } from 'react-native';
import * as Application from 'expo-application';


// 서버에서 받는 버전 정보 타입
export interface VersionResponse {
  isLatest: boolean;
  forceUpdate: boolean;
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
    //version: '1.2.0', // 테스트용
    buildNumber: Application.nativeBuildVersion || '1',
    platform: Platform.OS as 'ios' | 'android',
  };
}

/**
 * 서버에서 최신 버전 여부와 강제 업데이트 여부를 가져옵니다
 */
export async function checkLatestVersion(): Promise<VersionResponse> {
  try {
    // Prod 환경: 실제 서버 API 호출
    const currentApp = getCurrentAppVersion();
    console.log('🔍 서버 버전 체크 시작:', JSON.stringify(currentApp));
    const response = await apiClient.post<VersionResponse>(`/app-versions/check`, {
      os: currentApp.platform === 'ios' ? 'IOS' : 'ANDROID',
      versionName: currentApp.version,
    });
    console.log('✅ 서버 버전 체크 성공:', JSON.stringify(response));
    return response;
  } catch (error) {
    console.error('❌ 서버 버전 체크 실패:', error);
    // 호출 실패는 상위에서 처리하도록 에러 전파
    throw error;
  }
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
  versionInfo: VersionResponse,
  onUpdate: () => void,
  onCancel?: () => void
): void {
  const { forceUpdate } = versionInfo;
  
  if (!storeUrlForPlatform) {
    console.warn(`${Platform.OS}용 앱스토어 URL이 없습니다.`);
    return;
  }

  const message = forceUpdate ? `새로운 버전이 있어요!` : `새로운 버전이 있어요! 업데이트하러 갈까요?`;
  
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
export async function checkAppVersionOnStart(): Promise<{ serverAvailable: boolean; shouldBlockApp: boolean }> {
  try {
    console.log('🔍 앱 버전 체크 시작...');
    
    const currentApp = getCurrentAppVersion();
    const checkVersion = await checkLatestVersion();
    
    console.log('📱 현재 앱 버전:', currentApp.version);
    console.log('🌐 최신 버전인가? :', checkVersion.isLatest);
    console.log('⚠️ 강제 업데이트가 필요한가? :', checkVersion.forceUpdate);
    
    // 강제 업데이트일 경우 Alert 표시하고 앱 실행 차단
    if (checkVersion.forceUpdate) {
      showUpdateAlert(checkVersion, () => {
        openAppStore(storeUrlForPlatform);
      });
      return { serverAvailable: true, shouldBlockApp: true };
    }
    
    // 강제 업데이트는 아니지만 최신 버전이 아닌 경우 선택적 업데이트 알림
    if (!checkVersion.isLatest) {
      showUpdateAlert(checkVersion, () => {
        openAppStore(storeUrlForPlatform);
      });
    }
    
    return { serverAvailable: true, shouldBlockApp: false };
  } catch (error) {
    console.error('❌ 버전 체크 실패:', error);
    return { serverAvailable: false, shouldBlockApp: false };
  }
}
