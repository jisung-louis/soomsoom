import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import InPossessionIcon from '../../../assets/icons/my/room-decoration/in_possession.svg';
import AccessoryIcon from '../../../assets/icons/my/room-decoration/accessory.svg';
import FurnitureIcon from '../../../assets/icons/my/room-decoration/furniture.svg';
import OrnamentIcon from '../../../assets/icons/my/room-decoration/ornament.svg';
import WallPaperIcon from '../../../assets/icons/my/room-decoration/wallpaper.svg';
import { typography } from '../../../constants/typography';
import { colors } from '../../../constants/colors';
import { radius } from '../../../constants/radius';
import EmotionIcon from '../../../assets/icons/common/emotion.svg';
import Badge from '../../../components/common/badge/Badge';
import CheckIcon from '../../../assets/icons/common/stroke_check copy.svg';



const ITEM_IMAGE_WIDTH = 105;
const ITEM_IMAGE_HEIGHT = 105;

const tabMenu = [
  {
    icon: InPossessionIcon,
    title: '보유중',
  },
  {
    icon: AccessoryIcon,
    title: '악세사리',
  },
  {
    icon: FurnitureIcon,
    title: '가전 ・ 가구',
  },
  {
    icon: OrnamentIcon,
    title: '장식품',
  },
  {
    icon: WallPaperIcon,
    title: '벽지 ・ 바닥',
  },
];

const InPossessionItems = [1, 7, 8]; // 보유중 아이템 아이디 리스트

type ItemList = {
  id: number;
  type?: string;
  title?: string;
  image?: string;
  price?: number;
  __isPlaceholder?: boolean;
};

const itemList: ItemList[] = [
  {
    id: 1,
    type: '악세사리',
    title: '선글라스',
    image: require('../../../assets/animations/sunglass_motion.json'),
    price: 300,
  },
  {
    id: 2,
    type: '가전 ・ 가구',
    title: '가전1',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 3,
    type: '장식품',
    title: '장식품1',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 4,
    type: '벽지 ・ 바닥',
    title: '벽지1',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 5,
    type: '악세사리',
    title: '악세사리2',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 6,
    type: '가전 ・ 가구',
    title: '가전2',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 7,
    type: '장식품',
    title: '장식품2',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 8,
    type: '벽지 ・ 바닥',
    title: '벽지2',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: 9,
    type: '악세사리',
    title: '악세사리3',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
  {
    id: 10,
    type: '악세사리',
    title: '악세사리4',
    image: 'https://via.placeholder.com/150',
    price: 300,
  },
];

// 3의 배수로 맞추는 패딩 함수
function padToThreeColumns(data: ItemList[]) {
    const remainder = data.length % 3;
    if (remainder === 0) return data;
    const placeholders = Array(3 - remainder).fill(null).map((_, idx) => ({
      __isPlaceholder: true,
      id: 0,
      image: '',
      title: '',
      price: 0,
    }));
    return [...data, ...placeholders];
  }

const MyRoomDecoration = ({selectedTab, handleTabPress}: {selectedTab: number, handleTabPress: (index: number) => void}) => {
    const InPossessionItemData: ItemList[] = itemList.filter(item => InPossessionItems.includes(item.id));
    const filteredData = selectedTab === 0
      ? InPossessionItemData
      : itemList.filter(item => item.type === tabMenu[selectedTab].title);
    const paddedData = padToThreeColumns(filteredData);
    const isOwned = (id: number) => InPossessionItems.includes(id);
    const [selectedItems, setSelectedItems] = useState<number[]>([]); // 방에 꾸며진 아이템 아이디 리스트

    const handleItemPress = (id: number) => {
        setSelectedItems(selectedItems.includes(id) ? selectedItems.filter(itemId => itemId !== id) : [...selectedItems, id]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabMenuContainer}>
                {tabMenu.map((item, index) => (
                    <TouchableOpacity style={styles.tabMenu} key={index} onPress={() => handleTabPress(index)}>
                        <item.icon width={44} height={44} style={selectedTab === index ? styles.tabMenuIcon : styles.tabMenuIconUnselected} />
                        <Text style={selectedTab === index ? styles.tabMenuTitle : styles.tabMenuTitleUnselected}>{item.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList 
            style={styles.itemListContainer}
            data={paddedData} 
            numColumns={3}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
                item.__isPlaceholder ? (
                  <View style={[styles.item, {backgroundColor: 'transparent', elevation: 0, width: ITEM_IMAGE_WIDTH, height: ITEM_IMAGE_HEIGHT}]} key={item.id} />
                ) : (
                  <TouchableOpacity style={styles.item} key={item.id} onPress={() => handleItemPress(item.id)}>
                    {isOwned(item.id) && (
                        <View style={styles.itemBadgeContainer}>
                            <Badge title='보유중' variant='small' />
                        </View>
                    )}
                    {selectedItems.includes(item.id) && (  
                        <View style={styles.yellowDimmedContainer}>
                            <CheckIcon width={56} height={56} color={colors.white} />
                        </View>
                    )}
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {!isOwned(item.id) && (
                          <View style={styles.itemPriceContainer}>
                            <EmotionIcon width={16} height={16} />
                            <Text style={styles.itemPrice}>{item.price}</Text>
                          </View>
                        )}
                      </View>
                  </TouchableOpacity>
                )
            )} 
            keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabMenuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 30,
  },
  tabMenu: {
    alignItems: 'center',
    gap: 6,
    // flex: 1,
  },
  tabMenuTitle: {
    ...typography.body4,
    color: colors.grayScale900,
  },
  tabMenuIcon: {

  },
  tabMenuTitleUnselected: {
    ...typography.body4,
    color: colors.grayScale300,
  },
  tabMenuIconUnselected: {
    opacity: 0.4,
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  itemBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
  },
  itemImage: {
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    borderRadius: radius.r8,
    backgroundColor: colors.grayScale50,
  },
  itemListContainer: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemInfo: {
    gap: 4,
  },
  itemTitle: {
    color: colors.grayScale700,
    textAlign: 'center',
  },
  itemPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemPrice: {
    ...typography.caption1,
    color: colors.grayScale900,
    textAlign: 'center',
  },
  yellowDimmedContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: ITEM_IMAGE_WIDTH,
    height: ITEM_IMAGE_HEIGHT,
    backgroundColor: '#FFAA33',
    opacity: 0.6,
    borderRadius: radius.r8,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MyRoomDecoration;