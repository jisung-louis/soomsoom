import React, { useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle, Text } from "react-native";
import { Portal } from '@gorhom/portal';
import CloseIcon from "../../../assets/icons/common/close.svg";
import { ButtonSmall, BUTTON_SIZE } from "../buttons/ButtonSmall";
import LottieView from "lottie-react-native";
import { ss, sv } from "../../../utils/scale";
interface CustomBottomSheetProps extends BottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheet | null>;
  children: React.ReactNode;
  hasSnapPoints?: boolean;
  hasBackDrop?: boolean;
  hasXButton?: boolean;
  snapPoints?: Array<string | number>;
  enableDynamicSizing?: boolean;
  style?: StyleProp<ViewStyle>;
  // New: top button/header controls
  hasTopButton?: boolean;
  topButtonTitle?: string;
  onTopButtonPress?: () => void;
  topButtonContainerStyle?: StyleProp<ViewStyle>;
  topButtonOffset?: number; // 바텀시트와의 오프셋(기본값: -20px)
  hasCelebrationParticle?: boolean;
}
 
const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
  bottomSheetModalRef,
  children,
  hasSnapPoints = false,
  snapPoints = hasSnapPoints ? ["30%", "50%"] : undefined,
  enableDynamicSizing = true,
  style,
  hasBackDrop = true,
  hasXButton = true,
  hasTopButton = false,
  topButtonTitle = '저장',
  onTopButtonPress,
  topButtonContainerStyle,
  topButtonOffset = 20,
  hasCelebrationParticle = false,
  ...props
}) => {
  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <>
      {hasCelebrationParticle && (
        <View style={styles.celebrationParticleContainer}>
          <LottieView
            source={require('../../../assets/animations/particle.json')} 
            autoPlay 
            loop
            style={styles.celebrationParticle}
            onAnimationFinish={() => {
              console.log('파티클 애니메이션 완료');
            }}
          />
        </View>
      )}
      <BottomSheetBackdrop
        {...backdropProps}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
      </>
    ),
    [hasCelebrationParticle]
  );

  const renderHandle = useCallback(() => (
    <View pointerEvents="box-none" style={styles.handleContainer}>
      {hasTopButton && (
        <View style={[styles.topButtonWrapper, topButtonContainerStyle, {top: -(topButtonOffset+BUTTON_SIZE.height)}]}>
          <ButtonSmall title={topButtonTitle} variant='active' onPress={onTopButtonPress} style={{width: ss(94)}} />
        </View>
      )}
    </View>
  ), [hasTopButton, topButtonTitle, onTopButtonPress, topButtonContainerStyle]);

  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetModalRef}
        index={-1}
        snapPoints={hasSnapPoints ? snapPoints : undefined}
        style={[style, {
          overflow: 'visible',
        }]}
        containerStyle={{
          zIndex: 10000,
          elevation: 10000, // 안드로이드에서 탭바(elevation: 1000)보다 위에 표시되도록 충분히 높게 설정
        }}
        backgroundStyle={{
          elevation: 10000, // 안드로이드에서 배경에도 elevation 적용
        }}
        backdropComponent={hasBackDrop ? renderBackdrop : undefined}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        handleComponent={renderHandle}
        {...props}
      >
        {/* NOTE: dynamic sizing 모드에서는 flex:1을 제거해야 콘텐츠 높이로 시트가 계산됩니다. */}
        <BottomSheetView 
          style={{marginTop:0, ...(enableDynamicSizing ? { zIndex: 10000 } : { flex: 1, zIndex: 10000 })}}
          pointerEvents="box-none"
        >
          {hasXButton && (
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => bottomSheetModalRef.current?.close()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <CloseIcon width={24} height={24} />
            </TouchableOpacity>
          )}
          {children}
        </BottomSheetView>
      </BottomSheet>
    </Portal>
  );
};

const styles = StyleSheet.create({
  handleContainer: {
    height: 0, // don't occupy vertical space
  },
  topButtonWrapper: {
    position: 'absolute',
    right: 20,
    zIndex: 1000000,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 20,
    zIndex: 10001,
    elevation: 11, // 안드로이드에서 zIndex 대신 elevation 사용
  },

  celebrationParticleContainer: {
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
    zIndex: 10,
    width:ss(375),
    height:sv(350),
  },
  celebrationParticle: {
    width: '100%',
    height: '100%',
  }
});
 
export default CustomBottomSheet;