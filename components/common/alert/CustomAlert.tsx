import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { colors } from '../../../constants/colors';
import { syongsyongTypography, typography } from '../../../constants/typography';
import { radius } from '../../../constants/radius';
import XButton from '../../../assets/icons/common/close.svg';
import { Button, ButtonProps } from '../buttons/Button';
import LottieView from 'lottie-react-native';
import { ss, sv, sx } from '../../../utils/scale';
import { renderImage } from '../../../utils/imageUtils';

const { width: screenWidth } = Dimensions.get('window');

export type AlertButton = {
  text: string;
  icon?: 'check' | 'heart';
  onPress: () => void;
  buttonVariants?: ButtonProps['variant'];
};

type CustomAlertProps = {
  visible: boolean;
  image?: string | number | { uri: string } | { lottie: number | string | { uri: string } };
  particle?: boolean;
  message: string;
  subMessage?: string;
  buttons: AlertButton[];
  onClose?: () => void;
  closeButton?: boolean;
};

const CustomAlert = ({ visible, image, particle=false, message, subMessage, buttons, onClose, closeButton = true }: CustomAlertProps) => {
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

  // 간단한 강조(빨간색) 렌더러: **텍스트** 부분만 빨간색 처리
  const renderHighlightedText = (text: string, baseStyle: any) => {
    // '**...**' 토큰을 보존하여 분리
    const parts = text.split(/(\*\*.+?\*\*)/g);
    return (
      <Text style={baseStyle}>
        {parts.map((part, idx) => {
          const match = part.match(/^\*\*(.+)\*\*$/);
          if (match) {
            return (
              <Text key={idx} style={{ color: 'red', textShadowColor: 'red'  }}>
                {match[1]}
              </Text>
            );
          }
          return <Text key={idx}>{part}</Text>;
        })}
      </Text>
    );
  };

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
          {closeButton && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <XButton width={24} height={24} />
            </TouchableOpacity>
          )}

          {/* 이미지 */}
          {image && (
            // 명시적 Lottie 포맷: { lottie: ... }
            <View style={styles.imageContainer}>
              {particle && (
                <LottieView
                  source={require('../../../assets/animations/popup_particle.json')}
                  autoPlay
                  loop={false}
                  style={styles.particle}
                />
              )}
              {(typeof image === 'object' && 'lottie' in image) ? (
                <LottieView
                  source={
                    typeof (image as any).lottie === 'string'
                      ? (image as any).lottie
                      : (image as any).lottie
                  }
                  autoPlay
                  loop
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : typeof image === 'string' && image.endsWith('.json') ? (
                <LottieView source={image} autoPlay loop style={styles.image} resizeMode="contain" />
              ) : typeof image === 'string' || typeof image === 'object' && 'uri' in image ? ( //uri 형태일때
                renderImage(
                  image as any,
                  {
                    style: styles.image,
                    resizeMode: 'contain'
                  }
                )
              ) : typeof image === 'number' ? (
                renderImage(
                  image,
                  {
                    style: styles.image,
                    resizeMode: 'contain'
                  }
                )
              ) : null}
            </View>
          )}
          

          {/* 메시지 */}
          <View style={styles.messageContainer}>
            {typeof message === 'string' ? (
              renderHighlightedText(message, styles.message)
            ) : (
              <Text style={styles.message}>{message}</Text>
            )}
          </View>

          {/* 서브메시지 */}
          {subMessage && (
          <View style={styles.subMessageContainer}>
            {typeof subMessage === 'string' ? (
              renderHighlightedText(subMessage, styles.subMessage)
            ) : (
              <Text style={styles.subMessage}>{subMessage}</Text>
            )}
          </View>
          )}
          {/* 버튼들 */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <Button
                icon={button.icon}
                key={index}
                title={button.text}
                onPress={button.onPress}
                textStyle={{...typography.body4}}
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
  particle: {
    position: 'absolute',
    top: -sv(32),
    left: sx(105) - 20 - 20,
    width: ss(164),
    height: sv(164),
    zIndex: -100,
  },
  closeButton: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...typography.body4,
    color: colors.grayScale700,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
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
