import AsyncStorage from '@react-native-async-storage/async-storage';

// Save UID after login
export async function saveUID(uid) {
  try {
    await AsyncStorage.setItem('userUID', uid);
  } catch (e) {
    console.error('Failed to save UID:', e);
  }
}

// Get UID on app startup
export async function getUID() {
  try {
    const uid = await AsyncStorage.getItem('userUID');
    return uid;
  } catch (e) {
    console.error('Failed to fetch UID:', e);
    return null;
  }
}

export async function removeUID() {
  try {
    await AsyncStorage.removeItem("userUID",()=>console.log("user UID has been removed"));
    return true;
  } catch (error) {
    console.error("Failed to remove UID: ",error)
    return null
  }
}