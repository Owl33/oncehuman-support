// lib/storage/switchpoint-storage.ts
import { CharacterData, UserSettings } from '../../types/switchpoint';

const STORAGE_PREFIX = 'sp_';
const STORAGE_VERSION = '1.0.0';

export interface StorageAdapter {
  // 캐릭터 관련
  getCharacterList(): Promise<CharacterData[]>;
  getCharacterData(characterId: string): Promise<CharacterData | null>;
  saveCharacterData(characterId: string, data: CharacterData): Promise<void>;
  deleteCharacterData(characterId: string): Promise<void>;
  
  // 설정 관련
  getUserSettings(): Promise<UserSettings>;
  saveUserSettings(settings: UserSettings): Promise<void>;
  
  // 데이터 관리
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
  clearAllData(): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  async getCharacterList(): Promise<CharacterData[]> {
    try {
      const listKey = this.getKey('characters');
      const data = localStorage.getItem(listKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get character list:', error);
      return [];
    }
  }

  async getCharacterData(characterId: string): Promise<CharacterData | null> {
    try {
      const key = this.getKey(`character_${characterId}`);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to get character data:', error);
      return null;
    }
  }

  async saveCharacterData(characterId: string, data: CharacterData): Promise<void> {
    try {
      // 개별 캐릭터 데이터 저장
      const key = this.getKey(`character_${characterId}`);
      localStorage.setItem(key, JSON.stringify(data));
      
      // 캐릭터 목록 업데이트
      const characters = await this.getCharacterList();
      const index = characters.findIndex(c => c.id === characterId);
      
      if (index >= 0) {
        characters[index] = data;
      } else {
        characters.push(data);
      }
      
      const listKey = this.getKey('characters');
      localStorage.setItem(listKey, JSON.stringify(characters));
    } catch (error) {
      console.error('Failed to save character data:', error);
      throw error;
    }
  }

  async deleteCharacterData(characterId: string): Promise<void> {
    try {
      // 개별 데이터 삭제
      const key = this.getKey(`character_${characterId}`);
      localStorage.removeItem(key);
      
      // 목록에서 제거
      const characters = await this.getCharacterList();
      const filtered = characters.filter(c => c.id !== characterId);
      const listKey = this.getKey('characters');
      localStorage.setItem(listKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete character data:', error);
      throw error;
    }
  }

  async getUserSettings(): Promise<UserSettings> {
    try {
      const key = this.getKey('settings');
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : { defaultView: 'dashboard' };
    } catch (error) {
      console.error('Failed to get user settings:', error);
      return { defaultView: 'dashboard' };
    }
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      const key = this.getKey('settings');
      localStorage.setItem(key, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const characters = await this.getCharacterList();
      const settings = await this.getUserSettings();
      
      const exportData = {
        version: STORAGE_VERSION,
        exportDate: new Date().toISOString(),
        characters,
        settings,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // 버전 체크 (나중에 마이그레이션 로직 추가 가능)
      if (data.version !== STORAGE_VERSION) {
        console.warn(`Data version mismatch: expected ${STORAGE_VERSION}, got ${data.version}`);
      }
      
      // 기존 데이터 백업
      const backup = await this.exportData();
      const backupKey = this.getKey(`backup_${Date.now()}`);
      localStorage.setItem(backupKey, backup);
      
      // 새 데이터 저장
      if (data.characters) {
        for (const character of data.characters) {
          await this.saveCharacterData(character.id, character);
        }
      }
      
      if (data.settings) {
        await this.saveUserSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      // 백업 생성
      const backup = await this.exportData();
      const backupKey = this.getKey(`backup_clear_${Date.now()}`);
      localStorage.setItem(backupKey, backup);
      
      // sp_ 접두사로 시작하는 모든 키 삭제
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX) && !key.includes('backup')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const storage = new LocalStorageAdapter();