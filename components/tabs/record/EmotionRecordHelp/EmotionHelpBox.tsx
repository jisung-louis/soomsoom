import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../constants/colors';
import { typography } from '../../../../constants/typography';
import { radius } from '../../../../constants/radius';

interface EmotionHelpBoxProps {
  number: string | number;
  title: string;
  content: string;
  source?: string;
}

const EmotionHelpBox: React.FC<EmotionHelpBoxProps> = ({ number, title, content, source }) => (
  <View style={styles.contentBox}>
    <View style={styles.contentBoxHeader}>
      <View style={styles.contentBoxHeaderLeft}>
        <Text style={styles.contentBoxHeaderLeftText}>{number}</Text>
      </View>
      <Text style={styles.contentBoxTitle}>{title}</Text>
    </View>
    <View style={styles.contentBoxContent}>
      <Text style={styles.contentBoxContentText}>{content}</Text>
    </View>
    {source && (
      <View style={styles.contentBoxContent}>
        <Text style={styles.sourceText}>{source}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  contentBox: {
    borderRadius: radius.r16,
    backgroundColor: colors.primary50,
    padding: 20,
    gap: 16,
  },
  contentBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  contentBoxTitle: {
    ...typography.body1,
    color: colors.grayScale800,
  },
  contentBoxHeaderLeft: {
    width: 24,
    height: 24,
    borderRadius: radius.r6,
    backgroundColor: colors.primary300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBoxHeaderLeftText: {
    ...typography.body4,
    color: colors.white,
  },
  contentBoxContent: {},
  contentBoxContentText: {
    ...typography.body5,
    color: colors.primary900,
    lineHeight: 20,
  },
  sourceText: {
    ...typography.caption4,
    color: colors.primary600,
    alignSelf: 'flex-end',
  },
});

export default EmotionHelpBox; 