export type MockMailData = {
  id: number;
  type: 'news'; // 아직 뉴스밖에 없음 //안쓰임
  title: string;
  content: string;
  sentAt: string; //yyyy-MM-ddTHH:mm:ss.SSSSSS
  createdAt: string; //yyyy-MM-ddTHH:mm:ss.SSSSSS
  modifiedAt: string; //yyyy-MM-ddTHH:mm:ss.SSSSSS=
  isRead: boolean; // 읽음 여부
};

export const mockMailData: MockMailData[] = [
  {
    id: 1,
    type: 'news',
    title: '업데이트 진행 소식!',
    content: '메일함',
    sentAt: '2025-08-10T18:35:55.741664',
    createdAt: '2025-08-10T18:35:55.741664',
    modifiedAt: '2025-08-10T18:35:55.741664',
    isRead: false,
  },
  {
    id: 2,
    type: 'news',
    title: '일주일간 진행되는 감정기록 이벤트!',
    content: '안녕하세요 집사님들! 이번에 출시를 앞두고 저희를사랑 추첨하여 소정의선물을 드립니다. 추첨에는 개인정보가 활용되지 않습니다.숨숨을 많이 사랑해주세요! 감사합니다!',
    sentAt: '2025-09-05T15:00:00.000000',
    createdAt: '2025-09-05T15:00:00.000000',
    modifiedAt: '2025-09-05T15:00:00.000000',
    isRead: false,
  },
];

export const getDynamicMockMailData = (): MockMailData[] => {
  return mockMailData;
};

/**
 * Mock 메일의 읽음 상태를 업데이트하는 함수
 */
export const updateMockMailReadStatus = (mailId: number, isRead: boolean): void => {
  const mailIndex = mockMailData.findIndex(item => item.id === mailId);
  if (mailIndex !== -1) {
    mockMailData[mailIndex].isRead = isRead;
    console.log(`📬 Mock 메일 읽음 상태 업데이트: ID ${mailId} -> ${isRead ? '읽음' : '안읽음'}`);
  } else {
    console.warn(`⚠️ Mock 메일을 찾을 수 없습니다: ID ${mailId}`);
  }
};

