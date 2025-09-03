# 📋 TODO 목록

이 문서는 숨숨 프로젝트의 모든 TODO 항목을 체계적으로 관리합니다.

## 🎯 **우선순위별 분류**

### 🔴 **High Priority (즉시 해결 필요)**

#### **백엔드 API 연동**
- [ ] **감정 기록 저장 API** (`services/emotionService.ts:169`)
  - 현재: 로컬 시뮬레이션
  - 목표: `POST /api/emotions/record` 연동
  - 담당자: 백엔드 팀

- [ ] **감정 통계 조회 API** (`services/emotionService.ts:127`)
  - 현재: 목업 데이터 사용
  - 목표: `GET /api/emotions/stats/{year}/{month}` 연동
  - 담당자: 백엔드 팀

- [ ] **첫 기록일 체크 API** (`services/emotionService.ts:185`)
  - 현재: 랜덤 시뮬레이션
  - 목표: `GET /api/emotions/history/first-check/{date}` 연동
  - 담당자: 백엔드 팀

#### **알림 설정 API**
- [ ] **알림 설정 업데이트 API** (`screens/subpages/my/setting/NotificationSettingScreen.tsx:170,174,190,194`)
  - 현재: 로컬 저장소만 사용
  - 목표: 백엔드 API 연동
  - 담당자: 백엔드 팀

### 🟡 **Medium Priority (단기 해결)**

#### **UI/UX 개선**
- [ ] **첫 기록일 축하 팝업** (`hooks/useEmotionRecord.ts:93`)
  - 현재: 콘솔 로그만 출력
  - 목표: 축하 애니메이션 팝업 구현
  - 담당자: 프론트엔드 팀

- [ ] **알림 허용 확인** (`components/onboarding/OnboardingStep.tsx:119`)
  - 현재: 이미지만 표시
  - 목표: 실제 알림 권한 요청 로직 구현
  - 담당자: 프론트엔드 팀

- [ ] **이용약관 하이퍼링크** (`components/onboarding/Register.tsx:45`)
  - 현재: 빈 함수
  - 목표: 이용약관 페이지로 이동 구현
  - 담당자: 프론트엔드 팀

- [ ] **명상/호흡 결과페이지 ResultDescription 애니메이션화** (`PlayResult.tsx`)
  - 현재: 정적 뷰
  - 목표: fade in 애니메이션 추가 후 하단 버튼도 용수철 애니메이션 추가
  - 담당자: 프론트엔드 팀

- [ ] **명상/호흡 결과페이지 ResultDescription 텍스트 백엔드와 매핑** (`PlayResult.tsx`)
  - 현재: 하드코딩
  - 목표: 백엔드 API 연결 후 응답받은 액티비티(명상/호흡)별 설명을 텍스트에 매핑(3 lines)
  - 담당자: 프론트엔드 팀

#### **기능 완성**
- [ ] **구매 플로우** (`screens/tabs/MyTab.tsx:117`)
  - 현재: 콘솔 로그만 출력
  - 목표: 결제 다이얼로그/상점 이동 구현
  - 담당자: 프론트엔드 팀

- [ ] **아이템 저장 API** (`screens/tabs/MyTab.tsx:125`)
  - 현재: 로컬 상태만 업데이트
  - 목표: 백엔드 저장 API 연동
  - 담당자: 백엔드 팀

- [ ] **구매 로직 구현** (`screens/subpages/home/ShopScreen.tsx:74`)
  - 현재: 콘솔 로그만 출력
  - 목표: 실제 구매 플로우 구현
  - 담당자: 프론트엔드 팀

### 🟢 **Low Priority (장기 개선)**

#### **데이터 관리**
- [ ] **보유중 제외 기능** (`screens/subpages/home/ShopScreen.tsx:79`)
  - 현재: 상태만 관리
  - 목표: 실제 필터링 로직 구현
  - 담당자: 프론트엔드 팀

- [ ] **품절 아이템 관리** (`screens/subpages/home/ShopScreen.tsx:83`)
  - 현재: 로컬 상태만 관리
  - 목표: 백엔드에서 품절 상태 조회
  - 담당자: 백엔드 팀

#### **UI 개선**
- [ ] **요일별 감정 기록 차트** (`components/tabs/record/RecordReportTab.tsx:416`)
  - 현재: 주석으로만 표시
  - 목표: 실제 차트 컴포넌트 구현
  - 담당자: 프론트엔드 팀

- [ ] **뱃지 색깔 분기처리** (`components/tabs/my/AchievementList.tsx:44`)
  - 현재: 브론즈만 표시
  - 목표: 브론즈/실버/골드/히든 분기처리
  - 담당자: 프론트엔드 팀

#### **환경 설정**
- [ ] **STAGING 환경 감지** (`configs/environment.ts:17`)
  - 현재: 하드코딩된 false
  - 목표: 실제 STAGING 환경 감지 로직
  - 담당자: DevOps 팀

#### **데이터 소스**
- [ ] **Play 콘텐츠 데이터** (`data/playContentData.ts:2`)
  - 현재: 임시 데이터 사용
  - 목표: 백엔드 API 데이터로 교체
  - 담당자: 백엔드 팀

## 📊 **진행 상황**

### ✅ **완료된 항목**
- [x] 폴더 구조 통일 (`config/` → `configs/`)
- [x] 비즈니스 로직 분리 (`useEmotionRecord` 훅)
- [x] Step 컴포넌트 분리 (`PlayBreathSteps/`)
- [x] 시간 파싱 로직 통합 (`utils/timeUtils.ts`)

### 🔄 **진행 중인 항목**
- [ ] TODO 주석 정리 및 이슈 트래킹 시스템 도입

### ⏳ **대기 중인 항목**
- [ ] 백엔드 API 연동 (백엔드 팀 대기)
- [ ] 테스트 환경 구축
- [ ] 모니터링 도구 도입

## 🎯 **다음 단계**

1. **즉시**: 백엔드 팀과 API 스펙 협의
2. **1주 내**: High Priority 항목들 해결
3. **2주 내**: Medium Priority 항목들 해결
4. **장기**: Low Priority 항목들 점진적 개선

## 📝 **참고사항**

- 모든 TODO는 이 문서에서 중앙 관리됩니다
- 코드 내 TODO 주석은 이 문서를 참조하도록 수정되었습니다
- 새로운 TODO 발견 시 이 문서에 추가하고 코드 주석을 업데이트하세요
- 완료된 항목은 체크박스를 체크하고 완료 날짜를 기록하세요

---

**마지막 업데이트**: 2025-01-XX
**다음 리뷰 예정일**: 2025-01-XX
