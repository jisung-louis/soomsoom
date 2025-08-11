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
import { contentData, teachersData } from '../../../data/playContentData';
import { radius } from '../../../constants/radius';
import { Button } from '../../../components/common/buttons/Button';
import { Surface } from '../../../components/common/surface/Surface';
import ProgramList from '../../../components/tabs/play/common/ProgramList';
import { usePlayStore } from '../../../stores/playStore';
import { useToast } from '../../../contexts/ToastContext';

const PlayTeacherDetailScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
    const route = useRoute<RouteProp<PlayStackParamList, 'PlayTeacherDetailScreen'>>();
    const { teacherId } = route.params;
    const { toggleFollowTeacher, isFollowingTeacher } = usePlayStore();
    const { showToast } = useToast();
    const handleBack = () => {
      navigation.goBack();
    };

    const representativeContentData = contentData.filter((item) => item.teacherId === teacherId);
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 100}}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <View style={styles.contentHeader}>
            <Image source={teachersData.find(teacher => teacher.id === teacherId)?.profileImage} style={styles.contentHeaderTitleImage} />
            <Text style={styles.contentHeaderTitle}>{teachersData.find(teacher => teacher.id === teacherId)?.name} {teachersData.find(teacher => teacher.id === teacherId)?.title}</Text>
        </View>
        <Text style={styles.bio}>{teachersData.find(teacher => teacher.id === teacherId)?.bio}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
            title={isFollowingTeacher(teacherId) ? '팔로잉' : '팔로우'}
            icon={isFollowingTeacher(teacherId) ? 'check' : undefined}
            variant={isFollowingTeacher(teacherId) ? 'secondary' : 'active'}  
            size='large'
            onPress={() => {
                toggleFollowTeacher(teacherId);
                showToast({
                    message: isFollowingTeacher(teacherId) ? '선생님 팔로우를 취소했어요' : '새로운 영상이 올라오면, 먼저 알려드릴게요!',
                    iconType: isFollowingTeacher(teacherId) ? 'brokenHeart' : 'alarm',
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
            <ProgramList ProgramData={representativeContentData} />
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

export default PlayTeacherDetailScreen;