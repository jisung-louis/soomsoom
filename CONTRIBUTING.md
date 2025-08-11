# 🤝 기여 가이드

숨숨 프로젝트에 기여해주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 안내합니다.

## 🚀 시작하기

### 1. 저장소 포크
1. GitHub에서 [숨숨 저장소](https://github.com/jisung-louis/sumsum)를 방문합니다
2. 우측 상단의 "Fork" 버튼을 클릭합니다
3. 포크된 저장소를 로컬에 클론합니다

```bash
git clone https://github.com/YOUR_USERNAME/sumsum.git
cd sumsum
```

### 2. 개발 환경 설정
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

### 3. 브랜치 생성
새로운 기능이나 버그 수정을 위한 브랜치를 생성합니다:

```bash
# 기능 개발
git checkout -b feature/새기능명

# 버그 수정
git checkout -b fix/버그명

# 문서 업데이트
git checkout -b docs/문서명
```

## 📝 개발 가이드

### 코드 스타일
- **TypeScript**: 모든 새로운 코드는 TypeScript로 작성
- **컴포넌트**: 함수형 컴포넌트와 훅 사용
- **네이밍**: camelCase (변수, 함수), PascalCase (컴포넌트)
- **들여쓰기**: 2칸 공백
- **세미콜론**: 사용

### 파일 구조
```
components/
├── common/           # 공통 컴포넌트
├── tabs/            # 탭별 컴포넌트
└── navigation/      # 네비게이션 컴포넌트

screens/
├── tabs/            # 메인 탭 화면
└── subpages/        # 서브 페이지 화면

hooks/               # 커스텀 훅
stores/              # Zustand 스토어
utils/                # 유틸리티 함수
```

### 컴포넌트 작성 규칙
```tsx
import React from 'react';
import { View, Text } from 'react-native';

interface ComponentProps {
  title: string;
  onPress?: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

## 🔄 작업 흐름

### 1. 이슈 확인
- [이슈 목록](https://github.com/jisung-louis/sumsum/issues)에서 작업할 내용을 확인합니다
- 이미 작업 중인 이슈가 있는지 확인합니다

### 2. 개발 및 테스트
- 로컬에서 충분히 테스트합니다
- iOS 시뮬레이터와 Android 에뮬레이터에서 테스트합니다
- 실제 디바이스에서도 테스트합니다

### 3. 커밋
커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

```bash
feat(감정기록): 감정 선택 UI 컴포넌트 추가
fix(알람): 알람 설정 시 앱 크래시 문제 해결
docs: README.md 업데이트
style: 코드 포맷팅 적용
refactor(컴포넌트): Button 컴포넌트 재사용성 개선
test: 감정 기록 컴포넌트 테스트 추가
chore: 의존성 패키지 업데이트
```

### 4. 푸시 및 PR 생성
```bash
git push origin feature/새기능명
```

GitHub에서 Pull Request를 생성합니다.

## 📋 Pull Request 가이드

### PR 제목
- 명확하고 간결하게 작성
- 변경사항을 한 줄로 요약

### PR 설명
- 변경사항을 자세히 설명
- 관련 이슈 링크
- 테스트 방법 안내
- 스크린샷 (UI 변경 시)

### 리뷰 요청
- 코드 리뷰어 지정
- 관련 팀원 태그
- 구체적인 리뷰 포인트 명시

## 🧪 테스트 가이드

### 단위 테스트
- 새로운 컴포넌트에 대한 테스트 작성
- 주요 로직에 대한 테스트 커버리지 확보

### 통합 테스트
- 컴포넌트 간 상호작용 테스트
- 네비게이션 플로우 테스트

### E2E 테스트
- 주요 사용자 시나리오 테스트
- 크로스 플랫폼 호환성 테스트

## 🐛 버그 리포트

버그를 발견했다면:
1. [이슈 템플릿](https://github.com/jisung-louis/sumsum/issues/new/choose)을 사용합니다
2. 재현 단계를 명확하게 작성합니다
3. 환경 정보를 포함합니다
4. 스크린샷이나 로그를 첨부합니다

## 💡 기능 제안

새로운 기능을 제안하려면:
1. [기능 요청 템플릿](https://github.com/jisung-louis/sumsum/issues/new/choose)을 사용합니다
2. 기능의 필요성을 명확하게 설명합니다
3. 사용 시나리오를 제시합니다
4. UI/UX 제안을 포함합니다

## 📚 문서화

### 코드 주석
- 복잡한 로직에 대한 주석 작성
- 함수의 목적과 매개변수 설명
- 예외 상황에 대한 설명

### README 업데이트
- 새로운 기능에 대한 설명 추가
- 설치 및 사용 방법 업데이트
- 변경사항 반영

## 🎯 기여 영역

### 프론트엔드
- React Native 컴포넌트 개발
- UI/UX 개선
- 성능 최적화

### 백엔드 연동
- API 연동
- 데이터 처리
- 에러 핸들링

### 테스트
- 단위 테스트 작성
- 통합 테스트 작성
- 테스트 자동화

### 문서화
- README 업데이트
- API 문서 작성
- 사용자 가이드 작성

## 🏆 기여자 인정

기여해주신 모든 분들의 이름을 [기여자 목록](CONTRIBUTORS.md)에 추가합니다.

## 📞 문의

기여 과정에서 궁금한 점이 있다면:
- [이슈](https://github.com/jisung-louis/sumsum/issues)에 질문을 남겨주세요
- [토론](https://github.com/jisung-louis/sumsum/discussions)에 참여해주세요

---

**감사합니다!** 🎉

숨숨 프로젝트에 기여해주셔서 정말 감사합니다. 여러분의 기여가 더 나은 정신 건강 관리 앱을 만드는 데 큰 도움이 됩니다.
