// Play 관련 임시 데이터
// TODO: 백엔드 연동 후 실제 API 데이터로 교체

export type PlayContentType = 'breath' | 'meditation';

// 컨텐츠 데이터 구조
export type ContentData = {
  id: number;
  title: string[];
  image: any;
  time: string;
  type: PlayContentType;
  teacherId: number;
  guide: string;
  audio?: any;
  description: string[];
};

// 선생님 데이터 구조
export type TeacherData = {
  id: number;
  name: string;
  title: string;
  profileImage: any;
  bio: string;
};

// 짧은 명상 데이터 구조
export type ShortMeditationData = {
  id: number;
  title: string[];
  icon: any;
  time: string;
  type: PlayContentType;
};

// 즐겨찾기에 추가한 컨텐츠 데이터 구조
export type FavoriteContentData = {
  id: number;
  contentId: number;
};

// 유저가 팔로우한 선생님 데이터 구조
export type FollowedTeacherData = {
  id: number;
  teacherId: number[];
};

// 컨텐츠 데이터
export const contentData: ContentData[] = [
  {
    id: 1,
    title: ['오롯이 날 위한 휴식,', '5분 명상'],
    image: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    time: '5min',
    type: 'meditation',
    teacherId: 1,
    guide: '안내자1',
    audio: require('../assets/audios/test_audio.mp3'),
    description: ['숨을 쉬는 데에도 모양이 있대요!', '네 박자 리듬에 맞춰 들숨과 날숨, 멈춤을 반복하다', '보면 어느새 마음이 편안해지는 나만의 5분 여유가', '생길 거 예요!'],
  },
  {
    id: 2,
    title: ['잠을 못 이루는 밤,', '꿀잠 명상 5분'],
    image: require('../assets/images/play/playFavoriteScreen/default_image_2.png'),
    time: '5min',
    type: 'meditation',
    teacherId: 2,
    guide: '안내자2',
    audio: require('../assets/audios/test_audio.mp3'),
    description: ['잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.', '잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.', '잠을 못 이루는 밤 컨텐츠의 설명 부분입니다.'],
  },
  {
    id: 3,
    title: ['잠 못 드는 밤,', '이완 호흡'],
    image: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    time: '5min',
    type: 'breath',
    teacherId: 0,
    guide: 'DEFAULT GUIDE',
    description: ['잠 못 드는 밤, 이완 호흡 컨텐츠의 설명 부분입니다.'],
  },
  {
    id: 4,
    title: ['답답함을 뻥!', '풀어주는 한숨'],
    image: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    time: '5min',
    type: 'breath',
    teacherId: 0,
    guide: 'DEFAULT GUIDE',
    description: ['답답함을 뻥! 풀어주는 한숨 컨텐츠의 설명 부분입니다.'],
  },
  {
    id: 5,
    title: ['생각이 많을 때,', '교호 호흡'],
    image: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    time: '5min',
    type: 'breath',
    teacherId: 0,
    guide: 'DEFAULT GUIDE',
    description: ['생각이 많을 때, 교호 호흡 컨텐츠의 설명 부분입니다.'],
  },
];

// 선생님 데이터
export const teachersData: TeacherData[] = [
  {
    id: 0,
    name: 'DEFAULT',
    title: 'TEACHER',
    profileImage: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: 'DEFAULT BIO',
  },
  {
    id: 1,
    name: '은경',
    title: '선생님',
    profileImage: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '거대한 바다도 또 한방울의 물이 모여 이루어지듯, 한 사람 한 사람의 의식이 모여 커다란 세상을 이룹니다. 세상 모든 존재들은 하나하나 따로 떨어져 낱개로 있는 것처럼 보이지만 열려있는 의식의 차원에서 보면 서로 밀접하게 연결되어 있습니다.',
  },
  {
    id: 2,
    name: '정목',
    title: '스님',
    profileImage: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '안녕하세요! 저는 정목입니다. 저는 명상을 좋아합니다.',
  },
  {
    id: 3,
    name: '광현',
    title: '선생님',
    profileImage: require('../assets/images/play/playFavoriteScreen/default_image_1.png'),
    bio: '안녕하세요! 저는 광현입니다. 저는 명상을 좋아합니다.',
  },
]; 