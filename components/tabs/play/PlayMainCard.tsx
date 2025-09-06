import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Badge from '../../common/badge/Badge';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { Button } from '../../common/buttons/Button';
import PlayTitle from './common/PlayTitle';

const PlayMainCard = ({ style, onPress }: { style?: StyleProp<ViewStyle>, onPress?: () => void }) => (
  <View style={[styles.mainCardContainer, style]}>
    <PlayTitle title='playMainCard' showArrow={false} />
    <View style={styles.card}>
      <ImageBackground
        source={require('../../../assets/images/play/playMainCard/background_image_default.png')} //임시 이미지
        style={styles.image}
      >
        <LinearGradient
          colors={['transparent', 'rgba(11, 11, 11, 0.6)']}
          style={styles.gradient}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View style={styles.overlayContent}>
            <View style={styles.labelContainer}>
              <Badge title='명상' variant='default' />
              <Text style={styles.title}>나를 돌아보는, {"\n"}순간 건포도 명상</Text>
            </View>
            <Button title='명상 하러가기' variant='white' style={{alignSelf: 'center', width: '100%', height: 48}} onPress={onPress}/>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  </View>
);

const styles = StyleSheet.create({
  mainCardContainer: {
    gap: 20,
  },
  card: {
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 380,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  overlayContent: {
    gap : 13,
  },
  labelContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  title: {
    ...typography.heading7,
    color: colors.white,
  },
});

export default PlayMainCard; 