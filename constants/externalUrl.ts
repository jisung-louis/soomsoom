import { Platform } from 'react-native';
export const TERMS_URL = 'https://soomsoomhouse.notion.site/Terms-of-Service-2368c8e0513580f9999ccb7bb901a0d5';
export const PRIVACY_URL = 'https://soomsoomhouse.notion.site/2378c8e0513580758730fade7689a04a';
export const INQUIRY_BUG_URL = 'https://naver.com';

// 아래 링크를 앱스토어 올라오면 앱스토어 링크로 업데이트
export const storeUrlForPlatform = Platform.OS === 
'ios' ? 
'https://apps.apple.com/app/soomsoom/id123456789' : 
'https://play.google.com/store/apps/details?id=com.soomsoom.app';
