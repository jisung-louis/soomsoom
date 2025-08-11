import { create } from 'zustand';
import { scheduleAlarm, cancelAlarmNotifications } from '../services/alarmNotificationService';
import { sortDays } from '../utils/dayDisplayUtils';

export interface AlarmItem {
  id: number;
  time: string;
  isActive?: boolean;
  day: string[];
  repeatType?: string;
  soundName?: string;
  isVibrationOn?: boolean;
}

export interface AlarmData {
  time: string;
  repeatDays: string[];
  repeatType: string;
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
}

interface AlarmStore {
  alarmList: AlarmItem[];
  addAlarm: (alarmData: AlarmData) => Promise<string>;
  getAlarmById: (id: number) => AlarmItem | undefined;
  updateAlarm: (id: number, alarmData: AlarmData) => Promise<void>;
  deleteAlarm: (id: number) => Promise<void>;
  toggleAlarm: (id: number) => Promise<void>;
  updateAlarmList: (alarmList: AlarmItem[]) => void;
}

const initialAlarmList: AlarmItem[] = []; // 빈 배열로 시작

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarmList: initialAlarmList,
  
  addAlarm: async (alarmData: AlarmData) => {
    const sortedDays = sortDays(alarmData.repeatDays); // 요일 정렬
    
    const newAlarm: AlarmItem = {
      id: Date.now(),
      time: alarmData.time,
      day: sortedDays, // 정렬된 요일 사용
      repeatType: alarmData.repeatType,
      soundName: alarmData.soundName,
      isVibrationOn: alarmData.isVibrationOn,
      isActive: true,
    };
    
    // Zustand 스토어에 알람 추가
    set((state) => ({
      alarmList: [...state.alarmList, newAlarm],
    }));
    
    // 알림 스케줄링
    try {
      const success = await scheduleAlarm({
        id: String(newAlarm.id),
        time: alarmData.time,
        repeatDays: sortedDays, // 정렬된 요일 사용
        soundName: alarmData.soundName,
        isVibrationOn: alarmData.isVibrationOn,
        title: alarmData.title || '알람',
        body: alarmData.body || `알람 시간입니다 (${alarmData.time})`,
      });
      
      if (success) {
        console.log(`알람 ${newAlarm.id} 알림 예약 성공`);
      } else {
        console.error(`알람 ${newAlarm.id} 알림 예약 실패`);
      }
    } catch (error) {
      console.error('알람 추가 중 알림 예약 실패:', error);
    }
    
    return String(newAlarm.id);
  },
  
  deleteAlarm: async (id: number) => {
    // 알림 취소
    try {
      await cancelAlarmNotifications(String(id));
      console.log(`알람 ${id} 알림 취소 완료`);
    } catch (error) {
      console.error(`알람 ${id} 알림 취소 실패:`, error);
    }
    
    // Zustand 스토어에서 알람 삭제
    set((state) => ({
      alarmList: state.alarmList.filter((item) => item.id !== id),
    }));
  },
  
  toggleAlarm: async (id: number) => {
    const state = get();
    const alarm = state.alarmList.find(item => item.id === id);
    
    if (!alarm) return;
    
    const newIsActive = !alarm.isActive;
    
    if (newIsActive) {
      // 알람 활성화 - 알림 예약
      try {
        const success = await scheduleAlarm({
          id: String(alarm.id),
          time: alarm.time,
          repeatDays: alarm.day,
          soundName: alarm.soundName || '기본',
          isVibrationOn: alarm.isVibrationOn || false,
          title: '알람',
          body: `알람 시간입니다 (${alarm.time})`,
        });
        
        if (success) {
          console.log(`알람 ${id} 알림 예약 성공`);
        } else {
          console.error(`알람 ${id} 알림 예약 실패`);
        }
      } catch (error) {
        console.error(`알람 ${id} 알림 예약 실패:`, error);
      }
    } else {
      // 알람 비활성화 - 알림 취소
      try {
        await cancelAlarmNotifications(String(id));
        console.log(`알람 ${id} 알림 취소 완료`);
      } catch (error) {
        console.error(`알람 ${id} 알림 취소 실패:`, error);
      }
    }
    
    // Zustand 스토어 업데이트
    set((state) => ({
      alarmList: state.alarmList.map((item) => {
        if (item.id === id) {
          return { ...item, isActive: newIsActive };
        }
        return item;
      }),
    }));
  },
  
  getAlarmById: (id: number) => {
    const state = get();
    return state.alarmList.find(alarm => alarm.id === id);
  },
  
  updateAlarm: async (id: number, alarmData: AlarmData) => {
    const sortedDays = sortDays(alarmData.repeatDays);
    
    // 기존 알림 취소
    try {
      await cancelAlarmNotifications(String(id));
      console.log(`알람 ${id} 기존 알림 취소 완료`);
    } catch (error) {
      console.error(`알람 ${id} 기존 알림 취소 실패:`, error);
    }
    
    // Zustand 스토어에서 알람 업데이트
    set((state) => ({
      alarmList: state.alarmList.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            time: alarmData.time,
            day: sortedDays,
            repeatType: alarmData.repeatType,
            soundName: alarmData.soundName,
            isVibrationOn: alarmData.isVibrationOn,
          };
        }
        return item;
      }),
    }));
    
    // 새로운 알림 스케줄링
    try {
      const success = await scheduleAlarm({
        id: String(id),
        time: alarmData.time,
        repeatDays: sortedDays,
        soundName: alarmData.soundName,
        isVibrationOn: alarmData.isVibrationOn,
        title: alarmData.title || '알람',
        body: alarmData.body || `알람 시간입니다 (${alarmData.time})`,
      });
      
      if (success) {
        console.log(`알람 ${id} 알림 예약 성공`);
      } else {
        console.error(`알람 ${id} 알림 예약 실패`);
      }
    } catch (error) {
      console.error('알람 수정 중 알림 예약 실패:', error);
    }
  },
  
  updateAlarmList: (alarmList: AlarmItem[]) => {
    set({ alarmList });
  },
})); 