import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Button } from '../../../components/common/buttons/Button';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AlarmStackParamList } from '../../../navigations/tabs/AlarmStackNavigator';
import { useScreenAnalytics } from '../../../hooks/useScreenAnalytics';

const AlarmTestScreen = () => {
    useScreenAnalytics('AlarmTestScreen');

    const navigation = useNavigation<StackNavigationProp<AlarmStackParamList>>();

  return (
    <SafeAreaView>
        <SubpageHeader
            onBack={() => {navigation.goBack()}}
        />
        <TouchableOpacity>
        <Text>AlarmTestScreen</Text>
        <Button
            title="AlarmTestScreen"
            onPress={() => {navigation.navigate('AlarmAddScreen', {isCreateMode: true})}}
        />
        </TouchableOpacity>
    </SafeAreaView>
  );
};

export default AlarmTestScreen;