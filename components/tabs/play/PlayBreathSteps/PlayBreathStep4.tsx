import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../../navigations/tabs/PlayStackNavigator';

// 카운트다운 아이콘들
import Count5 from '../../../../assets/icons/play/playBreath/count_5.svg';
import Count4 from '../../../../assets/icons/play/playBreath/count_4.svg';
import Count3 from '../../../../assets/icons/play/playBreath/count_3.svg';
import Count2 from '../../../../assets/icons/play/playBreath/count_2.svg';
import Count1 from '../../../../assets/icons/play/playBreath/count_1.svg';
import Count0 from '../../../../assets/icons/play/playBreath/count_0.svg';

interface PlayBreathStep4Props {
  navigation: StackNavigationProp<PlayStackParamList>;
}

/**
 * 호흡 운동 Step 4: 카운트다운
 * 
 * 🎯 책임:
 * - 5초 카운트다운 표시
 * - 카운트다운 완료 시 결과 화면으로 이동
 */
export const PlayBreathStep4: React.FC<PlayBreathStep4Props> = ({ navigation }) => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (count > 0) {
        setCount(count - 1);
      } else {
        navigation.navigate('PlayResultScreen');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [count, navigation]);

  const renderCountIcon = () => {
    switch (count) {
      case 5:
        return <Count5 />;
      case 4:
        return <Count4 />;
      case 3:
        return <Count3 />;
      case 2:
        return <Count2 />;
      case 1:
        return <Count1 />;
      case 0:
        return <Count0 />;
      default:
        return <Count5 />;
    }
  };

  return (
    <View style={styles.container}>
      {renderCountIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: '90%',
    justifyContent: 'center',
  },
});
