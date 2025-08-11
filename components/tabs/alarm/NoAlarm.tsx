import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';
import { syongsyongTypography } from '../../../constants/typography';

const NoAlarm = ({ onAddAlarmPress }: { onAddAlarmPress: () => void }) => {
  return (
    <View style={styles.container}>
        <Image source={require('../../../assets/images/alarm/no_content.png')} style={styles.noContentImage} />
        <View style={styles.noContentTextContainer}>
            <Text style={{...syongsyongTypography.title6, textAlign: 'center'}}>지금은 울릴 알람이 없어요.{"\n"}알람으로 하루를 시작해보세요!</Text>
            <ButtonSmall title="알람 추가하기" variant="active" onPress={onAddAlarmPress}/>
        </View> 
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  noContentImage: {
    width: 100,
    height: 71,
  },
  noContentTextContainer: {
    alignItems: 'center',
    gap: 30,
  },
});

export default NoAlarm;