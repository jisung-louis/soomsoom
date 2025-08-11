import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import ArrowLeftIcon from '../../../assets/icons/common/arrow_back.svg';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

interface SubpageHeaderProps {
  onBack?: () => void;
  title?: string;
  right?: React.ReactNode;
  showBackButton?: boolean;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const SubpageHeader: React.FC<SubpageHeaderProps> = ({
  onBack,
  title,
  right,
  showBackButton = true,
  onLayout,
  style,
}) => (
  <View style={[styles.header, style]} onLayout={onLayout}>
    {showBackButton ? (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ArrowLeftIcon width={36} height={36} color={colors.grayScale800} />
      </TouchableOpacity>
    ) : (
      <View style={styles.backButton} />
    )}
    {title ? <Text style={styles.title}>{title}</Text> : <View style={{ flex: 1 }} />}
    {right ? right : <View style={styles.rightPlaceholder} />}
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.grayScale800,
    flex: 1,
    textAlign: 'center',
    ...typography.body1,
  },
  rightPlaceholder: {
    width: 36,
  },
});

export default SubpageHeader; 