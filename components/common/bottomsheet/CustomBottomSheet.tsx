import React, { useCallback } from "react";
import BottomSheet, { BottomSheetBackdrop, BottomSheetProps, BottomSheetView } from "@gorhom/bottom-sheet";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Portal } from '@gorhom/portal';
import CloseIcon from "../../../assets/icons/common/close.svg";
 
interface CustomBottomSheetProps extends BottomSheetProps {
  bottomSheetModalRef: React.RefObject<BottomSheet | null>;
  children: React.ReactNode;
  hasSnapPoints?: boolean;
  hasBackDrop?: boolean;
  hasXButton?: boolean;
  snapPoints?: string[];
  enableDynamicSizing?: boolean;
  style?: StyleProp<ViewStyle>;
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
  ...props
}) => {
  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );
  return (
    <Portal>
      <BottomSheet
        ref={bottomSheetModalRef}
        index={-1}
        snapPoints={hasSnapPoints ? snapPoints : undefined}
        style={[style,{
          zIndex: 10,
          elevation: 10,
        }]}
        backdropComponent={hasBackDrop ? renderBackdrop : undefined}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={true}
        handleComponent={null}
        {...props}
      >
        <BottomSheetView style={{ flex: 1 }}>
          {hasXButton && (
            <TouchableOpacity style={styles.closeButton} onPress={() => bottomSheetModalRef.current?.close()}>
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
  closeButton: {
    alignSelf: 'flex-end',
    padding: 20,
  },
});
 
export default CustomBottomSheet;