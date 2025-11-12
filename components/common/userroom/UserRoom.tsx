import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, ScrollView, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useRoomStore } from '../../../stores/roomStore';
import { getItems } from '../../../services/itemService';
import { objectPosition, itemStyles } from '../../../constants/roomLayout';
import { ss, sv } from '../../../utils/scale';
import Shadow from '../../../assets/icons/items/default-background/shadow.svg'
import { colors } from '../../../constants/colors';
import { renderItemImage } from '../../../utils/imageUtils';
import { WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export type UserRoomProps = {
  children: React.ReactNode;
  previewMode?: boolean; // 프리뷰 모드 여부
  previewItemIds?: number[]; // 여러 프리뷰 아이템
  showPlacedItems?: boolean; // 프리뷰 모드에서도 기존 착용 아이템 표시 여부
  cropTop?: number; // 상단에서 잘라낼 height (figma 기준)
  scrollable?: boolean; // 스크롤 가능 여부 (cropTop이 있으면 자동 true)
  scrollViewRef?: React.RefObject<ScrollView>
  onBackgroundImageUri?: (uri: string) => void; // 배경 이미지 URI 전달 콜백
  myTabEditMode?: boolean; // 방 꾸미기 모드 여부
  achievementCardHeight?: number; // 업적 카드 높이
};

const UserRoom = ({children, previewMode = false, previewItemIds = [], showPlacedItems = false, cropTop = 0, scrollable, scrollViewRef, onBackgroundImageUri, myTabEditMode = false, achievementCardHeight = 0}: UserRoomProps) => {
  const placedItems = useRoomStore(state => state.placedItems);
  // 로띠 동기 재생을 위한 ref들
  const catRef = useRef<LottieView | null>(null);
  const itemLottieRefs = useRef<Record<number, LottieView | null>>({});
  const [itemMap, setItemMap] = React.useState<Map<number, { image?: any; lottieJson?: any; positionType?: string; hasShadow?: boolean }>>(new Map());
  const isFocused = useIsFocused();
  const [bottomStripUri, setBottomStripUri] = React.useState<string | null>(null);


  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getItems({ sort: 'CREATED', page: 1, size: 200 });
        const map = new Map<number, { image?: any; lottieJson?: any; positionType?: string; hasShadow?: boolean }>();
        res.content.forEach((it) => {
          map.set(it.id, {
            image: typeof it.imageUrl === 'string' && it.imageUrl.length > 0 ? ({ uri: it.imageUrl } as any) : (it.imageUrl as any) ?? undefined,
            lottieJson: typeof it.lottieUrl === 'string' && it.lottieUrl.length > 0 ? ({ uri: it.lottieUrl } as any) : (it.lottieUrl as any) ?? undefined,
            positionType: it.equipSlot?.toLowerCase?.(),
            hasShadow: typeof it.hasShadow === 'boolean' ? it.hasShadow : undefined,
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
    
    previewItemIds.forEach((id) => {
      const item = itemMap.get(id);
      if (item?.positionType) {
        map[item.positionType] = id; // 카테고리당 1개만 유지
      }
    });
    
    return { 
      background: map.background ?? null,
      eyewear: map.eyewear ?? null,
      hat: map.hat ?? null,
      floor: map.floor ?? null,
      shelf: map.shelf ?? null,
      frame: map.frame ?? null,
    };
  }, [previewItemIds, itemMap]);

  // 실제 렌더링할 아이템들 (프리뷰 우선, 없으면 기존 착용 아이템)
  const renderItems = useMemo(() => {
    if (previewMode && showPlacedItems) {
      // 프리뷰 모드 + 기존 착용 아이템 표시: 프리뷰가 있으면 프리뷰, 없으면 기존 착용
      return {
        background: previewByCategory.background ?? placedItems.background,
        eyewear: previewByCategory.eyewear ?? placedItems.eyewear,
        hat: previewByCategory.hat ?? placedItems.hat,
        floor: previewByCategory.floor ?? placedItems.floor,
        shelf: previewByCategory.shelf ?? placedItems.shelf,
        frame: previewByCategory.frame ?? placedItems.frame,
      };
    } else if (previewMode) {
      // 프리뷰 모드만: 프리뷰 아이템만
      return previewByCategory;
    } else {
      // 일반 모드: 기존 착용 아이템만
      return {
        background: placedItems.background,
        eyewear: placedItems.eyewear,
        hat: placedItems.hat,
        floor: placedItems.floor,
        shelf: placedItems.shelf,
        frame: placedItems.frame,
      };
    }
  }, [previewMode, showPlacedItems, previewByCategory, placedItems]);

  // Lottie 애니메이션이 필요한 아이템들만 필터링
  const lottieItemIds = useMemo(() => {
    let candidateIds: Array<number> = [];
    
    if (previewMode) {
      // 프리뷰 모드: 실제 렌더링되는 아이템들만 사용 (renderItems 기준)
      candidateIds = [
        renderItems.eyewear,
        renderItems.hat,
        renderItems.floor,
        renderItems.shelf,
        renderItems.frame,
      ].filter((v): v is number => typeof v === 'number');
    } else {
      // 일반 모드: 현재 배치된 아이템 ID들 사용
      candidateIds = [
        placedItems.eyewear,
        placedItems.hat,
        placedItems.floor,
        placedItems.shelf,
        placedItems.frame,
      ].filter((v): v is number => typeof v === 'number');
    }

    return candidateIds.filter((id) => {
      const item = itemMap.get(id);
      return Boolean(item?.lottieJson);
    });
  }, [previewMode, renderItems, placedItems, itemMap]);

  // 그림자 표시 여부 계산: BACKGROUND 또는 FLOOR 중 하나라도 hasShadow === false 이면 숨김
  const shouldShowShadow = useMemo(() => {
    const floorId = renderItems?.floor ?? null;
    if (floorId) {
      const v = itemMap.get(floorId)?.hasShadow;
      return v !== false; // undefined 또는 true면 표시, false면 숨김
    }
    const bgId = renderItems?.background ?? null;
    if (bgId) {
      const v = itemMap.get(bgId)?.hasShadow;
      return v !== false;
    }
    return true; // 둘 다 없으면 표시
  }, [renderItems?.floor, renderItems?.background, itemMap]);

  // 디버깅: 렌더링되는 아이템들 확인
  // useEffect(() => {
  //   const currentItems = previewMode ? previewItemIds : [
  //     placedItems.eyewear,
  //     placedItems.hat,
  //     placedItems.floor,
  //     placedItems.shelf,
  //     placedItems.frame
  //   ].filter(Boolean);
    
  //   console.log('🔍 UserRoom 렌더링 아이템들:', {
  //     previewMode,
  //     previewItemIds,
  //     placedItems,
  //     currentItems,
  //     lottieItemIds
  //   });
  // }, [previewMode, previewItemIds, placedItems, lottieItemIds]);

  // 포커스 상태 로그
  // useEffect(() => {
  //   console.log('🔍 UserRoom isFocused', isFocused);
  // }, [isFocused]);

  // 대상 변경 시, ref 바인딩 완료까지 기다린 후 동시에 재생
  useEffect(() => {
    // 사용하지 않는 ref 정리
    Object.keys(itemLottieRefs.current).forEach(k => {
      const id = Number(k);
      if (!lottieItemIds.includes(id)) delete itemLottieRefs.current[id];
    });

    // ref 바인딩 완료까지 폴링으로 대기
    let isCompleted = false; // 성공 완료 플래그
    
    const waitForRefsAndPlay = () => {
      if (isCompleted) return; // 이미 완료되었으면 중단
      
      const cat = catRef.current as any;
      
      // 디버깅: 현재 상태 로그
      // console.log('🔍 ref 상태 체크:', {
      //   lottieItemIds,
      //   catReady: cat && typeof cat.reset === 'function' && typeof cat.play === 'function',
      //   itemRefsStatus: lottieItemIds.map(id => {
      //     const ref = itemLottieRefs.current[id] as any;
      //     return {
      //       id,
      //       hasRef: !!ref,
      //       hasReset: ref && typeof ref.reset === 'function',
      //       hasPlay: ref && typeof ref.play === 'function'
      //     };
      //   })
      // });
      
      const allItemRefsReady = lottieItemIds.every(id => {
        const ref = itemLottieRefs.current[id] as any;
        return ref && typeof ref.reset === 'function' && typeof ref.play === 'function';
      });
      
      // 고양이 ref와 모든 아이템 ref가 준비되었는지 확인
      const catReady = cat && typeof cat.reset === 'function' && typeof cat.play === 'function';
      
      if (catReady && allItemRefsReady) {
        try {
          // 1) 모두 reset 먼저
          cat.reset();
          const itemRefs = lottieItemIds.map(id => itemLottieRefs.current[id] as any).filter(Boolean);
          itemRefs.forEach((ref: any) => {
            try { ref.reset(); } catch {}
          });

          // 2) 50ms 지연 후 동시에 play
          isCompleted = true; // 중복 실행 방지
          setTimeout(() => {
            try { cat.play(); } catch {}
            itemRefs.forEach((ref: any) => {
              try { ref.play(); } catch {}
            });
          }, 50);
          //console.log('✅ 모든 애니메이션 동기화 완료 - 동일 프레임 재생 시작');
        } catch (error) {
          console.warn('애니메이션 재생 중 오류:', error);
        }
      } else {
        // 아직 준비되지 않았으면 50ms 후 다시 시도
        setTimeout(waitForRefsAndPlay, 50);
      }
    };

    // 최대 1초까지만 대기 (무한 대기 방지)
    const timeoutId = setTimeout(() => {
      //console.warn('⚠️ 애니메이션 ref 바인딩 타임아웃 (1초)');
    }, 1000);

    // 즉시 첫 번째 시도
    waitForRefsAndPlay();

    return () => clearTimeout(timeoutId);
  }, [lottieItemIds.join(','), itemMap]);

  // 화면이 처음 포커싱될 때도 동시에 시작되도록 보장
  useEffect(() => {
    if (!isFocused) return;
    // 포커스가 들어오는 프레임에 모두 reset 후 다음 프레임에 일괄 play
    const cat = catRef.current as any;
    const itemRefs = lottieItemIds.map(id => itemLottieRefs.current[id] as any).filter(Boolean);

    const ready = (
      cat && typeof cat.reset === 'function' && typeof cat.play === 'function' &&
      itemRefs.length === lottieItemIds.length &&
      itemRefs.every((r: any) => r && typeof r.reset === 'function' && typeof r.play === 'function')
    );

    if (!ready) return; // 기존 폴링 이펙트가 준비되면 재생 처리함

    try {
      cat.reset();
      itemRefs.forEach((ref: any) => { try { ref.reset(); } catch {} });
      setTimeout(() => {
        try { cat.play(); } catch {}
        itemRefs.forEach((ref: any) => { try { ref.play(); } catch {} });
      }, 100);
    } catch {}
  }, [isFocused, lottieItemIds.join(',')]);

  const renderLottieItem = useCallback((itemId: number | null, position: { x: number; y: number }, style: any, key: string) => {
    if (!itemId) return null;
    const item = itemMap.get(itemId);
    if (!item?.lottieJson) return null;
    return (
      <LottieView
        ref={(ref) => { 
          itemLottieRefs.current[itemId] = ref;
          //console.log(`🔗 아이템 ref 바인딩 완료 (ID: ${itemId})`);
        }}
        source={item.lottieJson}
        autoPlay={false}
        loop={true}
        style={[style, {
          top: position.y,
          left: position.x,
        }]}
      />
    );
  }, [itemMap]);

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
        {renderItemImage(item.image, '', imageStyle, undefined, imageStyle.width, imageStyle.height)}
      </View>
    );
  }, [itemMap]);

  const backgroundPreviewId = previewByCategory.background;
  const eyewearPreviewId = previewByCategory.eyewear;
  const hatPreviewId = previewByCategory.hat;
  const floorPreviewId = previewByCategory.floor;
  const shelfPreviewId = previewByCategory.shelf;
  
  // frame 프리뷰 아이템 처리
  const framePreviewId = previewByCategory.frame;

  const backgroundImage = (backgroundPreviewId
    ? itemMap.get(backgroundPreviewId)?.image
    : itemMap.get(placedItems.background || -1)?.image);

  // 배경 이미지 URI를 부모로 전달
  useEffect(() => {
    const src = backgroundImage || require('../../../assets/images/backgrounds/default.png');
    try {
      const resolved = typeof src === 'number' ? Image.resolveAssetSource(src)?.uri : (src?.uri ?? src);
      if (resolved && typeof resolved === 'string') {
        console.log('[UserRoom] onBackgroundImageUri', resolved);
        onBackgroundImageUri?.(resolved);
      }
    } catch {}
  }, [backgroundImage, onBackgroundImageUri]);

  // 하단 스트립 이미지 생성 (안드로이드/아이오에스 공통)
  useEffect(() => {
    const createBottomStrip = async () => {
      try {
        const src = backgroundImage || require('../../../assets/images/backgrounds/default.png');
        const uri = typeof src === 'number' ? Image.resolveAssetSource(src)?.uri : (src?.uri ?? src);
        if (!uri || typeof uri !== 'string') {
          setBottomStripUri(null);
          return;
        }

        let workingUri = uri;
        const isHttp = workingUri.startsWith('http://') || workingUri.startsWith('https://');
        if (Platform.OS === 'android' && isHttp) {
          try {
            const filename = `${FileSystem.cacheDirectory}bg_strip_${Date.now()}.png`;
            const dl = await FileSystem.downloadAsync(workingUri, filename);
            if (dl?.uri) workingUri = dl.uri;
          } catch {}
        }

        // 고정 폭 리사이즈 후 하단 스트립 크롭
        let resizedUri = workingUri;
        try {
          const resized = await ImageManipulator.manipulateAsync(
            workingUri,
            [{ resize: { width: 400 } }],
            { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
          );
          resizedUri = resized.uri || workingUri;
        } catch {}

        // 크기 조회
        const size = await new Promise<{ width: number; height: number }>((resolve, reject) => {
          Image.getSize(resizedUri, (w, h) => resolve({ width: w, height: h }), (e) => reject(e));
        });
        const bottomCropRatio = 0.01; // 하단 1%
        const minCrop = 24;
        const cropHeight = Math.max(minCrop, Math.floor(size.height * bottomCropRatio));
        const cropRect = { originX: 0, originY: Math.max(0, size.height - cropHeight), width: size.width, height: cropHeight } as const;

        const cropped = await ImageManipulator.manipulateAsync(
          resizedUri,
          [{ crop: cropRect }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
        setBottomStripUri(cropped.uri || null);
      } catch (e) {
        setBottomStripUri(null);
      }
    };
    createBottomStrip();
  }, [backgroundImage]);
  
  // cropTop이 있으면 자동으로 스크롤 가능
  //const isScrollable = scrollable !== undefined ? scrollable : cropTop > 0;
  
  const PADDING_BOTTOM = sv(672) + achievementCardHeight + 126 - WINDOW_HEIGHT;
  
  if (scrollable) {
    return (
      <View style={styles.container}>
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
          alwaysBounceVertical={false}
          overScrollMode="never"
          scrollEnabled={!myTabEditMode}
          contentContainerStyle={
            { paddingBottom: PADDING_BOTTOM }
          }
        >
          {/* <View style={{position: 'absolute', top: 50, left: 50, right: 0, bottom: 0, zIndex: 1000000, width: 50, height: 50, backgroundColor: 'red'}}>
            <Text>{achievementCardHeight}</Text>
            <Text>{PADDING_BOTTOM}</Text>
            <Text>{WINDOW_HEIGHT}</Text>
          </View> */}
          <ImageBackground
            source={backgroundImage || require('../../../assets/images/backgrounds/default.png')}
            style={[
              styles.scrollableBackground,
              cropTop > 0 && { transform: [{ translateY: -sv(cropTop) }] }
            ]}
            resizeMode="cover"
          >
            <View style={styles.safeArea}>
              {children}
              {/* 기본 캐릭터 요소들 */}
              <LottieView
                ref={catRef}
                source={require('../../../assets/animations/cat_basic_motion.json')}
                autoPlay={false}
                loop
                style={itemStyles.cat}
              />
              {/* <Image
                source={require('../../../assets/icons/items/default-background/shadow_default.png')}
                style={itemStyles.shadow}
              /> */}
              {shouldShowShadow && (
                <Shadow width={itemStyles.shadowSize.width} height={itemStyles.shadowSize.height} style={itemStyles.shadowStyle} color={itemStyles.shadowColor} opacity={itemStyles.shadowOpacity} />
              )}

              {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
              {renderLottieItem(renderItems.eyewear, objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
              {renderLottieItem(renderItems.hat, objectPosition.hat, itemStyles.hat, 'hat')}
          {(() => {
            const id = renderItems.floor;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.floor, itemStyles.floor, 'floor')
                : renderImageItem(id, objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor');
            }
            return null;
          })()}
          {(() => {
            const id = renderItems.shelf;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.shelf, itemStyles.shelf, 'shelf')
                : renderImageItem(id, objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf');
            }
            return null;
          })()}
          {(() => {
            const id = renderItems.frame;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.frame, itemStyles.frame, 'frame')
                : renderImageItem(id, objectPosition.frame, itemStyles.frameContainer, itemStyles.frame, 'frame');
            }
            return null;
          })()}
            </View>
          </ImageBackground>
          
          {/* 하단 스트립 영역: 남는 공간을 스트립 이미지로 채움 */}
          <View style={{ position: 'absolute', bottom: 0, height: PADDING_BOTTOM + sv(cropTop), width: '100%',zIndex: -1000 }}>
            {bottomStripUri ? (
              <Image source={{ uri: bottomStripUri }} style={{ position: 'absolute', top: 0, width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, backgroundColor: colors.grayScale100 }} />
            )}
          </View>
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
            ref={catRef}
            source={require('../../../assets/animations/cat_basic_motion.json')}
            autoPlay={false}
            loop
            style={itemStyles.cat}
          />
          {/* <Image
            source={require('../../../assets/icons/items/default-background/shadow_default.png')}
            style={itemStyles.shadow}
          /> */}
          {shouldShowShadow && (
            <Shadow width={itemStyles.shadowSize.width} height={itemStyles.shadowSize.height} style={itemStyles.shadowStyle} color={itemStyles.shadowColor} opacity={itemStyles.shadowOpacity} />
          )}

          {/* 아이템 배치 (프리뷰 우선, 없으면 배치 아이템) */}
          {renderLottieItem(renderItems.eyewear, objectPosition.eyewear, itemStyles.eyewear, 'eyewear')}
          {renderLottieItem(renderItems.hat, objectPosition.hat, itemStyles.hat, 'hat')}
          {(() => {
            const id = renderItems.floor;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.floor, itemStyles.floor, 'floor')
                : renderImageItem(id, objectPosition.floor, itemStyles.floorContainer, itemStyles.floor, 'floor');
            }
            return null;
          })()}
          {(() => {
            const id = renderItems.shelf;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.shelf, itemStyles.shelf, 'shelf')
                : renderImageItem(id, objectPosition.shelf, itemStyles.shelfContainer, itemStyles.shelf, 'shelf');
            }
            return null;
          })()}
          {(() => {
            const id = renderItems.frame;
            if (id) {
              const item = itemMap.get(id);
              return item?.lottieJson
                ? renderLottieItem(id, objectPosition.frame, itemStyles.frame, 'frame')
                : renderImageItem(id, objectPosition.frame, itemStyles.frameContainer, itemStyles.frame, 'frame');
            }
            return null;
          })()}
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