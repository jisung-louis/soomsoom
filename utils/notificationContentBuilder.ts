import { MathMission, MultiStepMission } from './mathMissionGenerator';

export interface AlarmLikeData {
  id: string;
  time: string;
  repeatDays?: string[];
  soundName: string;
  isVibrationOn: boolean;
  title?: string;
  body?: string;
  mission?: MultiStepMission | MathMission | null;
}

/**
 * 알람 알림 제목/본문을 일관 규칙으로 생성
 */
export function buildAlarmNotificationContent(params: {
  alarmData: AlarmLikeData;
  currentMission?: MathMission | null;
}): { title: string; body: string } {
  const { alarmData, currentMission } = params;

  const hasMission = !!(alarmData.mission || currentMission);

  if (hasMission) {
    const title = alarmData.title || '🔔 띠리링!';
    const body = alarmData.body || '알람 시간이에요! \n클릭하여 미션을 풀고 알람을 해제해주세요!';
    return { title, body };
  }

  const title = alarmData.title || '🔔 띠리링!';
  const body = alarmData.body || '알람 시간이에요! 일어나세요!';
  return { title, body };
}


