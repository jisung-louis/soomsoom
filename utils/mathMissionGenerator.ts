export interface MathMission {
    question: string;
    answer: number;
  }

export interface MultiStepMission {
    type: 'math';
    missions: MathMission[];
    currentIndex: number;
    total: number;
}
  
  // 일의 자리 사칙연산 수학 문제 생성
  export const generateMathMission = (): MathMission => {
    const a = Math.floor(Math.random() * 9) + 1; // 1~9
    const b = Math.floor(Math.random() * 9) + 1; // 1~9
    const operations = ['+', '-', '*', '/'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let question: string;
    let answer: number;
    
    switch (op) {
      case '+':
        default:
        question = `${a} + ${b} = ?`;
        answer = a + b;
        break;
      case '-':
        // 음수가 나오지 않도록 큰 수에서 작은 수를 빼도록 함
        const [bigger, smaller] = a >= b ? [a, b] : [b, a];
        question = `${bigger} - ${smaller} = ?`;
        answer = bigger - smaller;
        break;
      case '*':
        question = `${a} × ${b} = ?`;
        answer = a * b;
        break;
      case '/':
        // 나누어떨어지는 수로만 구성
        const product = a * b;
        question = `${product} ÷ ${a} = ?`;
        answer = b;
        break;
    }
    
    return {
      question,
      answer
    };
  };
  
  // 미션 타입에 따른 문제 생성 (현재는 수학만)
  export const generateMissionByType = (missionType: string): MathMission | null => {
    switch (missionType) {
      case 'math':
        return generateMathMission();
      default:
        return null;
    }
  };
  
  // MissionData 기반 다회 미션 생성기
  export const generateMissionsByData = (params: { missionType: string; missionCount: number }): MultiStepMission | null => {
    const count = Math.max(1, Math.floor(params.missionCount || 1));
    switch (params.missionType) {
      case 'math': {
        const missions: MathMission[] = Array.from({ length: count }, () => generateMathMission());
        return {
          type: 'math',
          missions,
          currentIndex: 0,
          total: missions.length,
        };
      }
      default:
        return null;
    }
  };
  
  // 정답 검증 함수
  export const validateMathAnswer = (
    mission: MathMission, 
    userAnswer: string | number
  ): { isCorrect: boolean; shouldDismiss: boolean } => {
    const { answer } = mission;
    const isCorrect = parseInt(userAnswer.toString()) === answer;
    // 시도 제한 없음: 정답일 때만 해제
    const shouldDismiss = isCorrect;
    return { isCorrect, shouldDismiss };
  };