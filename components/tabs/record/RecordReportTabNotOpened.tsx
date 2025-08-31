import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Emoji from '../../../assets/icons/record/report/cat_write.svg';
import { typography, syongsyongTypography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { Button } from '../../common/buttons/Button';
import { ButtonSmall } from '../../common/buttons/ButtonSmall';

const RecordReportTabNotOpened = () => {
  return (
    <View style={styles.container}>
        <View style={styles.contentContainer}>
            <Emoji width={100} height={100} />
            <View style={styles.contentTextContainer}>
                <Text style={styles.contentTextTitle}>리포트를 만드는 중이에요!</Text>
                <Text style={styles.contentTextDescription}>감정 기록 일주일 이상 쌓이면, 리포트가 열려요!</Text>
            </View>
        </View>
        <ButtonSmall
            title="기록 확인하기"
            onPress={() => {}}
            variant="active"
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  contentTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  contentTextTitle: {
    ...syongsyongTypography.title6,
    color: colors.grayScale900,
  },
  contentTextDescription: {
    ...typography.body5,
    color: colors.grayScale500,
  },
});
export default RecordReportTabNotOpened;