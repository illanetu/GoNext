import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Text, Button, Snackbar } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const showSnackbar = () => setSnackbarVisible(true);
  const hideSnackbar = () => setSnackbarVisible(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <Appbar.Header>
          <Appbar.Content title="GoNext" />
        </Appbar.Header>
        
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.text}>
            Привет, React Native Paper!
          </Text>
          
          <Button 
            mode="contained" 
            onPress={showSnackbar}
            style={styles.button}
          >
            Нажми меня
          </Button>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={hideSnackbar}
          duration={3000}
        >
          Кнопка нажата
        </Snackbar>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    minWidth: 150,
  },
});
