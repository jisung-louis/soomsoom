import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HomeStackParamList } from '../../../navigations/tabs/HomeStackNavigator';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { colors } from '../../../constants/colors';
import { typography } from '../../../constants/typography';

type ShopScreenNavigationProp = StackNavigationProp<HomeStackParamList, 'ShopScreen'>;

const ShopScreen = () => {
  const navigation = useNavigation<ShopScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} title="상점" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>상점에 오신 것을 환영합니다! 🛍️</Text>
          <Text style={styles.subtitle}>귀여운 아이템들을 구매해보세요</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>인기 상품</Text>
          <View style={styles.itemGrid}>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>선글라스</Text>
              <Text style={styles.itemPrice}>300 💚</Text>
            </View>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>모자</Text>
              <Text style={styles.itemPrice}>250 💚</Text>
            </View>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>목도리</Text>
              <Text style={styles.itemPrice}>400 💚</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>신상품</Text>
          <View style={styles.itemGrid}>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>우산</Text>
              <Text style={styles.itemPrice}>500 💚</Text>
            </View>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>가방</Text>
              <Text style={styles.itemPrice}>600 💚</Text>
            </View>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>장화</Text>
              <Text style={styles.itemPrice}>350 💚</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>할인 상품</Text>
          <View style={styles.itemGrid}>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>안경</Text>
              <Text style={styles.itemPrice}>
                <Text style={styles.originalPrice}>400</Text> 300 💚
              </Text>
            </View>
            <View style={styles.item}>
              <View style={styles.itemImage} />
              <Text style={styles.itemName}>스카프</Text>
              <Text style={styles.itemPrice}>
                <Text style={styles.originalPrice}>450</Text> 350 💚
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    ...typography.heading4,
    color: colors.grayScale900,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body3,
    color: colors.grayScale600,
    textAlign: 'center',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    ...typography.heading6,
    color: colors.grayScale800,
    marginBottom: 20,
  },
  itemGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  item: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.grayScale50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.grayScale200,
  },
  itemImage: {
    width: 80,
    height: 80,
    backgroundColor: colors.grayScale200,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemName: {
    ...typography.body4,
    color: colors.grayScale800,
    textAlign: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    ...typography.body3,
    color: colors.primary600,
    fontWeight: '600',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: colors.grayScale500,
    marginRight: 8,
  },
});

export default ShopScreen;
