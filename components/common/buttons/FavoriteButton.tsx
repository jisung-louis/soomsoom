import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StarIcon from '../../../assets/icons/common/star.svg';
import { colors } from '../../../constants/colors';
import LottieView from 'lottie-react-native';

interface FavoriteButtonProps {
  onPress: () => void;
  isFavorite: boolean;
  isLoading: boolean;
}

const FavoriteButton = ({ onPress, isFavorite, isLoading }: FavoriteButtonProps) => {
    const [showLottie, setShowLottie] = useState(false);
    const onPressLocal = () => {
        if (!isFavorite) {
            setShowLottie(true);
        }
        onPress();
      }
    return (
        <View style={{ position: 'relative' }}>
            <TouchableOpacity onPress={onPressLocal} disabled={isLoading}>
                <StarIcon width={32} height={32} color={isFavorite ? colors.primary300 : colors.grayScale500} />
            </TouchableOpacity>
            {showLottie && (
                <LottieView
                    source={require('../../../assets/animations/icon-motion/up_star.json')}
                    autoPlay={showLottie}
                    loop={false}
                    style={styles.lottie}
                    onAnimationFinish={() => {
                        setShowLottie(false);
                    }}
                />)}
        </View>
    );
};

const styles = StyleSheet.create({
    lottie: {
        position: 'absolute',
        top: -16,
        left: -14,
        width: 60,
        height: 60,
        zIndex: 2,
    },
});

export default FavoriteButton;