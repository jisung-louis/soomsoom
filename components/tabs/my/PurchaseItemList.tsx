import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { RoomItem } from '../../../data/roomItemData';
import CheckIcon from '../../../assets/icons/common/check_active.svg';
import CheckIconInactive from '../../../assets/icons/common/check_disabled.svg';
import XIcon from '../../../assets/icons/common/x.svg';
import { radius } from '../../../constants/radius';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import HeartIcon from '../../../assets/icons/common/Heart.svg';

interface PurchaseItemListProps {
    item: RoomItem;
    isChecked: boolean;
    onCheckPress: () => void;
    onXPress: () => void;
}

const PurchaseItemList = ({ item, isChecked, onCheckPress, onXPress }: PurchaseItemListProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <TouchableOpacity onPress={onCheckPress}>
                    {isChecked ? <CheckIcon width={24} height={24} /> : <CheckIconInactive width={24} height={24} />}
                </TouchableOpacity>
                <View style={styles.itemInfoContainer}>
                    <View style={styles.itemImageContainer}>
                        <Image source={item.image} style={styles.itemImage} />
                    </View>
                    <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <View style={styles.itemPriceContainer}>
                            <HeartIcon width={16} height={16} />
                            <Text style={styles.itemPrice}>{item.price}</Text>
                        </View>
                    </View>
                </View>
            </View>
            <TouchableOpacity onPress={onXPress}>
                <XIcon width={24} height={24} />
            </TouchableOpacity>
        </View>
    );
};

export default PurchaseItemList;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    itemInfoContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    itemImageContainer: {
        width: 64,
        height: 64,
        borderRadius: radius.r8,
        backgroundColor: colors.grayScale50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemImage: {
        width: 56,
        height: 56,
    },
    itemInfo: {
        justifyContent: 'center',
        gap: 4,
    },
    itemTitle: {
        ...typography.body5,
        color: colors.grayScale700,
    },
    itemPriceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    itemPrice: {
        ...typography.caption1,
        color: colors.grayScale900,
    },
});