import { View, ImageBackground, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import type { BackgroundImageIndex } from '../contexts/ThemeContext';

const BACKGROUND_IMAGES: Record<BackgroundImageIndex, number> = {
  0: require('../assets/backgrounds/gonext-bg.png'),
  1: require('../assets/backgrounds/gonext-bg2.png'),
  2: require('../assets/backgrounds/gonext-bg3.png'),
  3: require('../assets/backgrounds/gonext-bg4.png'),
};

const DARK_BG = '#1a1a2e';

type ScreenBackgroundProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  const { isDark, backgroundImageIndex } = useTheme();

  if (isDark) {
    return <View style={[styles.background, styles.darkBackground, style]}>{children}</View>;
  }

  const source = BACKGROUND_IMAGES[backgroundImageIndex];
  return (
    <ImageBackground source={source} style={[styles.background, style]} resizeMode="cover">
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
