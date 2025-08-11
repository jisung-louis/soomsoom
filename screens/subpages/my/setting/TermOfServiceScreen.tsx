import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SubpageHeader from '../../../../components/common/top-navigation/SubpageHeader';
import { useNavigation } from '@react-navigation/native';

const TermOfServiceScreen = () => {
    const navigation = useNavigation();
    const handleBack = () => {
        navigation.goBack();
    };
  return (
    <SafeAreaView style={styles.container}>
        <SubpageHeader onBack={handleBack} />
        <View style={styles.contentContainer}>
            <Text>서비스 이용 약관</Text>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
});

export default TermOfServiceScreen;