# 숨숨 (Sumsum) - 정신 건강 관리 앱

<div align="center">
  <img src="assets/app-icons/icon.png" alt="숨숨 로고" width="120" height="120">
  <h3>마음의 평화를 찾는 당신을 위한 앱</h3>
</div>

## 🎯 프로젝트 소개

숨숨은 일상의 스트레스와 감정을 관리하고, 마음의 평화를 찾을 수 있도록 도와주는 정신 건강 관리 앱입니다. 감정 기록, 명상, 호흡 운동, 알람 설정 등을 통해 사용자의 정신 건강을 체계적으로 관리할 수 있습니다.

## ✨ 주요 기능

### 🧘‍♀️ **명상 & 호흡 운동**
- 다양한 명상 콘텐츠 제공
- 호흡 운동 가이드
- 개인 맞춤 추천 콘텐츠

### 📊 **감정 기록 & 분석**
- 일일 감정 상태 기록
- 월간/연간 감정 패턴 분석
- 캘린더 기반 감정 추적

### ⏰ **알람 & 알림**
- 개인 맞춤 알람 설정
- 명상 시간 알림
- 감정 체크 리마인더

### 🏆 **성취 시스템**
- 목표 달성 배지
- 개인 룸 꾸미기
- 진행 상황 추적

## 🛠 기술 스택

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Navigation**: React Navigation
- **UI Components**: Custom Components
- **Audio**: Expo AV
- **Notifications**: Expo Notifications

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn
- Expo CLI
- iOS Simulator 또는 Android Emulator

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/jisung-louis/sumsum.git
cd sumsum

# 의존성 설치
npm install

# Expo 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

### 환경 설정

1. `.env` 파일 생성 (필요한 경우)
2. Expo 계정 로그인
3. 개발 도구 설정

## 📱 앱 구조

```
sumsum/
├── components/          # 재사용 가능한 UI 컴포넌트
├── screens/            # 앱 화면 컴포넌트
├── navigations/        # 네비게이션 설정
├── stores/             # Zustand 상태 관리
├── hooks/              # 커스텀 React 훅
├── services/           # API 및 서비스 로직
├── utils/              # 유틸리티 함수
├── constants/          # 앱 상수 및 설정
├── types/              # TypeScript 타입 정의
└── assets/             # 이미지, 아이콘, 폰트 등
```

## 🤝 기여하기

### 개발 환경 설정
1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

### 커밋 메시지 컨벤션
- `feat:` 새로운 기능 추가
- `fix:` 버그 수정
- `docs:` 문서 수정
- `style:` 코드 포맷팅
- `refactor:` 코드 리팩토링
- `test:` 테스트 코드 추가/수정
- `chore:` 빌드 업무, 패키지 매니저 등

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

- **개발자**: jisung-louis
- **이메일**: [이메일 주소]
- **프로젝트 링크**: https://github.com/jisung-louis/sumsum

## 🙏 감사의 말

이 프로젝트는 많은 분들의 도움과 아이디어로 만들어졌습니다. 정신 건강에 관심을 가져주시는 모든 분들께 감사드립니다.

---

<div align="center">
  <sub>Made with ❤️ for better mental health</sub>
</div>
