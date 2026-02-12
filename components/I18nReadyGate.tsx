import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import i18n from '../i18n';

/**
 * Рендерит детей только после инициализации i18n (в т.ч. загрузки языка из AsyncStorage).
 */
export function I18nReadyGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
      return;
    }
    const onInitialized = () => setReady(true);
    i18n.on('initialized', onInitialized);
    return () => {
      i18n.off('initialized', onInitialized);
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
