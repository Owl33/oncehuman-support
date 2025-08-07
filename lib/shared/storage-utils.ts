// lib/shared/storage-utils.ts
export const storageUtils = {
  /**
   * Get JSON data from sessionStorage
   */
  getJSON<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null;
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Failed to get JSON from sessionStorage for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Set JSON data to sessionStorage
   */
  setJSON<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to set JSON to sessionStorage for key "${key}":`, error);
    }
  },

  /**
   * Remove item from sessionStorage
   */
  remove(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from sessionStorage for key "${key}":`, error);
    }
  },

  /**
   * Clear all sessionStorage
   */
  clear(): void {
    try {
      if (typeof window === 'undefined') return;
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
};