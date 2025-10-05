import React from 'react';
import { Image, ImageSourcePropType, ImageResizeMode } from 'react-native';
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
    style
  } = options;

  // image가 { uri: string } 형태인 경우
  if (typeof image === 'object' && 'uri' in image && typeof image.uri === 'string') {
    const imageUrl = image.uri;
    
    if (isSvgUrl(imageUrl)) {
      // SVG인 경우
      const svgWidth = width || (isCollection ? '100%' : 80);
      const svgHeight = height || (isCollection ? '100%' : 80);
      
      return (
        <SvgUri
          uri={imageUrl}
          width={svgWidth}
          height={svgHeight}
          style={style || (isCollection ? {} : { width: 80, height: 80 })}
        />
      );
    } else {
      // PNG, JPG 등 일반 이미지인 경우
      const imageResizeMode = resizeMode || (itemType === '배경' && !isCollection ? "cover" : "contain");
      const imageStyle = style || [
        isCollection ? {} : { width: 80, height: 80 },
        itemType === '배경' && !isCollection ? { width: '100%', height: '100%' } : {}
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
  const imageResizeMode = resizeMode || (itemType === '배경' && !isCollection ? "cover" : "contain");
  const imageStyle = style || [
    isCollection ? {} : { width: 80, height: 80 },
    itemType === '배경' && !isCollection ? { width: '100%', height: '100%' } : {}
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
  style?: any
): React.ReactElement | null => {
  return renderImage(image, {
    isCollection: true,
    style
  });
};

/**
 * 아이템 이미지 렌더링을 위한 편의 함수
 */
export const renderItemImage = (
  image: ImageSourcePropType | null,
  itemType: string = '',
  style?: any
): React.ReactElement | null => {
  return renderImage(image, {
    isCollection: false,
    itemType,
    style
  });
};
