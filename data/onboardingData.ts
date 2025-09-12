/**
 * 온보딩 관련 데이터 정의
 * 
 * 🎯 왜 이렇게 하나요?
 * - 컴포넌트에서 하드코딩된 데이터를 분리
 * - 데이터 변경 시 컴포넌트 수정 없이 데이터만 변경 가능
 * - 재사용성과 유지보수성 향상
 */
import { colors } from '../constants/colors';
import { syongsyongTypography } from '../constants/typography';
import { ImageSourcePropType } from 'react-native';
export interface OnboardingStep {
  id: string;
  title?: any[][] | null; // 복잡한 타입 대신 any 사용 (기존 코드와 호환성 유지)
  //content?: React.ReactNode; //content는 일단 onboardingstep에서 렌더링 중
  backgroundImage?: ImageSourcePropType;
  backgroundColor?: typeof colors.primary50 | typeof colors.primary300;
  specialButtonText?: '알림받기' | '마음운동 시작' | '확인'; 
  showNext?: boolean;
  validation?: (data: any) => boolean;
}

export interface CheckboxOption {
  id: string;
  label: string;
  subLabel?: string;
}

// 집중 목표 옵션
export const focusOptions: CheckboxOption[] = [
  { id: 'sleep', label: '수면의 질 높이기' },
  { id: 'peace', label: '평온한 마음 가지기' },
  { id: 'anxiety', label: '불안 다스리기' },
  { id: 'stress', label: '스트레스 해소하기' },
  { id: 'focus', label: '현재에 집중해보기' },
  { id: 'other', label: '그 외에 다른 이유' },
];

// 시간 옵션
export const timeOptions: CheckboxOption[] = [
  { id: '3', label: '하루 3분', subLabel: '가볍게' },
  { id: '10', label: '하루 10분', subLabel: '보통' },
  { id: '20', label: '하루 20분', subLabel: '열심히' },
  { id: '30', label: '하루 30분', subLabel: '진지하게' },
];

const normalText = { color: colors.grayScale900, textShadowColor: colors.grayScale900 };
const highlightText = { color: colors.primary300, textShadowColor: colors.primary300 };

// 온보딩 단계별 데이터
export const onboardingSteps: OnboardingStep[] = [
  {
    id: 'onboarding01',
    title: [
      [["안녕하세요! ",normalText],["숨숨이에요!",highlightText]],
      [["같이 가볍게 ", normalText],["마음운동, ", highlightText],["해보실래요?", normalText]],
    ],
    backgroundImage: require('../assets/images/onboarding/bg_zoom1.png'),
    showNext: true,
  },
  {
    id: 'onboarding02',
    title: [
        [["마음운동 시작하기 전에",normalText]],
        [["간단한 질문 ", normalText],["3가지만 ", highlightText],["여쭤볼게요!", normalText]],
    ],
    backgroundImage: require('../assets/images/onboarding/bg_zoom2.png'),
    showNext: true,
  },
  {
    id: 'onboarding03',//focus_selection
    title: [
        [["어디에 집중해볼까요?", normalText]],
    ],
    showNext: true,
    validation: (data: any) => data.selectedFocusIds && data.selectedFocusIds.length > 0,
  },
  {
    id: 'onboarding04',
    title: [
        [["걱정마세요!",normalText]],
        [["마음운동을 ", highlightText],["통해 이룰 수 있게", normalText]],
        [["숨숨이 도와드릴게요!",highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_zoom3.png'),
    showNext: true,
  },
  {
    id: 'onboarding05',//time_selection
    title: [
      [["하루에 ", highlightText],["얼마나 시간을 낼 수 있나요?", normalText]]
    ],
    showNext: true,
    validation: (data: any) => data.selectedTimeIds && data.selectedTimeIds.length > 0,
  },
  {
    id: 'onboarding06',//notification
    title: [
      [["마음운동은 꾸준함이 ", normalText],["핵심이에요!", highlightText]],
      [["저희가 도와드릴게요!", normalText]]
    ],
    showNext: true,
    specialButtonText: '알림받기',
  },
  {
    id: 'onboarding07',
    title: [
      [["본격적인 시작 전에", normalText]],
      [["간단한 호흡을 해봐요!", highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_zoom4.png'),
    showNext: true,
  },
  {
    id: 'onboarding08',
    title: [
      [["그거 아시나요?", normalText]],
      [["고양이가 ", normalText],["숨숨집을 좋아하는 이유를..", highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_zoom5.png'),
    showNext: true,
  },
  {
    id: 'onboarding09',
    title: [
      [["꽉 맞는 숨숨집이", normalText]],
      [["포근함을 준다고 해요!", highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_default.png'),
    showNext: true,
  },
  {
    id: 'onboarding10',
    title: [
      [["마음이라는 장소에", normalText]],
      [["고양이를 들여놓아보세요!", highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_default.png'),
    showNext: true,
    specialButtonText: '마음운동 시작',
  },
  {
    id: 'onboarding11',//countdown
    //showNext: false,
    backgroundColor: colors.primary50,
    showNext: false,
  },
  {
    id: 'onboarding12',
    // title: [
    //   [["호흡 (미구현) ", normalText]]
    // ],
    backgroundColor: colors.primary50,
    showNext: false,
  },
  {
    id: 'onboarding13',//playresult
    title: [
      [["좋아요! 지금 당신은 ", normalText]]
    ],
    backgroundColor: colors.primary50,
    showNext: true,
    specialButtonText: '확인',
  },
  {
    id: 'onboarding14',
    title: [
      [["잊지 마세요.", normalText]],
      [["고양이는 따뜻하고 귀엽습니다!", highlightText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_default.png'),
    showNext: true,
  },
  {
    id: 'onboarding15',
    title: [
      [["프로필을 입력하고", normalText]],
      [["우리의 마음에 고양이를 들여봐요!", normalText]]
    ],
    backgroundImage: require('../assets/images/onboarding/bg_default.png'),
    showNext: true,
  },
  {
    id: 'register',//register
    backgroundColor: colors.primary300,
  },
];
