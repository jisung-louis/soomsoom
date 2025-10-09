import React from 'react';
import { Image, ImageSourcePropType, ImageResizeMode, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

/**
 * 이미지 URL이 SVG인지 확인하는 함수
 */
export const isSvgUrl = (url: string): boolean => {
  return url.toLowerCase().endsWith('.svg');
};

/**
 * 이미지 렌더링 옵션 인터페이스
 */
export interface ImageRenderOptions {
  isCollection?: boolean;
  itemType?: string;
  width?: number | string;
  height?: number | string;
  resizeMode?: ImageResizeMode;
  style?: any;
  itemContainerSize?: number;
}

/**
 * 이미지 타입에 따라 적절한 컴포넌트로 렌더링하는 함수
 * 
 * @param image - 이미지 소스 (로컬 또는 원격)
 * @param options - 렌더링 옵션
 * @returns 렌더링된 이미지 컴포넌트 또는 null
 */
export const renderImage = (
  image: ImageSourcePropType | null, 
  options: ImageRenderOptions = {}
): React.ReactElement | null => {
  if (!image) return null;

  const {
    isCollection = false,
    itemType = '',
    width,
    height,
    resizeMode,
    style,
    itemContainerSize = 80
  } = options;

  // image가 { uri: string } 형태인 경우
  if (typeof image === 'object' && 'uri' in image && typeof image.uri === 'string') {
    const imageUrl = image.uri;
    
    if (isSvgUrl(imageUrl)) {
      // SVG인 경우
      const svgWidth = width || (isCollection ? '100%' : itemContainerSize);
      const svgHeight = height || (isCollection ? '205%' : itemContainerSize);
      
      return (
        <SvgUri
          uri={imageUrl}
          width={svgWidth}
          height={svgHeight}
          style={style || (isCollection ? {} : { width: itemContainerSize, height: itemContainerSize })}
        />
      );
    } else {
      // PNG, JPG 등 일반 이미지인 경우
      const imageResizeMode = resizeMode || ((itemType === '배경' || itemType === 'BACKGROUND') && !isCollection ? "cover" : "contain");
      const imageStyle = style || [
        isCollection ? {} : { width: itemContainerSize, height: itemContainerSize },
        (itemType === '배경' || itemType === 'BACKGROUND') && !isCollection ? { width: '100%', height: '100%' } : {}
      ];
      
      return (
        <Image 
          source={image} 
          style={imageStyle}
          resizeMode={imageResizeMode}
        />
      );
    }
  }

  // 로컬 이미지인 경우 (require() 등)
  const imageResizeMode = resizeMode || ((itemType === '배경' || itemType === 'BACKGROUND') && !isCollection ? "cover" : "contain");
  const imageStyle = style || [
    isCollection ? {} : { width: itemContainerSize, height: itemContainerSize },
    (itemType === '배경' || itemType === 'BACKGROUND') && !isCollection ? { width: '100%', height: '100%' } : {}
  ];
  
  return (
    <Image 
      source={image} 
      style={imageStyle}
      resizeMode={imageResizeMode}
    />
  );
};

/**
 * 컬렉션 이미지 렌더링을 위한 편의 함수
 */
export const renderCollectionImage = (
  image: ImageSourcePropType | null,
  style?: any,
  itemContainerSize?: number,

): React.ReactElement | null => {
  return renderImage(image, {
    isCollection: true,
    style,
    itemContainerSize,
    resizeMode: 'cover',
  });
};

/**
 * 아이템 이미지 렌더링을 위한 편의 함수
 */
export const renderItemImage = (
  image: ImageSourcePropType | null,
  itemType: string = '',
  style?: any,
  itemContainerSize?: number,
  width?: number,
  height?: number,
): React.ReactElement | null => {
  return renderImage(image, {
    isCollection: false,
    itemType,
    style,
    itemContainerSize,
    width,
    height,
  });
};

/**
 * ImageBackground용 SVG 지원 렌더링 함수
 */
export const renderImageBackground = (
  image: ImageSourcePropType | null,
  style?: any,
  children?: React.ReactNode
): React.ReactElement | null => {
  if (!image) return null;

  // image가 { uri: string } 형태인 경우
  if (typeof image === 'object' && 'uri' in image && typeof image.uri === 'string') {
    const imageUrl = image.uri;
    
    if (isSvgUrl(imageUrl)) {
      // SVG인 경우 - ImageBackground는 SVG를 직접 지원하지 않으므로 View로 감싸서 처리
      return (
        <View style={style}>
          <SvgUri
            uri={imageUrl}
            width="100%"
            height="100%"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {children}
        </View>
      );
    }
  }

  // 일반 이미지인 경우 ImageBackground 사용
  const ImageBackground = require('react-native').ImageBackground;
  return (
    <ImageBackground
      source={image}
      style={style}
    >
      {children}
    </ImageBackground>
  );
};
