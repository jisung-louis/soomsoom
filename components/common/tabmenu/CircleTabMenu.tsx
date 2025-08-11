import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { ToggleButton } from '../buttons/ToggleButton';
import { radius } from '../../../constants/radius';

interface CircleTabMenuProps<T extends string> {
    tabs: T[];
    selectedTab: T;
    onPress: (tab: T) => void;
}

const CircleTabMenu = <T extends string>({
    tabs,
    selectedTab,
    onPress,
}: CircleTabMenuProps<T>) => {
    return (
        <View style={styles.container}>
            {tabs.map((tab) => {
                const isActive = selectedTab === tab;
                return (
                    <ToggleButton
                        defaultTitle={tab}
                        activeTitle={tab}
                        isActive={!isActive}
                        onPress={() => onPress(tab)}
                        key={tab}
                        style={styles.tab}
                    />
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 32,
        gap: 10,
    },
    tab: {
        borderRadius: radius.max,
        width: 'auto',
        paddingHorizontal: 16,
        paddingVertical: 4,
    },
    tabContent: {
    },
    tabText: {
        ...typography.body5,
    },
    activeTabText: {
        color: colors.primary900,
    },
    badge: {
    },
});

export default CircleTabMenu;