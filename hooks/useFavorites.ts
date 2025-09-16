import { usePlayStore } from '../stores/playStore';
import {
  Activity,
  getActivityDetail,
  getUserFavoriteActivities,
} from '../services/contentService';
import {
  Instructor,
  getInstructorDetail,
  getFollowedInstructors,
  toggleFollowInstructor,
} from '../services/instructorService';

export function useFavorites() {
  async function fetchFavoriteActivitiesList(): Promise<Activity[]> {
    const response = await getUserFavoriteActivities({ page: 1, size: 12, sort: 'createdAt,desc' });
    // Store 동기화
    usePlayStore.setState({
      favoriteActivities: response.content.map((fav) => ({ activityId: fav.activityId })),
    });
    // 상세 정보 조회
    const activities = await Promise.all(
      response.content.map(async (fav) => {
        try {
          const detail = await getActivityDetail(fav.activityId);
          return detail;
        } catch {
          return {
            id: fav.activityId,
            title: fav.title,
            type: fav.type,
            thumbnailImageUrl: fav.thumbnailImageUrl,
            descriptions: ['상세 정보를 불러올 수 없습니다.'],
            author: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
            narrator: { id: 0, name: '알 수 없음', bio: '', profileImageUrl: null },
            durationInSeconds: fav.durationInSeconds,
            audioUrl: null,
            timeline: [],
            isFavorited: true,
          } as Activity;
        }
      })
    );
    return activities;
  }

  async function fetchFollowedInstructorsList(): Promise<Instructor[]> {
    const response = await getFollowedInstructors({ page: 1, size: 12, sort: 'createdAt,desc' });
    // Store 동기화
    usePlayStore.setState({
      followedInstructors: response.content.map((inst) => ({ instructorId: inst.instructorId })),
    });
    // 상세 정보 조회
    const details = await Promise.all(
      response.content.map(async (inst) => {
        try {
          return await getInstructorDetail(inst.instructorId);
        } catch {
          return {
            instructorId: inst.instructorId,
            name: inst.name,
            bio: '',
            profileImageUrl: inst.profileImageUrl,
            isFollowing: true,
            createdAt: '',
            modifiedAt: '',
            deletedAt: null,
          } as Instructor;
        }
      })
    );
    return details;
  }

  async function toggleFollow(instructorId: number): Promise<void> {
    const { followInstructor, unfollowInstructor, followedInstructors } = usePlayStore.getState();
    await toggleFollowInstructor(instructorId, {
      followInstructor,
      unfollowInstructor,
      isFollowingInstructor: (id) => followedInstructors.some((inst) => inst.instructorId === id),
    });
  }

  return {
    fetchFavoriteActivitiesList,
    fetchFollowedInstructorsList,
    toggleFollow,
  };
}


