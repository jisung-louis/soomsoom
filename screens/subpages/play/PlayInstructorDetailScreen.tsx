import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { contentData, instructorsData } from '../../../data/playContentData';
import { radius } from '../../../constants/radius';
import { Button } from '../../../components/common/buttons/Button';
import { Surface } from '../../../components/common/surface/Surface';
import ProgramList from '../../../components/tabs/play/common/ProgramList';
import { usePlayStore } from '../../../stores/playStore';
import { useToast } from '../../../contexts/ToastContext';

const PlayInstructorDetailScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const route = useRoute<RouteProp<PlayStackParamList, 'PlayInstructorDetailScreen'>>();
    const { instructorId } = route.params;
    const { toggleFollowInstructor, isFollowingInstructor } = usePlayStore();
    const { showToast } = useToast();
    const handleBack = () => {
      navigation.goBack();
    };

    const representativeContentData = contentData.filter((item) => item.instructorId === instructorId);
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
            <Image source={instructorsData.find(instructor => instructor.id === instructorId)?.profileImage} style={styles.contentHeaderTitleImage} />
            <Text style={styles.contentHeaderTitle}>{instructorsData.find(instructor => instructor.id === instructorId)?.name} {instructorsData.find(instructor => instructor.id === instructorId)?.title}</Text>
        </View>
        <Text style={styles.bio}>{instructorsData.find(instructor => instructor.id === instructorId)?.bio}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
            title={isFollowingInstructor(instructorId) ? '팔로잉' : '팔로우'}
            icon={isFollowingInstructor(instructorId) ? 'check' : undefined}
            variant={isFollowingInstructor(instructorId) ? 'secondary' : 'active'}  
            size='large'
            onPress={() => {
                const wasFollowing = isFollowingInstructor(instructorId);
                toggleFollowInstructor(instructorId);
                showToast({
                    message: wasFollowing ? '선생님 팔로우를 취소했어요' : '새로운 영상이 올라오면, 먼저 알려드릴게요!',
                    iconType: wasFollowing ? 'brokenHeart' : 'alarm',
                    theme: 'dark',
                });
            }}
        />
      </View>
      <Surface style={{marginTop: 50}}/>
      <View style={styles.representativeContentContainer}>
        <Text style={styles.representativeContentTitle}>대표 프로그램</Text>
        <View style={styles.representativeContentList}>
          <View style={styles.representativeContentItem}>
            {/* TODO: 강사 별 대표 프로그램 조회 API 로직 추가 (지금은 목업 데이터 사용) */}
            <ProgramList programData={representativeContentData} />
          </View>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 30,
    gap: 20,
  },
  contentHeader: {
    alignItems: 'center',
    gap: 16,
  },
  contentHeaderTitle: {
    ...typography.heading7,
    color: colors.grayScale900,
  },
  contentHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  contentHeaderTitleImage: {
    width: 140,
    height: 140,
    borderRadius: radius.max,
  },
  bio: {
    ...typography.body2,
    color: colors.grayScale500,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  representativeContentContainer: {
    paddingHorizontal: 20,
    marginTop: 50,
    gap: 20,
  },
  representativeContentTitle: {
    ...typography.heading9,
    color: colors.grayScale900,
  },
  representativeContentList: {
    gap: 20,
  },
  representativeContentItem: {
    flex: 1,
  },
});

export default PlayInstructorDetailScreen;