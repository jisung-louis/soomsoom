import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, ScrollView } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoomStore } from '../../../stores/roomStore';
import { getItems } from '../../../services/itemService';
import { objectPosition, itemStyles } from '../../../constants/roomLayout';
import { ss, sv } from '../../../utils/scale';
import Shadow from '../../../assets/icons/items/default-background/shadow.svg'
import { colors } from '../../../constants/colors';

export type UserRoomProps = {
  children: React.ReactNode;
  previewMode?: boolean; // 프리뷰 모드 여부
  previewItemIds?: number[]; // 여러 프리뷰 아이템
  cropTop?: number; // 상단에서 잘라낼 height (figma 기준)
  scrollable?: boolean; // 스크롤 가능 여부 (cropTop이 있으면 자동 true)
  scrollViewRef?: React.RefObject<ScrollView>
  onBackgroundImageUri?: (uri: string) => void; // 배경 이미지 URI 전달 콜백
};

const UserRoom = ({children, previewMode = false, previewItemIds = [], cropTop = 0, scrollable, scrollViewRef, onBackgroundImageUri}: UserRoomProps) => {
  const placedItems = useRoomStore(state => state.placedItems);
  const replayKey = useRef(0);
  const [itemMap, setItemMap] = React.useState<Map<number, { image?: any; lottieJson?: any; positionType?: string }>>(new Map());

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItems({ sort: 'CREATED', page: 1, size: 200 });
        const map = new Map<number, { image?: any; lottieJson?: any; positionType?: string }>();
        res.content.forEach((it) => {
          map.set(it.id, {
            image: typeof it.imageUrl === 'string' ? undefined : (it.imageUrl as any),
            lottieJson: typeof it.lottieUrl === 'string' ? undefined : (it.lottieUrl as any),
            positionType: it.equipSlot?.toLowerCase?.(),
          });
        });
        if (mounted) setItemMap(map);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // 프리뷰 아이템을 positionType별로 매핑
  const previewByCategory = useMemo(() => {
    const map: Record<string, number | null> = {};
    const frameItems: number[] = [];
    
    previewItemIds.forEach((id) => {
      const item = itemMap.get(id);
      if (item?.positionType) {
        if (item.positionType === 'frame') {
          frameItems.push(id);
        } else {
          map[item.positionType] = id;
        }
      }
    });
    
    return { 
      background: map.background ?? null,
      eyewear: map.eyewear ?? null,
      hat: map.hat ?? null,
      floor: map.floor ?? null,
      shelf: map.shelf ?? null,
      frameItems 
    };
  }, [previewItemIds, itemMap]);

  // Lottie 애니메이션이 필요한 아이템들만 필터링
  const lottieItemIds = useMemo(() => {
    return previewItemIds.filter(id => {
      const item = itemMap.get(id);
      return item?.lottieJson;
    });
  }, [previewItemIds, itemMap]);

  useEffect(() => {
    // Lottie 애니메이션 아이템이 변경될 때만 애니메이션 리셋 후 재생
    if (lottieItemIds.length > 0) {
      replayKey.current = replayKey.current === 0 ? 1 : 0;
    }
  }, [lottieItemIds]);

  const renderLottieItem = useCallback((itemId: number | null, position: { x: number; y: number }, style: any, key: string) => {
    if (!itemId) return null;
    const item = itemMap.get(itemId);
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
  }, [replayKey.current, itemMap]);

  const renderImageItem = useCallback((itemId: number | null, position: { x: number; y: number }, containerStyle: any, imageStyle: any, key: string) => {
    if (!itemId) return null;
    const item = itemMap.get(itemId);
    if (!item?.image) return null;
    return (
      <View 
        style={[containerStyle, {
          top: position.y,
          left: position.x,
        }]}> 
        <Image source={item.image} style={imageStyle} />
      </View>
    );
  }, [replayKey.current, itemMap]);

  const backgroundPreviewId = previewByCategory.background;
  const eyewearPreviewId = previewByCategory.eyewear;
  const hatPreviewId = previewByCategory.hat;
  const floorPreviewId = previewByCategory.floor;
  const shelfPreviewId = previewByCategory.shelf;
  
  // frame 프리뷰 아이템 처리
  const framePreviewIds = (() => {
    const frameItems = previewByCategory.frameItems || [];
    // frame 배열이 있는 경우, 2개 슬롯에 맞춰 배치
    return [
      frameItems[0] ?? null,
      frameItems[1] ?? null
    ];
  })();
  
  // frame 배열 안전하게 접근
  const frameItems = placedItems.frame || [null, null];

  const backgroundImage = (backgroundPreviewId
    ? itemMap.get(backgroundPreviewId)?.image
    : itemMap.get(placedItems.background || -1)?.image);

  // 배경 이미지 URI를 부모로 전달
  useEffect(() => {
    const src = backgroundImage || require('../../../assets/images/backgrounds/default.png');
    try {
      const resolved = typeof src === 'number' ? Image.resolveAssetSource(src)?.uri : (src?.uri ?? src);
      if (resolved && typeof resolved === 'string') {
        onBackgroundImageUri?.(resolved);
      }
    } catch {}
  }, [backgroundImage, onBackgroundImageUri]);
  
  // cropTop이 있으면 자동으로 스크롤 가능
  //const isScrollable = scrollable !== undefined ? scrollable : cropTop > 0;
  
  if (scrollable) {
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
                source={require('../../../assets/animations/cat_basic_motion.json')}
                autoPlay
                loop
                style={itemStyles.cat}
              />
              {/* <Image
                source={require('../../../assets/icons/items/default-background/shadow_default.png')}
                style={itemStyles.shadow}
              /> */}
              <Shadow width={itemStyles.shadowSize.width} height={itemStyles.shadowSize.height} style={itemStyles.shadowStyle} color={itemStyles.shadowColor} opacity={itemStyles.shadowOpacity} />

              {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
              {renderLottieItem(eyewearPreviewId ?? (previewMode ? null : placedItems.eyewear), objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
              {renderLottieItem(hatPreviewId ?? (previewMode ? null : placedItems.hat), objectPosition.hat, itemStyles.hat, 'hat')}
              {renderImageItem(floorPreviewId ?? (previewMode ? null : placedItems.floor), objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor')}
              {renderImageItem(shelfPreviewId ?? (previewMode ? null : placedItems.shelf), objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf')}
              {renderImageItem(framePreviewIds[0] ?? (previewMode ? null : frameItems[0]), objectPosition.frame0, itemStyles.frameContainer, itemStyles.frame, 'frame0')}
              {renderImageItem(framePreviewIds[1] ?? (previewMode ? null : frameItems[1]), objectPosition.frame1, itemStyles.frameContainer, itemStyles.frame, 'frame1')}
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
        style={[styles.background, cropTop>0 && {transform: [{translateY: -sv(cropTop)}]}]}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {children}
          {/* 기본 캐릭터 요소들 */}
          <LottieView
            key={`cat-${replayKey.current}`}
            source={require('../../../assets/animations/cat_basic_motion.json')}
            autoPlay
            loop
            style={itemStyles.cat}
          />
          {/* <Image
            source={require('../../../assets/icons/items/default-background/shadow_default.png')}
            style={itemStyles.shadow}
          /> */}
          <Shadow width={itemStyles.shadowSize.width} height={itemStyles.shadowSize.height} style={itemStyles.shadowStyle} color={itemStyles.shadowColor} opacity={itemStyles.shadowOpacity} />

          {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
          {renderLottieItem(eyewearPreviewId ?? placedItems.eyewear, objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
          {renderLottieItem(hatPreviewId ?? placedItems.hat, objectPosition.hat, itemStyles.hat, 'hat')}
          {renderImageItem(floorPreviewId ?? placedItems.floor, objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor')}
          {renderImageItem(shelfPreviewId ?? placedItems.shelf, objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf')}
          {renderImageItem(framePreviewIds[0] ?? frameItems[0], objectPosition.frame0, itemStyles.frameContainer, itemStyles.frame, 'frame0')}
          {renderImageItem(framePreviewIds[1] ?? frameItems[1], objectPosition.frame1, itemStyles.frameContainer, itemStyles.frame, 'frame1')}
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