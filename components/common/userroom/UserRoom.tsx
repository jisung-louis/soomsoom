import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoomStore } from '../../../stores/roomStore';
import { roomItemList } from '../../../data/roomItemData';
import { objectPosition, itemStyles } from '../../../constants/roomLayout';
import { ss, sv } from '../../../utils/scale';

export type UserRoomProps = {
  children: React.ReactNode;
  previewMode?: boolean; // 프리뷰 모드 여부
  previewItemIds?: number[]; // 여러 프리뷰 아이템
  cropTop?: number; // 상단에서 잘라낼 height (figma 기준)
  scrollable?: boolean; // 스크롤 가능 여부 (cropTop이 있으면 자동 true)
  scrollViewRef?: React.RefObject<ScrollView>
};

const UserRoom = ({children, previewMode = false, previewItemIds = [], cropTop = 0, scrollable, scrollViewRef}: UserRoomProps) => {
  const placedItems = useRoomStore(state => state.placedItems);
  const replayKey = useRef(0);

  // 프리뷰 아이템을 positionType별로 매핑
  const previewByCategory = useMemo(() => {
    const map: Record<string, number | null> = {};
    previewItemIds.forEach((id) => {
      const item = roomItemList.find(i => i.id === id);
      if (item?.positionType) {
        map[item.positionType] = id;
      }
    });
    return map;
  }, [previewItemIds]);

  useEffect(() => {
    // 애니메이션 아이템이 변경되면 모든 애니메이션 리셋 후 재생
    replayKey.current = replayKey.current === 0 ? 1 : 0;
  }, [previewItemIds]);

  const renderLottieItem = (itemId: number | null, position: { x: number; y: number }, style: any, key: string) => {
    if (!itemId) return null;
    const item = roomItemList.find(i => i.id === itemId);
    if (!item?.lottieJson) return null;
    return (
      <LottieView
        key={`${key}-${itemId}-${replayKey.current}`}
        source={item.lottieJson}
        autoPlay
        loop
        style={[style, {
          top: position.y,
          left: position.x,
        }]}
      />
    );
  };

  const renderImageItem = (itemId: number | null, position: { x: number; y: number }, containerStyle: any, imageStyle: any, key: string) => {
    if (!itemId) return null;
    const item = roomItemList.find(i => i.id === itemId);
    if (!item?.image) return null;
    return (
      <View 
        key={`${key}-${itemId}-${replayKey.current}`}
        style={[containerStyle, {
          top: position.y,
          left: position.x,
        }]}> 
        <Image source={item.image} style={imageStyle} />
      </View>
    );
  };

  const backgroundPreviewId = previewByCategory['background'] ?? null;
  const eyewearPreviewId = previewByCategory['eyewear'] ?? null;
  const hatPreviewId = previewByCategory['hat'] ?? null;
  const floorPreviewId = previewByCategory['floor'] ?? null;
  const shelfPreviewId = previewByCategory['shelf'] ?? null;
  const frame1PreviewId = previewByCategory['frame_1'] ?? null;
  const frame2PreviewId = previewByCategory['frame_2'] ?? null;

  const backgroundImage = (backgroundPreviewId
    ? roomItemList.find(i => i.id === backgroundPreviewId)?.image
    : roomItemList.find(i => i.id === placedItems.background)?.image);

  // cropTop이 있으면 자동으로 스크롤 가능
  const isScrollable = scrollable !== undefined ? scrollable : cropTop > 0;
  
  if (isScrollable) {
    return (
      <View style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <ImageBackground
            source={backgroundImage || require('../../../assets/images/backgrounds/default.png')}
            style={[
              styles.scrollableBackground,
              {paddingBottom: sv(cropTop)+800}, // 추후 동적 계산 고려
              cropTop > 0 && { transform: [{ translateY: -sv(cropTop) }] }
            ]}
            resizeMode="cover"
          >
            <View style={styles.safeArea}>
              {children}
              {/* 기본 캐릭터 요소들 */}
              <LottieView
                key={`cat-${replayKey.current}`}
                source={require('../../../assets/animations/cat.json')}
                autoPlay
                loop
                style={itemStyles.cat}
              />
              <Image
                source={require('../../../assets/icons/items/default-background/shadow_default.png')}
                style={itemStyles.shadow}
              />

              {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
              {renderLottieItem(eyewearPreviewId ?? (previewMode ? null : placedItems.eyewear), objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
              {renderLottieItem(hatPreviewId ?? (previewMode ? null : placedItems.hat), objectPosition.hat, itemStyles.hat, 'hat')}
              {renderImageItem(floorPreviewId ?? (previewMode ? null : placedItems.floor), objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor')}
              {renderImageItem(shelfPreviewId ?? (previewMode ? null : placedItems.shelf), objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf')}
              {renderImageItem(frame1PreviewId ?? (previewMode ? null : placedItems.frame1), objectPosition.frame_1, itemStyles.frameContainer, itemStyles.frame, 'frame_1')}
              {renderImageItem(frame2PreviewId ?? (previewMode ? null : placedItems.frame2), objectPosition.frame_2, itemStyles.frameContainer, itemStyles.frame, 'frame_2')}
            </View>
          </ImageBackground>
        </ScrollView>
      </View>
    );
  }
  
  // 기본 고정 배경
  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage || require('../../../assets/images/backgrounds/default.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {children}
          {/* 기본 캐릭터 요소들 */}
          <LottieView
            key={`cat-${replayKey.current}`}
            source={require('../../../assets/animations/cat.json')}
            autoPlay
            loop
            style={itemStyles.cat}
          />
          <Image
            source={require('../../../assets/icons/items/default-background/shadow_default.png')}
            style={itemStyles.shadow}
          />

          {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
          {renderLottieItem(eyewearPreviewId ?? placedItems.eyewear, objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
          {renderLottieItem(hatPreviewId ?? placedItems.hat, objectPosition.hat, itemStyles.hat, 'hat')}
          {renderImageItem(floorPreviewId ?? placedItems.floor, objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor')}
          {renderImageItem(shelfPreviewId ?? placedItems.shelf, objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf')}
          {renderImageItem(frame1PreviewId ?? placedItems.frame1, objectPosition.frame_1, itemStyles.frameContainer, itemStyles.frame, 'frame_1')}
          {renderImageItem(frame2PreviewId ?? placedItems.frame2, objectPosition.frame_2, itemStyles.frameContainer, itemStyles.frame, 'frame_2')}
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  scrollableBackground: {
    width: ss(375),
    height: sv(812),
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  safeArea: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollableContent: {
    flex: 1,
    zIndex: 1,
  },
});

export default UserRoom;