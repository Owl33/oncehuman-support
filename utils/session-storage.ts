// utils/storage.ts
"use client";

export interface StorageOptions {
  expires?: number; // days (쿠키용)
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

// 세션스토리지 유틸리티
export const sessionStorageUtils = {
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set sessionStorage ${key}:`, error);
    }
  },

  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get sessionStorage ${key}:`, error);
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove sessionStorage ${key}:`, error);
    }
  },

  setJSON: <T>(key: string, value: T) => {
    try {
      const jsonString = JSON.stringify(value);
      sessionStorageUtils.set(key, jsonString);
    } catch (error) {
      console.warn(`Failed to set JSON sessionStorage ${key}:`, error);
    }
  },

  getJSON: <T>(key: string): T | null => {
    try {
      const value = sessionStorageUtils.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON sessionStorage ${key}:`, error);
      return null;
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.clear();
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
};

// 로컬스토리지 유틸리티 (영구 저장이 필요한 경우)
export const localStorageUtils = {
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage ${key}:`, error);
    }
  },

  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage ${key}:`, error);
      return null;
    }
  },

  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage ${key}:`, error);
    }
  },

  setJSON: <T>(key: string, value: T) => {
    try {
      const jsonString = JSON.stringify(value);
      localStorageUtils.set(key, jsonString);
    } catch (error) {
      console.warn(`Failed to set JSON localStorage ${key}:`, error);
    }
  },

  getJSON: <T>(key: string): T | null => {
    try {
      const value = localStorageUtils.get(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON localStorage ${key}:`, error);
      return null;
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
};

