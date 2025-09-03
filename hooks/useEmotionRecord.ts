import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import { emotionService, SaveEmotionRecordRequest } from '../services/emotionService';
import { formatDateForServer } from '../utils/timeUtils';
import { AppError, ErrorType } from '../utils/errorHandler';

/**
 * 감정 기록 관련 비즈니스 로직을 관리하는 커스텀 훅
 * 
 * 🎯 책임:
 * - 감정 기록 저장 로직
 * - 유효성 검증
 * - 첫 기록일 체크
 * - 저장 상태 관리
 * 
 * ✅ UI 독립적: 네비게이션/토스트는 화면에서 처리
 */
export const useEmotionRecord = (date: string, emotion: string) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  type EmotionRecordResult = {
    success: boolean;
    firstRecord?: boolean;
    message: string;
    error?: string;
  };

  /**
   * 에러 타입별 사용자 친화적 메시지 반환
   * useCallback으로 최적화하여 불필요한 재생성 방지
   */
  const getErrorMessage = useCallback((error: AppError): string => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return '네트워크 연결을 확인해주세요.';
      case ErrorType.VALIDATION:
        return '입력한 정보를 다시 확인해주세요.';
      case ErrorType.AUTHENTICATION:
        return '로그인이 필요합니다.';
      case ErrorType.PERMISSION:
        return '권한이 없습니다.';
      case ErrorType.API:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '알 수 없는 오류가 발생했습니다.';
    }
  }, []); // 의존성 없음 - 순수 함수

  /**
   * 입력값 유효성 검사
   * useMemo로 최적화하여 content가 변경될 때만 재계산
   */
  const isValidContent = useMemo(() => {
    return content.trim().length > 0;
  }, [content]);

  /**
   * 감정 기록 저장
   * @returns 저장 결과 정보
   */
  const saveEmotionRecord = useCallback(async (): Promise<EmotionRecordResult> => {
    if (isSaving) {
      return {
        success: false,
        message: '저장 중입니다. 잠시만 기다려주세요.',
        error: 'DUPLICATE_SAVE'
      };
    }

    // 유효성 검증 (useMemo로 최적화된 값 사용)
    if (!isValidContent) {
      return {
        success: false,
        message: '내용을 입력해주세요 !',
        error: 'VALIDATION_ERROR'
      };
    }

    setIsSaving(true);

    try {
      // 감정 기록 데이터 구성 (서버 기준 날짜 형식 사용)
      const emotionRecordData: SaveEmotionRecordRequest = {
        date: formatDateForServer(date), // Asia/Seoul 타임존 기준
        emotion,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      console.log('[감정 기록 저장]', emotionRecordData);

      // 백엔드에 저장 요청
      await emotionService.saveEmotionRecord(emotionRecordData);

      // 첫 기록일 체크 (서버 기준 날짜 사용)
      const isFirstRecord = await emotionService.isFirstRecord(formatDateForServer(date));

      return {
        success: true,
        firstRecord: isFirstRecord,
        message: '기록이 저장되었어요!'
      };

    } catch (error) {
      console.error('[감정 기록 저장 실패]', error);
      
      // 에러 타입별 처리
      if (error instanceof AppError) {
        return {
          success: false,
          message: getErrorMessage(error),
          error: error.code
        };
      }
      
      // 기타 에러
      return {
        success: false,
        message: '기록 저장에 실패했어요. 다시 시도해주세요.',
        error: 'UNKNOWN_ERROR'
      };
    } finally {
      if (mountedRef.current) {
        setIsSaving(false);
      }
    }
  }, [content, date, emotion, isValidContent, getErrorMessage, isSaving]);

  /**
   * 내용 업데이트 함수
   * useCallback으로 최적화하여 불필요한 재생성 방지
   */
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  /**
   * 포맷된 날짜
   * useMemo로 최적화하여 date가 변경될 때만 재계산
   */
  const formattedDate = useMemo(() => {
    return dayjs(date).format('MM.DD');
  }, [date]);

  return {
    // 상태
    content,
    isSaving,
    isValidContent, // 최적화된 유효성 검사 결과 노출
    
    // 액션
    setContent: updateContent,
    saveEmotionRecord,
    
    // 유틸리티
    formattedDate,
  };
};
