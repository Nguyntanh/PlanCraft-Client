import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { StackNavigationProp } from '@react-navigation/stack';

type SplashScreenProps = {
  navigation: StackNavigationProp<any>;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Login'); // Navigate to Home after 2 seconds
    }, 2000); // Hiển thị splash screen trong 2 giây
  }, [navigation]);

  return (
    <View style={styles.splashContainer}>
      <Image
        source={require('./../../assets/images/AV.png')} // Thay bằng URL logo thực tế
        style={styles.logo}
      />
      <Text style={styles.splashText}>PlanCraft</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
  },
  splashText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default SplashScreen;