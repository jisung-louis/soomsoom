import '@react-native-firebase/app';
import { registerRootComponent } from 'expo';
import App from './App';
// RNFirebase는 iOS/Android 설정 파일로 자동 초기화됩니다.
// 기본 앱 모듈을 가장 먼저 로드해야 App.tsx에서 messaging() 호출 전 초기화가 보장됩니다.

registerRootComponent(App);
