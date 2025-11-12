import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MyTab from "../../screens/tabs/MyTab";
import MyAchievementScreen from "../../screens/subpages/my/MyAchievementScreen";
import MySettingScreen from "../../screens/subpages/my/MySettingScreen";
import NotificationSettingScreen from "../../screens/subpages/my/setting/NotificationSettingScreen";
import AccountInfoScreen from "../../screens/subpages/my/setting/AccountInfoScreen";
import NoticeScreen from "../../screens/subpages/my/setting/NoticeScreen";
import InquiryBugScreen from "../../screens/subpages/my/setting/InquiryBugScreen";
import InformationScreen from "../../screens/subpages/my/setting/InformationScreen";
import TermOfServiceScreen from "../../screens/subpages/my/setting/TermOfServiceScreen";
import PrivacyPolicyScreen from "../../screens/subpages/my/setting/PrivacyPolicyScreen";
import MyRoomDecorationPurchaseScreen from "../../screens/subpages/my/room-decoration/MyRoomDecorationPurchaseScreen";

import MyTestScreen from "../../screens/subpages/my/MyTestScreen";

export type MyStackParamList = {
  MyTab: { autoEnterEditMode?: boolean } | undefined;
  MyAchievementScreen: undefined;
  MySettingScreen: undefined;
  NotificationSettingScreen: undefined;
  AccountInfoScreen: undefined;
  NoticeScreen: undefined;
  InquiryBugScreen: undefined;
  InformationScreen: undefined;
  TermOfServiceScreen: undefined;
  PrivacyPolicyScreen: undefined;
  MyRoomDecorationPurchaseScreen: { purchaseItems: number[] };

  MyTestScreen: undefined;
  };

const Stack = createStackNavigator<MyStackParamList>();

export default function MyStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        }
      }
      initialRouteName="MyTab"
    >
      <Stack.Screen name="MyTab" component={MyTab} />
      <Stack.Screen name="MyAchievementScreen" component={MyAchievementScreen} />
      <Stack.Screen name="MySettingScreen" component={MySettingScreen} />
      <Stack.Screen name="NotificationSettingScreen" component={NotificationSettingScreen} />
      <Stack.Screen name="AccountInfoScreen" component={AccountInfoScreen} />
      <Stack.Screen name="NoticeScreen" component={NoticeScreen} />
      <Stack.Screen name="InquiryBugScreen" component={InquiryBugScreen} />
      <Stack.Screen name="InformationScreen" component={InformationScreen} />
      <Stack.Screen name="TermOfServiceScreen" component={TermOfServiceScreen} />
      <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="MyRoomDecorationPurchaseScreen" component={MyRoomDecorationPurchaseScreen} />
      <Stack.Screen name="MyTestScreen" component={MyTestScreen} />
    </Stack.Navigator>
  );
};