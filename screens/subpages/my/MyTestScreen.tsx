import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MyStackParamList } from '../../../navigations/tabs/MyStackNavigator';
import { Button } from '../../../components/common/buttons/Button';
import { useScreenAnalytics } from '../../../hooks/useScreenAnalytics';

const MyTestScreen = () => {
    useScreenAnalytics('MyTestScreen');

    const navigation = useNavigation<StackNavigationProp<MyStackParamList>>();
    return (
        <SafeAreaView style={styles.container}>
            <SubpageHeader onBack={() => {navigation.goBack()}} />
            <Text>MyTestScreen</Text>
        </SafeAreaView>
    );
};

export default MyTestScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});