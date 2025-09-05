// Play 관련 임시 데이터
// TODO: 백엔드 연동 후 실제 API 데이터로 교체

// 타입들은 contentService.ts에서 관리하고 import해서 사용
import { Activity } from '../services/contentService';
import { Instructor } from '../services/instructorService';


// 컨텐츠 데이터 (Mock) - Activity 타입으로 변환
export const mockContentData: Activity[] = [
  {
    id: 1,
    title: '오롯이 날 위한 휴식, 5분 명상',
    type: 'MEDITATION',
    thumbnailImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    descriptions: [
      '숨을 쉬는 데에도 모양이 있대요!',
      '네 박자 리듬에 맞춰 들숨과 날숨, 멈춤을 반복하다',
      '보면 어느새 마음이 편안해지는 나만의 5분 여유가',
      '생길 거 예요!'
    ],
    author: {
      id: 1,
      name: '은경 선생님',
      bio: '거대한 바다도 또 한방울의 물이 모여 이루어지듯, 한 사람 한 사람의 의식이 모여 커다란 세상을 이룹니다.',
      profileImageUrl: null,
    },
    narrator: {
      id: 1,
      name: '안내자1',
      bio: '명상 안내자입니다.',
      profileImageUrl: null,
    },
    durationInSeconds: 300, // 5분
    audioUrl: require('../assets/audios/test_audio.mp3'),
    timeline: [
      {
        id: 1,
        time: 0.0,
        action: 'START',
        text: '명상을 시작합니다.',
        duration: null,
      },
      {
        id: 2,
        time: 5.0,
        action: 'INHALE',
        text: '숨을 들이쉬세요.',
        duration: 4.0,
      },
    ],
    isFavorited: false,
  },
  {
    id: 2,
    title: '잠을 못 이루는 밤, 꿀잠 명상 5분',
    type: 'MEDITATION',
    thumbnailImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_2.png'),
    descriptions: [
      '잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.',
      '잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.',
      '잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.'
    ],
    author: {
      id: 2,
      name: '정목 스님',
      bio: '안녕하세요! 저는 정목입니다. 저는 명상을 좋아합니다.',
      profileImageUrl: null,
    },
    narrator: {
      id: 2,
      name: '안내자2',
      bio: '명상 안내자입니다.',
      profileImageUrl: null,
    },
    durationInSeconds: 300, // 5분
    audioUrl: require('../assets/audios/test_audio.mp3'),
    timeline: [
      {
        id: 3,
        time: 0.0,
        action: 'START',
        text: '명상을 시작합니다.',
        duration: null,
      },
      {
        id: 4,
        time: 5.0,
        action: 'INHALE',
        text: '숨을 들이쉬세요.',
        duration: 4.0,
      },
    ],
    isFavorited: false,
  },
  {
    id: 3,
    title: '잠 못 드는 밤, 이완 호흡',
    type: 'BREATHING',
    thumbnailImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    descriptions: [
      '잠 못 드는 밤, 이완 호흡 컨텐츠의 설명 부분입니다.'
    ],
    author: {
      id: 0,
      name: 'DEFAULT NAME',
      bio: 'DEFAULT BIO',
      profileImageUrl: null,
    },
    narrator: {
      id: 0,
      name: 'DEFAULT GUIDE',
      bio: 'DEFAULT GUIDE BIO',
      profileImageUrl: null,
    },
    durationInSeconds: 300, // 5분
    audioUrl: null,
    timeline: [
      {
        id: 5,
        time: 0.0,
        action: 'START',
        text: '호흡을 시작합니다.',
        duration: null,
      },
      {
        id: 6,
        time: 5.0,
        action: 'INHALE',
        text: '숨을 들이쉬세요.',
        duration: 4.0,
      },
    ],
    isFavorited: false,
  },
  {
    id: 4,
    title: '답답함을 뻥! 풀어주는 한숨',
    type: 'BREATHING',
    thumbnailImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    descriptions: [
      '답답함을 뻥! 풀어주는 한숨 컨텐츠의 설명 부분입니다.'
    ],
    author: {
      id: 0,
      name: 'DEFAULT NAME',
      bio: 'DEFAULT BIO',
      profileImageUrl: null,
    },
    narrator: {
      id: 0,
      name: 'DEFAULT GUIDE',
      bio: 'DEFAULT GUIDE BIO',
      profileImageUrl: null,
    },
    durationInSeconds: 300, // 5분
    audioUrl: null,
    timeline: [
      {
        id: 7,
        time: 0.0,
        action: 'START',
        text: '호흡을 시작합니다.',
        duration: null,
      },
      {
        id: 8,
        time: 5.0,
        action: 'INHALE',
        text: '숨을 들이쉬세요.',
        duration: 4.0,
      },
    ],
    isFavorited: false,
  },
  {
    id: 5,
    title: '생각이 많을 때, 교호 호흡',
    type: 'BREATHING',
    thumbnailImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    descriptions: [
      '생각이 많을 때, 교호 호흡 컨텐츠의 설명 부분입니다.'
    ],
    author: {
      id: 0,
      name: 'DEFAULT NAME',
      bio: 'DEFAULT BIO',
      profileImageUrl: null,
    },
    narrator: {
      id: 0,
      name: 'DEFAULT GUIDE',
      bio: 'DEFAULT GUIDE BIO',
      profileImageUrl: null,
    },
    durationInSeconds: 300, // 5분
    audioUrl: null,
    timeline: [
      {
        id: 9,
        time: 0.0,
        action: 'START',
        text: '호흡을 시작합니다.',
        duration: null,
      },
      {
        id: 10,
        time: 5.0,
        action: 'INHALE',
        text: '숨을 들이쉬세요.',
        duration: 4.0,
      },
    ],
    isFavorited: false,
  },
];

// 강사 데이터 (Mock) - Instructor 타입으로 변환
export const mockInstructorsData: Instructor[] = [
  {
    instructorId: 0,
    name: 'DEFAULT NAME',
    profileImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: 'DEFAULT BIO',
    isFollowing: false,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    instructorId: 1,
    name: '은경 선생님',
    profileImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '거대한 바다도 또 한방울의 물이 모여 이루어지듯, 한 사람 한 사람의 의식이 모여 커다란 세상을 이룹니다. 세상 모든 존재들은 하나하나 따로 떨어져 낱개로 있는 것처럼 보이지만 열려있는 의식의 차원에서 보면 서로 밀접하게 연결되어 있습니다.',
    isFollowing: false,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    instructorId: 2,
    name: '정목 스님',
    profileImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '안녕하세요! 저는 정목입니다. 저는 명상을 좋아합니다.',
    isFollowing: false,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
  {
    instructorId: 3,
    name: '광현 선생님',
    profileImageUrl: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '안녕하세요! 저는 광현입니다. 저는 명상을 좋아합니다.',
    isFollowing: false,
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  },
]; 