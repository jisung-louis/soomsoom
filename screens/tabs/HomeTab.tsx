import React, { useState } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, ImageBackground, LayoutRectangle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopNavigation from '../../components/common/top-navigation/TopNavigation';
import MoreMenu from '../../components/tabs/home/MoreMenu';
import LottieView from 'lottie-react-native';

const HomeTab = () => {
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [catLayout, setCatLayout] = useState<LayoutRectangle>({x: 0, y: 0, width: 0, height: 0});

  
  return (
    <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
      <ImageBackground 
        source={require('../../assets/images/background.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <TopNavigation 
            onMoreMenuToggle={(visible) => setMoreMenuVisible(visible)}
            moreMenuVisible={moreMenuVisible}
          />
          {/* 여기에 고양이, 텍스트 등 추가 */}
          <LottieView
            key="head"
            source={require('../../assets/animations/sunglass_motion.json')}
            autoPlay
            loop
            style={[styles.sunglass, {
              top: catLayout.y + 17,
              left: catLayout.x + 29,
            }]}
          />
          <LottieView
            key="cat"
            source={require('../../assets/animations/cat.json')}
            autoPlay
            loop
            style={[styles.cat, {
            }]}
            onLayout={(event) => {
              setCatLayout(event.nativeEvent.layout);
            }}
          />
        </SafeAreaView>
        <MoreMenu 
          visible={moreMenuVisible} 
          style={styles.moreMenu} 
          onClose={() => setMoreMenuVisible(false)} 
        />
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  moreMenu: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 1000,
  },
  cat: {
    width: 200,
    height: 200,
    position: 'absolute',
    top: 349,
    left: 106,
    zIndex: 1000,
  },
  sunglass: {
    width: 80,
    height: 80,
    position: 'absolute',
    zIndex: 10000,
  },
});

export default HomeTab; 