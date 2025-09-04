// 통합된 감정 일기 Mock 데이터 (API 스펙 기반)
import dayjs from 'dayjs';

// API 스펙에 맞는 일기 Mock 데이터
export const mockDiaryData: Array<{
  diaryId: number;
  userId: number;
  emotion: 'happy' | 'good' | 'soso' | 'depressed' | 'sad' | 'angry';
  memo: string;
  recordDate: string;
  createdAt: string;
  modifiedAt: string;
  deletedAt: null;
}> = [
  // 2025년 4월 데이터
  { diaryId: 1, userId: 1, emotion: 'happy', memo: '오늘은 정말 좋은 하루였어요!', recordDate: '2025-04-01', createdAt: '2025-04-01T09:00:00', modifiedAt: '2025-04-01T09:00:00', deletedAt: null },
  { diaryId: 2, userId: 1, emotion: 'happy', memo: '조금 우울한 하루였습니다.', recordDate: '2025-04-02', createdAt: '2025-04-02T09:00:00', modifiedAt: '2025-04-02T09:00:00', deletedAt: null },
  { diaryId: 3, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-04-03', createdAt: '2025-04-03T09:00:00', modifiedAt: '2025-04-03T09:00:00', deletedAt: null },

  // 2025년 5월 데이터
  { diaryId: 1, userId: 1, emotion: 'happy', memo: '오늘은 정말 좋은 하루였어요!', recordDate: '2025-05-01', createdAt: '2025-05-01T09:00:00', modifiedAt: '2025-05-01T09:00:00', deletedAt: null },
  { diaryId: 2, userId: 1, emotion: 'happy', memo: '조금 우울한 하루였습니다.', recordDate: '2025-05-02', createdAt: '2025-05-02T09:00:00', modifiedAt: '2025-05-02T09:00:00', deletedAt: null },
  //{ diaryId: 3, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-05-03', createdAt: '2025-05-03T09:00:00', modifiedAt: '2025-05-03T09:00:00', deletedAt: null },

  // 2025년 6월 데이터
  { diaryId: 1, userId: 1, emotion: 'happy', memo: '오늘은 정말 좋은 하루였어요!', recordDate: '2025-06-01', createdAt: '2025-06-01T09:00:00', modifiedAt: '2025-06-01T09:00:00', deletedAt: null },
  { diaryId: 2, userId: 1, emotion: 'sad', memo: '조금 우울한 하루였습니다.', recordDate: '2025-06-02', createdAt: '2025-06-02T09:00:00', modifiedAt: '2025-06-02T09:00:00', deletedAt: null },
  { diaryId: 3, userId: 1, emotion: 'soso', memo: '평범한 하루였어요.', recordDate: '2025-06-03', createdAt: '2025-06-03T09:00:00', modifiedAt: '2025-06-03T09:00:00', deletedAt: null },
  { diaryId: 4, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-06-04', createdAt: '2025-06-04T09:00:00', modifiedAt: '2025-06-04T09:00:00', deletedAt: null },
  { diaryId: 5, userId: 1, emotion: 'depressed', memo: '기분이 많이 안 좋았어요.', recordDate: '2025-06-05', createdAt: '2025-06-05T09:00:00', modifiedAt: '2025-06-05T09:00:00', deletedAt: null },
  { diaryId: 6, userId: 1, emotion: 'angry', memo: '화가 났던 하루였습니다.', recordDate: '2025-06-06', createdAt: '2025-06-06T09:00:00', modifiedAt: '2025-06-06T09:00:00', deletedAt: null },
  { diaryId: 7, userId: 1, emotion: 'happy', memo: '정말 행복한 하루!', recordDate: '2025-06-07', createdAt: '2025-06-07T09:00:00', modifiedAt: '2025-06-07T09:00:00', deletedAt: null },
  { diaryId: 8, userId: 1, emotion: 'happy', memo: '좋은 일이 있었어요.', recordDate: '2025-06-08', createdAt: '2025-06-08T09:00:00', modifiedAt: '2025-06-08T09:00:00', deletedAt: null },
  { diaryId: 9, userId: 1, emotion: 'happy', memo: '기분이 좋았습니다.', recordDate: '2025-06-09', createdAt: '2025-06-09T09:00:00', modifiedAt: '2025-06-09T09:00:00', deletedAt: null },
  { diaryId: 10, userId: 1, emotion: 'happy', memo: '즐거운 하루였어요.', recordDate: '2025-06-10', createdAt: '2025-06-10T09:00:00', modifiedAt: '2025-06-10T09:00:00', deletedAt: null },
  { diaryId: 11, userId: 1, emotion: 'happy', memo: '정말 좋은 하루!', recordDate: '2025-06-11', createdAt: '2025-06-11T09:00:00', modifiedAt: '2025-06-11T09:00:00', deletedAt: null },
  { diaryId: 12, userId: 1, emotion: 'happy', memo: '행복한 하루였습니다.', recordDate: '2025-06-12', createdAt: '2025-06-12T09:00:00', modifiedAt: '2025-06-12T09:00:00', deletedAt: null },
  { diaryId: 13, userId: 1, emotion: 'happy', memo: '기분이 정말 좋았어요.', recordDate: '2025-06-13', createdAt: '2025-06-13T09:00:00', modifiedAt: '2025-06-13T09:00:00', deletedAt: null },
  { diaryId: 14, userId: 1, emotion: 'sad', memo: '조금 슬펐던 하루.', recordDate: '2025-06-14', createdAt: '2025-06-14T09:00:00', modifiedAt: '2025-06-14T09:00:00', deletedAt: null },
  { diaryId: 15, userId: 1, emotion: 'soso', memo: '평범한 하루였습니다.', recordDate: '2025-06-15', createdAt: '2025-06-15T09:00:00', modifiedAt: '2025-06-15T09:00:00', deletedAt: null },
  { diaryId: 16, userId: 1, emotion: 'good', memo: '괜찮은 하루였어요.', recordDate: '2025-06-16', createdAt: '2025-06-16T09:00:00', modifiedAt: '2025-06-16T09:00:00', deletedAt: null },
  { diaryId: 17, userId: 1, emotion: 'depressed', memo: '기분이 안 좋았습니다.', recordDate: '2025-06-17', createdAt: '2025-06-17T09:00:00', modifiedAt: '2025-06-17T09:00:00', deletedAt: null },
  { diaryId: 18, userId: 1, emotion: 'angry', memo: '화가 났던 하루였어요.', recordDate: '2025-06-18', createdAt: '2025-06-18T09:00:00', modifiedAt: '2025-06-18T09:00:00', deletedAt: null },
  { diaryId: 19, userId: 1, emotion: 'happy', memo: '좋은 하루였습니다!', recordDate: '2025-06-19', createdAt: '2025-06-19T09:00:00', modifiedAt: '2025-06-19T09:00:00', deletedAt: null },
  { diaryId: 20, userId: 1, emotion: 'sad', memo: '조금 우울했어요.', recordDate: '2025-06-20', createdAt: '2025-06-20T09:00:00', modifiedAt: '2025-06-20T09:00:00', deletedAt: null },
  { diaryId: 21, userId: 1, emotion: 'soso', memo: '평범한 하루였습니다.', recordDate: '2025-06-21', createdAt: '2025-06-21T09:00:00', modifiedAt: '2025-06-21T09:00:00', deletedAt: null },
  { diaryId: 22, userId: 1, emotion: 'good', memo: '괜찮은 하루였어요.', recordDate: '2025-06-22', createdAt: '2025-06-22T09:00:00', modifiedAt: '2025-06-22T09:00:00', deletedAt: null },
  { diaryId: 23, userId: 1, emotion: 'depressed', memo: '기분이 많이 안 좋았습니다.', recordDate: '2025-06-23', createdAt: '2025-06-23T09:00:00', modifiedAt: '2025-06-23T09:00:00', deletedAt: null },
  { diaryId: 24, userId: 1, emotion: 'angry', memo: '화가 났던 하루였어요.', recordDate: '2025-06-24', createdAt: '2025-06-24T09:00:00', modifiedAt: '2025-06-24T09:00:00', deletedAt: null },
  { diaryId: 25, userId: 1, emotion: 'happy', memo: '정말 행복한 하루!', recordDate: '2025-06-25', createdAt: '2025-06-25T09:00:00', modifiedAt: '2025-06-25T09:00:00', deletedAt: null },
  { diaryId: 26, userId: 1, emotion: 'sad', memo: '조금 슬펐던 하루였습니다.', recordDate: '2025-06-26', createdAt: '2025-06-26T09:00:00', modifiedAt: '2025-06-26T09:00:00', deletedAt: null },
  { diaryId: 27, userId: 1, emotion: 'soso', memo: '평범한 하루였어요.', recordDate: '2025-06-27', createdAt: '2025-06-27T09:00:00', modifiedAt: '2025-06-27T09:00:00', deletedAt: null },
  { diaryId: 28, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-06-28', createdAt: '2025-06-28T09:00:00', modifiedAt: '2025-06-28T09:00:00', deletedAt: null },
  { diaryId: 29, userId: 1, emotion: 'depressed', memo: '기분이 안 좋았어요.', recordDate: '2025-06-29', createdAt: '2025-06-29T09:00:00', modifiedAt: '2025-06-29T09:00:00', deletedAt: null },
  { diaryId: 30, userId: 1, emotion: 'angry', memo: '화가 났던 하루였습니다.', recordDate: '2025-06-30', createdAt: '2025-06-30T09:00:00', modifiedAt: '2025-06-30T09:00:00', deletedAt: null },

  // 2025년 7월 데이터
  { diaryId: 31, userId: 1, emotion: 'happy', memo: '7월의 시작이 좋았어요!', recordDate: '2025-07-01', createdAt: '2025-07-01T09:00:00', modifiedAt: '2025-07-01T09:00:00', deletedAt: null },
  { diaryId: 32, userId: 1, emotion: 'happy', memo: '좋은 하루였습니다.', recordDate: '2025-07-02', createdAt: '2025-07-02T09:00:00', modifiedAt: '2025-07-02T09:00:00', deletedAt: null },
  { diaryId: 33, userId: 1, emotion: 'soso', memo: '평범한 하루였어요.', recordDate: '2025-07-03', createdAt: '2025-07-03T09:00:00', modifiedAt: '2025-07-03T09:00:00', deletedAt: null },
  { diaryId: 34, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-07-04', createdAt: '2025-07-04T09:00:00', modifiedAt: '2025-07-04T09:00:00', deletedAt: null },
  { diaryId: 35, userId: 1, emotion: 'depressed', memo: '기분이 안 좋았어요.', recordDate: '2025-07-05', createdAt: '2025-07-05T09:00:00', modifiedAt: '2025-07-05T09:00:00', deletedAt: null },
  { diaryId: 36, userId: 1, emotion: 'angry', memo: '화가 났던 하루였습니다.', recordDate: '2025-07-06', createdAt: '2025-07-06T09:00:00', modifiedAt: '2025-07-06T09:00:00', deletedAt: null },
  { diaryId: 37, userId: 1, emotion: 'happy', memo: '정말 좋은 하루!', recordDate: '2025-07-07', createdAt: '2025-07-07T09:00:00', modifiedAt: '2025-07-07T09:00:00', deletedAt: null },
  { diaryId: 38, userId: 1, emotion: 'sad', memo: '조금 슬펐던 하루였어요.', recordDate: '2025-07-08', createdAt: '2025-07-08T09:00:00', modifiedAt: '2025-07-08T09:00:00', deletedAt: null },
  { diaryId: 39, userId: 1, emotion: 'soso', memo: '평범한 하루였습니다.', recordDate: '2025-07-09', createdAt: '2025-07-09T09:00:00', modifiedAt: '2025-07-09T09:00:00', deletedAt: null },
  { diaryId: 40, userId: 1, emotion: 'good', memo: '괜찮은 하루였어요.', recordDate: '2025-07-10', createdAt: '2025-07-10T09:00:00', modifiedAt: '2025-07-10T09:00:00', deletedAt: null },
  { diaryId: 41, userId: 1, emotion: 'depressed', memo: '기분이 많이 안 좋았습니다.', recordDate: '2025-07-11', createdAt: '2025-07-11T09:00:00', modifiedAt: '2025-07-11T09:00:00', deletedAt: null },
  { diaryId: 42, userId: 1, emotion: 'angry', memo: '화가 났던 하루였어요.', recordDate: '2025-07-12', createdAt: '2025-07-12T09:00:00', modifiedAt: '2025-07-12T09:00:00', deletedAt: null },

  // 2025년 8월 데이터
  { diaryId: 43, userId: 1, emotion: 'happy', memo: '8월의 시작이 좋았어요!', recordDate: '2025-08-01', createdAt: '2025-08-01T09:00:00', modifiedAt: '2025-08-01T09:00:00', deletedAt: null },
  { diaryId: 44, userId: 1, emotion: 'sad', memo: '조금 우울한 하루였습니다.', recordDate: '2025-08-02', createdAt: '2025-08-02T09:00:00', modifiedAt: '2025-08-02T09:00:00', deletedAt: null },
  { diaryId: 45, userId: 1, emotion: 'soso', memo: '평범한 하루였어요.', recordDate: '2025-08-03', createdAt: '2025-08-03T09:00:00', modifiedAt: '2025-08-03T09:00:00', deletedAt: null },
  { diaryId: 46, userId: 1, emotion: 'good', memo: '괜찮은 하루였습니다.', recordDate: '2025-08-04', createdAt: '2025-08-04T09:00:00', modifiedAt: '2025-08-04T09:00:00', deletedAt: null },
  { diaryId: 47, userId: 1, emotion: 'depressed', memo: '기분이 안 좋았어요.', recordDate: '2025-08-05', createdAt: '2025-08-05T09:00:00', modifiedAt: '2025-08-05T09:00:00', deletedAt: null },
  { diaryId: 48, userId: 1, emotion: 'angry', memo: '화가 났던 하루였습니다.', recordDate: '2025-08-06', createdAt: '2025-08-06T09:00:00', modifiedAt: '2025-08-06T09:00:00', deletedAt: null },
  { diaryId: 49, userId: 1, emotion: 'happy', memo: '정말 좋은 하루!', recordDate: '2025-08-07', createdAt: '2025-08-07T09:00:00', modifiedAt: '2025-08-07T09:00:00', deletedAt: null },
  { diaryId: 50, userId: 1, emotion: 'sad', memo: '조금 슬펐던 하루였어요.', recordDate: '2025-08-08', createdAt: '2025-08-08T09:00:00', modifiedAt: '2025-08-08T09:00:00', deletedAt: null },
  { diaryId: 51, userId: 1, emotion: 'soso', memo: '평범한 하루였습니다.', recordDate: '2025-08-09', createdAt: '2025-08-09T09:00:00', modifiedAt: '2025-08-09T09:00:00', deletedAt: null },
  { diaryId: 52, userId: 1, emotion: 'good', memo: '괜찮은 하루였어요.', recordDate: '2025-08-10', createdAt: '2025-08-10T09:00:00', modifiedAt: '2025-08-10T09:00:00', deletedAt: null },
  { diaryId: 53, userId: 1, emotion: 'depressed', memo: '기분이 많이 안 좋았습니다.', recordDate: '2025-08-11', createdAt: '2025-08-11T09:00:00', modifiedAt: '2025-08-11T09:00:00', deletedAt: null },
  { diaryId: 54, userId: 1, emotion: 'angry', memo: '화가 났던 하루였어요.', recordDate: '2025-08-12', createdAt: '2025-08-12T09:00:00', modifiedAt: '2025-08-12T09:00:00', deletedAt: null },
];

// 날짜 범위에 맞는 일기 데이터 필터링 (공통 로직)
const filterDiariesByDateRange = (from: string, to: string) => {
  const startDate = dayjs(from);
  const endDate = dayjs(to);
  
  return mockDiaryData.filter(diary => {
    const diaryDate = dayjs(diary.recordDate);
    return (diaryDate.isSame(startDate, 'day') || diaryDate.isAfter(startDate, 'day')) && 
           (diaryDate.isSame(endDate, 'day') || diaryDate.isBefore(endDate, 'day'));
  });
};

// 일기 데이터를 RecordDiaryTab 형식으로 변환하는 함수
export const getMockDiaryData = (from: string, to: string) => {
  return filterDiariesByDateRange(from, to).map(diary => ({
    date: diary.recordDate,
    character: diary.emotion,
    content: diary.memo,
  }));
};

// 일기 데이터를 API 형식으로 반환하는 함수
export const getMockDiaryDataForAPI = (from: string, to: string) => {
  return filterDiariesByDateRange(from, to);
};
