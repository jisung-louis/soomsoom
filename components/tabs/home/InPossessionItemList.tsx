import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { CollectionDetail } from '../../../services/collectionService';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import EmotionIcon from '../../../assets/icons/common/emotion.svg';
import { typography } from '../../../constants/typography';
import CheckIcon from '../../../assets/icons/common/check.svg';

type Props = {
  collection: CollectionDetail;
  onClose?: () => void;
};

const InPossessionItemList: React.FC<Props> = ({ collection, onClose }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={collection.items}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemImageContainer}>
              <Image source={item.imageUrl as any} style={styles.itemImage} resizeMode="contain" />
              {item.isOwned && 
                <View style={styles.itemOwnedDimmedContainer}>
                    <CheckIcon width={40} height={40} color={colors.white} />
                </View>
              }
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <View style={styles.itemPriceContainer}>
                <EmotionIcon width={16} height={16} />
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.grayScale900,
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.grayScale100,
    borderRadius: radius.r12,
  },
  closeText: {
    color: colors.grayScale700,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.grayScale50,
    borderRadius: radius.r8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  itemInfo: {
    gap: 4,
  },
  itemName: {
    color: colors.grayScale900,
    fontSize: 14,
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
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: 56,
    height: 56,
  },
  itemOwnedDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,170,51,0.6)',
    borderRadius: radius.r8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatList: {
    width: '100%',
  },
  contentContainer: {
    gap: 10,
  },
});

export default InPossessionItemList;