import React from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import FavoriteIcon from '../../../assets/icons/common/star.svg';
import { typography } from '../../../constants/typography';
import PersonIcon from '../../../assets/icons/common/Person.svg';
import AudioIcon from '../../../assets/icons/common/Vol.svg';
import { mockInstructorsData } from '../../../data/playContentData';
import ToastView from '../../../components/common/toast/ToastView';
import { Button } from '../../../components/common/buttons/Button';
import { usePlayStore } from '../../../stores/playStore';
import AuthorInfo from '../../../components/tabs/play/common/AuthorInfo';

const PlayDetailScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const route = useRoute<RouteProp<PlayStackParamList, 'PlayDetailScreen'>>();
  const { content } = route.params;
  const { toggleFavorite, isFavorite } = usePlayStore();
  
  const handleBack = () => {
    navigation.goBack();
  };
  
  const handleToggleFavorite = () => {
    toggleFavorite(content.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
      <SubpageHeader onBack={handleBack} />
        <View style={styles.imageContainer}>
          <Image source={content.image} style={styles.image} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <View style={styles.contentHeaderTitleContainer}>
              <Text style={styles.contentHeaderTitle}>{content.title.join(' ')}</Text>
              <TouchableOpacity onPress={handleToggleFavorite}>
                <FavoriteIcon 
                  width={32} 
                  height={32} 
                  color={isFavorite(content.id) ? colors.primary500 : colors.grayScale500} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.contentInfoContainer}>
              <AuthorInfo
                instructorId={content.instructorId}
                guide={content.guide}
                onPressInstructor={() => {navigation.navigate('PlayInstructorDetailScreen', { instructorId: content.instructorId })}}
              />
              <View style={styles.instructorAndAudioContainer}>
                <AudioIcon width={24} height={24} color={colors.grayScale600} />
                <TouchableOpacity onPress={() => {}}>
                  <Text style={styles.contentInfo}>{content.type} • {content.time}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.contentDescription}>{content.description.join('\n')}</Text>
        </View>
        <View style={styles.toastContainer}>
          <ToastView
            message='잠깐! 시작전에 소리를 키워주세요!'
            theme='light'
            iconType='help'
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title='마음운동 시작하기'
            variant='active'
            size='large'
            onPress={() => {content.type === 'breath' ? navigation.navigate('PlayBreathScreen', {content: content}) : navigation.navigate('PlayMeditationScreen', {content: content})}}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PlayDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  imageContainer: {
    marginHorizontal: 20,
    overflow: 'hidden',
    height: 193,
    borderRadius: radius.r16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    gap: 30,
    marginTop: 20,
  },
  contentHeader: {
    gap:10,
  },
  contentHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentHeaderTitle: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  contentInfoContainer: {
    gap: 2,
  },
  contentInfo: {
    ...typography.body5,
    color: colors.grayScale400,
  },
  instructorAndAudioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  instructorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentBody: {
    flex: 1,
  },
  contentDescription: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  button: {
    flex: 1,
  },
});