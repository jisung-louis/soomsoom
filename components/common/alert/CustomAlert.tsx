import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import XButton from '../../../assets/icons/common/close.svg';
import { Button, ButtonProps } from '../buttons/Button';

const { width: screenWidth } = Dimensions.get('window');

export type AlertButton = {
  text: string;
  onPress: () => void;
  buttonVariants?: ButtonProps['variant'];
};

type CustomAlertProps = {
  visible: boolean;
  message: string;
  subMessage?: string;
  buttons: AlertButton[];
  onClose?: () => void;
};

const CustomAlert = ({ visible, message, subMessage, buttons, onClose }: CustomAlertProps) => {
  const handleBackdropPress = () => {
    if (onClose) {
      onClose();
    }
  };
  
  // 버튼 기본 버튼 스타일 설정 (buttonVariants 없을 시 기본 버튼 스타일 설정)
  const defaultButtonVariant = (index: number) => {
    if (buttons.length === 1) {
      return 'active';
    } else if (buttons.length === 2) {
      return index === 0 ? 'default' : 'active';
    } else {
      return 'active';
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={handleBackdropPress}
      >
        <TouchableOpacity 
          style={styles.alertContainer} 
          activeOpacity={1}
          onPress={() => {}} // 내부 터치 시 닫히지 않도록
        >
          {/* X 버튼 */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <XButton width={24} height={24} />
          </TouchableOpacity>

          {/* 메시지 */}
          <View style={styles.messageContainer}>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* 서브메시지 */}
          {subMessage && (
          <View style={styles.subMessageContainer}>
            <Text style={styles.subMessage}>{subMessage}</Text>
          </View>
          )}
          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Button
                key={index}
                title={button.text}
                onPress={button.onPress}
                variant={button.buttonVariants || defaultButtonVariant(index)}
                style={{flex: 1}}
              />
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: colors.white,
    borderRadius: radius.r16,
    padding: 20,
    marginHorizontal: 20,
    width: screenWidth - 40,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.body4,
    color: colors.grayScale700,
  },
  messageContainer: {
    marginTop: 20,
  },
  message: {
    ...syongsyongTypography.title6,
    textAlign: 'center',
  },
  subMessageContainer: {
    marginTop: 12,
  },
  subMessage: {
    ...typography.body2,
    color: colors.grayScale500,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.r12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    flex: 1,
  },
  halfButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary500,
  },
  secondaryButton: {
    backgroundColor: colors.grayScale100,
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
  dangerButton: {
    backgroundColor: colors.grayScale800,
  },
  buttonText: {
    ...typography.body4,
  },
  primaryButtonText: {
    color: colors.white,
  },
  secondaryButtonText: {
    color: colors.grayScale700,
  },
  dangerButtonText: {
    color: colors.white,
  },
});

export default CustomAlert;
