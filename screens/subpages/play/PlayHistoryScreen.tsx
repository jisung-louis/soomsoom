import React from 'react';
import { StyleSheet, View, Text  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { PlayStackParamList } from '../../../navigations/tabs/PlayStackNavigator';
import { colors } from '../../../constants/colors';

const PlayHistoryScreen = () => {
  const navigation = useNavigation<StackNavigationProp<PlayStackParamList>>();
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <SubpageHeader onBack={handleBack} />
      <View style={styles.contentContainer}>
        <Text>PlayHistoryScreen</Text>
      </View>
    </SafeAreaView>
  );
};

export default PlayHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});