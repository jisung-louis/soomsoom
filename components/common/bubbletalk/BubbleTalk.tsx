import React, { useMemo } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

interface BubbleTalkProps {
    icon?: React.ReactNode;
    text: string;
    trianglePosition?: 'left' | 'right' | 'bottom' | 'top';
    style?: StyleProp<ViewStyle>;
    bubbleColor?: string;              // default colors.grayScale900
    textStyle?: StyleProp<TextStyle>;  // extra text style
    maxWidth?: number;                 // default 240
    spacing?: number;                  // gap between triangle and bubble, default 0
}

const BubbleTalk = (props: BubbleTalkProps) => {
    const {
        icon,
        text,
        trianglePosition = 'right',
        style,
        bubbleColor = colors.grayScale900,
        textStyle,
        maxWidth = 240,
        spacing = 0,
    } = props;

    const containerVariant = useMemo(() => {
        switch (trianglePosition) {
            case 'top':
            case 'bottom':
                return { flexDirection: 'column' as const, alignItems: 'center' as const };
            case 'left':
            case 'right':
            default:
                return { flexDirection: 'row' as const, alignItems: 'center' as const };
        }
    }, [trianglePosition]);

    return (
        <View style={[styles.container, containerVariant, { gap: spacing }, style]}>
            {trianglePosition === 'left' && (
                <View style={[styles.triangle, styles.triangleleft]} pointerEvents="none" />
            )}
            {trianglePosition === 'top' && (
                <View style={[styles.triangle, styles.triangletop]} pointerEvents="none" />
            )}
            <View style={[styles.bubble, { backgroundColor: bubbleColor, maxWidth }]}>
                {icon && <View style={{width: 32, height: 32}}>{icon}</View>}
                <Text style={[styles.bubbleText, textStyle]} numberOfLines={2} ellipsizeMode="tail">{text}</Text>
            </View>
            {trianglePosition === 'right' && (
                <View style={[styles.triangle, styles.triangleright]} pointerEvents="none" />
            )}
            {trianglePosition === 'bottom' && (
                <View style={[styles.triangle, styles.trianglebottom]} pointerEvents="none" />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bubble: {
        backgroundColor: colors.grayScale900,
        borderRadius: radius.r8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bubbleText: {
        ...typography.caption2,
        color: colors.white,
        flexShrink: 1,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
    },
    triangleleft: {
        borderTopWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 0,
        borderRightColor: colors.grayScale900,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    triangleright: {
        borderTopWidth: 8,
        borderLeftWidth: 8,
        borderBottomWidth: 8,
        borderRightWidth: 0,
        borderLeftColor: colors.grayScale900,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: 'transparent',
    },
    triangletop: {
        borderTopWidth: 0,
        borderRightWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 8,
        borderBottomColor: colors.grayScale900,
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderLeftColor: 'transparent',
    },
    trianglebottom: {
        borderTopWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 0,
        borderLeftWidth: 8,
        borderTopColor: colors.grayScale900,
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
    },
});

export default BubbleTalk;