import { View, ImageBackground, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const bgImage = require('../assets/backgrounds/gonext-bg.png');

const DARK_BG = '#1a1a2e';

type ScreenBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  const { isDark } = useTheme();

  if (isDark) {
    return <View style={[styles.background, styles.darkBackground, style]}>{children}</View>;
  }

  return (
    <ImageBackground source={bgImage} style={[styles.background, style]} resizeMode="cover">
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  darkBackground: {
    backgroundColor: DARK_BG,
  },
});
