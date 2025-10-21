import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/ripple.json')}
        autoPlay
        loop={false}
        style={styles.lottie}
      />
      <Text style={styles.text}>CollarID</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // ✅ white background
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
  text: {
    color: '#111111', // ✅ dark gray text for contrast
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 16,
  },
});
