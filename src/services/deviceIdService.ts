import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@israeli_puzzle_hub_device_uuid';

let inMemoryDeviceId: string | null = null;

function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const deviceIdService = {
  /**
   * Retrieves existing device UUID or generates a new persistent UUID
   */
  async getDeviceId(): Promise<string> {
    if (inMemoryDeviceId) {
      return inMemoryDeviceId;
    }

    // 1. Direct browser localStorage check for web environment
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const browserId = window.localStorage.getItem(DEVICE_ID_KEY);
        if (browserId) {
          inMemoryDeviceId = browserId;
          return browserId;
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. AsyncStorage check
    try {
      const storedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      if (storedId) {
        inMemoryDeviceId = storedId;
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            window.localStorage.setItem(DEVICE_ID_KEY, storedId);
          } catch (e) {}
        }
        return storedId;
      }
    } catch (e) {
      // Safe fallback
    }

    // 3. Generate new persistent UUID
    const newId = generateUUIDv4();
    inMemoryDeviceId = newId;

    try {
      await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
    } catch (e) {}

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(DEVICE_ID_KEY, newId);
      } catch (e) {}
    }

    return newId;
  },

  /**
   * Resets device ID (useful for testing)
   */
  async clearDeviceId(): Promise<void> {
    inMemoryDeviceId = null;
    try {
      await AsyncStorage.removeItem(DEVICE_ID_KEY);
    } catch (e) {}
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(DEVICE_ID_KEY);
      } catch (e) {}
    }
  },
};
