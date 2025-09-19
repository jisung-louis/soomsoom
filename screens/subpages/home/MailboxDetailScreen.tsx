import React from "react";
import { StyleSheet, View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SubpageHeader from "../../../components/common/top-navigation/SubpageHeader";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { HomeStackParamList } from "../../../navigations/tabs/HomeStackNavigator";
import { syongsyongTypography, typography } from "../../../constants/typography";
import { colors } from "../../../constants/colors";
import { MailData, typeMap } from "./MailboxScreen";
import { ss, sv } from "../../../utils/scale";

const MailboxDetailScreen = ({route}: {route: RouteProp<HomeStackParamList, 'MailboxDetailScreen'>}) => {
  const { content } = route.params;
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader title={typeMap[content.type]} onBack={handleBack} />
      <ScrollView style={styles.contentContainer}>
        <View style={styles.imageContainer}>
            <Image source={content.imageUrl ? { uri: content.imageUrl } : require('../../../assets/images/common/placeholder.png')} style={styles.image} />
        </View>
        <View style={styles.mainContainer}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.content}>{content.content}</Text>
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
  contentContainer: {
    flex: 1,
  },
  imageContainer: {
    width: ss(375),
    height: sv(280),
    backgroundColor: colors.grayScale200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mainContainer: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    ...syongsyongTypography.title5,
    color: colors.grayScale900,
  },
  content: {
    ...typography.body2,
    color: colors.grayScale500,
  },
});

export default MailboxDetailScreen;