import * as SecureStore from 'expo-secure-store';

async function setSecureStore(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error('Error saving data to secure store:', error);
  }
}

async function getSecureStore(key: string) {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (error) {
    console.error('Error retrieving data from secure store:', error);
  }
}

async function deleteSecureStore(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Error deleting data from secure store:', error);
  }
}

export { setSecureStore, getSecureStore, deleteSecureStore };
