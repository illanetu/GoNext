import { View, StyleSheet, ScrollView, Alert, Pressable, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Title, Paragraph, List, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { ScreenBackground } from '../../components/ScreenBackground';
import { useTheme, THEME_COLOR_PALETTE } from '../../contexts/ThemeContext';
import type { BackgroundImageIndex } from '../../contexts/ThemeContext';

const APP_VERSION = '1.0.0';
const APP_NAME = 'GoNext';

const CIRCLE_SIZE = 36;
const CIRCLE_MARGIN = 10;
const BG_PREVIEW_SIZE = 72;
const BG_PREVIEW_GAP = 10;

const BACKGROUND_IMAGES: Record<BackgroundImageIndex, number> = {
  0: require('../../assets/backgrounds/gonext-bg.png'),
  1: require('../../assets/backgrounds/gonext-bg2.png'),
  2: require('../../assets/backgrounds/gonext-bg3.png'),
  3: require('../../assets/backgrounds/gonext-bg4.png'),
};

export default function SettingsScreen() {
  const { theme, setTheme, primaryColor, setPrimaryColor, isDark, backgroundImageIndex, setBackgroundImageIndex } = useTheme();
  const { t, i18n } = useTranslation();

  const handleExportData = () => {
    Alert.alert(
      t('settings.exportAlertTitle'),
      t('settings.exportAlertMessage'),
      [{ text: t('common.ok') }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenBackground>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* О приложении */}
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <Title style={styles.sectionTitle}>{t('settings.aboutApp')}</Title>
              <Paragraph style={styles.appName}>{APP_NAME}</Paragraph>
              <Paragraph style={styles.description}>{t('settings.appDescription')}</Paragraph>
              <Paragraph style={styles.version}>{t('settings.version', { version: APP_VERSION })}</Paragraph>
            </Card.Content>
          </Card>

          {/* Данные */}
          <Card style={styles.card} mode="elevated">
            <List.Section style={styles.listSection}>
              <List.Subheader style={styles.listSubheader}>{t('settings.data')}</List.Subheader>
              <List.Item
                title={t('settings.exportData')}
                description={t('settings.exportDataDescription')}
                left={(props) => <List.Icon {...props} icon="export" />}
                onPress={handleExportData}
                style={styles.listItem}
              />
            </List.Section>
          </Card>

          {/* Тема */}
          <Card style={styles.card} mode="elevated">
            <List.Section style={styles.listSection}>
              <List.Subheader style={styles.listSubheader}>{t('settings.appearance')}</List.Subheader>
              <Paragraph style={styles.themeLabel}>{t('settings.theme')}</Paragraph>
              <SegmentedButtons
                value={theme}
                onValueChange={(v) => setTheme(v as 'light' | 'dark')}
                buttons={[
                  { value: 'light', label: t('settings.themeLight'), icon: 'white-balance-sunny' },
                  { value: 'dark', label: t('settings.themeDark'), icon: 'moon-waning-crescent' },
                ]}
                style={styles.segmented}
              />
              <Paragraph style={styles.themeHint}>{t('settings.themeHint')}</Paragraph>
              <Paragraph style={styles.themeLabel}>{t('settings.primaryColor')}</Paragraph>
              <View style={styles.colorRow}>
                {THEME_COLOR_PALETTE.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setPrimaryColor(color)}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      primaryColor === color && {
                        ...styles.colorCircleSelected,
                        borderColor: isDark ? 'rgba(255,255,255,0.9)' : '#333',
                      },
                    ]}
                  />
                ))}
              </View>
              <Paragraph style={styles.themeLabel}>{t('settings.backgroundImage')}</Paragraph>
              <View style={styles.backgroundRow}>
                {([0, 1, 2, 3] as const).map((index) => (
                  <Pressable
                    key={index}
                    onPress={() => setBackgroundImageIndex(index)}
                    style={[
                      styles.backgroundPreview,
                      backgroundImageIndex === index && {
                        ...styles.backgroundPreviewSelected,
                        borderColor: isDark ? 'rgba(255,255,255,0.9)' : '#333',
                      },
                    ]}
                  >
                    <ImageBackground
                      source={BACKGROUND_IMAGES[index]}
                      style={styles.backgroundPreviewImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </View>
              <Paragraph style={styles.themeHint}>{t('settings.backgroundImageHint')}</Paragraph>
              <Paragraph style={styles.themeLabel}>{t('settings.language')}</Paragraph>
              <SegmentedButtons
                value={i18n.language === 'en' ? 'en' : 'ru'}
                onValueChange={(v) => i18n.changeLanguage(v)}
                buttons={[
                  { value: 'ru', label: t('settings.languageRu'), icon: 'translate' },
                  { value: 'en', label: t('settings.languageEn'), icon: 'translate' },
                ]}
                style={styles.segmented}
              />
            </List.Section>
          </Card>

          {/* Базовые настройки — заглушка для будущего */}
          <Card style={styles.card} mode="elevated">
            <List.Section style={styles.listSection}>
              <List.Subheader style={styles.listSubheader}>{t('settings.moreSettings')}</List.Subheader>
              <List.Item
                title={t('settings.moreSettingsDescription')}
                description={t('settings.moreSettingsHint')}
                left={(props) => <List.Icon {...props} icon="cog-outline" />}
                disabled
                style={styles.listItem}
              />
            </List.Section>
          </Card>
        </ScrollView>
      </ScreenBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 22,
    color: '#555',
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  listSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listSubheader: {
    paddingHorizontal: 0,
  },
  listItem: {
    paddingRight: 8,
  },
  themeLabel: {
    marginBottom: 8,
    fontSize: 14,
  },
  segmented: {
    marginBottom: 8,
  },
  themeHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: CIRCLE_MARGIN,
  },
  colorCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderWidth: 3,
  },
  backgroundRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: BG_PREVIEW_GAP,
  },
  backgroundPreview: {
    width: BG_PREVIEW_SIZE,
    height: BG_PREVIEW_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  backgroundPreviewSelected: {
    borderWidth: 3,
  },
  backgroundPreviewImage: {
    width: '100%',
    height: '100%',
  },
});
