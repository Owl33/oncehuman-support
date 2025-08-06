// lib/storage/unified-character-storage.ts
import { UserSettings } from "@/types/switchpoint";
import { CharacterData } from "@/types/character";
// 기본 캐릭터 정보 인터페이스 (기존 character-storage와 호환)

// 스토리지 데이터 구조
interface StorageData {
  version: string;
  characters: CharacterData[]; // switchpoint의 CharacterData 사용
  settings?: UserSettings;
  lastUpdated: string;
}

const STORAGE_KEY = "character_data";
const SETTINGS_KEY = "switchpoint_settings";
const STORAGE_VERSION = "1.0.0";

export interface StorageAdapter {
  // 캐릭터 관련
  getCharacterList(): Promise<CharacterData[]>; // switchpoint의 CharacterData 사용
  getCharacterData(characterId: string): Promise<CharacterData | null>;
  saveCharacterData(characterId: string, data: CharacterData): Promise<void>;
  deleteCharacterData(characterId: string): Promise<void>;

  // 기본 캐릭터 관리 (character 페이지용)
  createCharacter(character: CharacterData): Promise<CharacterData>;
  updateCharacters(updatedCharacters: CharacterData[]): Promise<void>;
  deleteCharacters(ids: string[]): Promise<void>;

  // 설정 관련
  getUserSettings(): Promise<UserSettings>;
  saveUserSettings(settings: UserSettings): Promise<void>;

  // 데이터 관리
  exportData(): Promise<string>;
  importData(jsonData: string): Promise<void>;
  clearAllData(): Promise<void>;
}

class UnifiedCharacterStorage implements StorageAdapter {
  // 모든 캐릭터 가져오기
  async getCharacterList(): Promise<CharacterData[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed: StorageData = JSON.parse(data);
      return parsed.characters || [];
    } catch (error) {
      console.error("Failed to get character list:", error);
      return [];
    }
  }

  // 특정 캐릭터 데이터 가져오기
  async getCharacterData(characterId: string): Promise<CharacterData | null> {
    try {
      const characters = await this.getCharacterList();
      return characters.find((c) => c.id === characterId) || null;
    } catch (error) {
      console.error("Failed to get character data:", error);
      return null;
    }
  }

  // 캐릭터 데이터 저장 (switchpoint용)
  async saveCharacterData(characterId: string, data: CharacterData): Promise<void> {
    try {
      const characters = await this.getCharacterList();
      const index = characters.findIndex((c) => c.id === characterId);

      if (index >= 0) {
        characters[index] = { ...data, lastUpdated: new Date().toISOString() };
      } else {
        characters.push({ ...data, lastUpdated: new Date().toISOString() });
      }

      await this.saveCharacters(characters);
    } catch (error) {
      console.error("Failed to save character data:", error);
      throw error;
    }
  }

  // 캐릭터 삭제
  async deleteCharacterData(characterId: string): Promise<void> {
    try {
      const characters = await this.getCharacterList();
      const filtered = characters.filter((c) => c.id !== characterId);
      await this.saveCharacters(filtered);
    } catch (error) {
      console.error("Failed to delete character data:", error);
      throw error;
    }
  }

  // 기본 캐릭터 생성 (character 페이지용)
  async createCharacter(character: CharacterData): Promise<CharacterData> {
    try {
      const characters = await this.getCharacterList();

      // ID가 없으면 생성
      const newCharacter: CharacterData = {
        ...character,
        id: character.id || this.generateId(),
        selectedItems: {},
        ownedMaterials: {},
        lastUpdated: new Date().toISOString(),
      };

      characters.push(newCharacter);
      await this.saveCharacters(characters);

      return newCharacter;
    } catch (error) {
      console.error("Failed to create character:", error);
      throw error;
    }
  }

  // 여러 캐릭터 업데이트 (character 페이지용)
  async updateCharacters(updatedCharacters: CharacterData[]): Promise<void> {
    try {
      const characters = await this.getCharacterList();

      // 업데이트할 캐릭터들의 ID 맵 생성
      const updateMap = new Map(updatedCharacters.map((char) => [char.id, char]));

      // 기존 캐릭터 업데이트 (switchpoint 데이터는 유지)
      const newCharacters = characters.map((char) => {
        const update = updateMap.get(char.id);
        if (update) {
          return {
            ...char, // 기존 selectedItems, ownedMaterials 유지
            ...update, // 기본 정보 업데이트
            lastUpdated: new Date().toISOString(),
          };
        }
        return char;
      });

      await this.saveCharacters(newCharacters);
    } catch (error) {
      console.error("Failed to update characters:", error);
      throw error;
    }
  }

  // 캐릭터 삭제 (character 페이지용)
  async deleteCharacters(ids: string[]): Promise<void> {
    try {
      const characters = await this.getCharacterList();
      const newCharacters = characters.filter((char) => !ids.includes(char.id));
      await this.saveCharacters(newCharacters);
    } catch (error) {
      console.error("Failed to delete characters:", error);
      throw error;
    }
  }

  // 사용자 설정 가져오기
  async getUserSettings(): Promise<UserSettings> {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { defaultView: "dashboard" };
    } catch (error) {
      console.error("Failed to get user settings:", error);
      return { defaultView: "dashboard" };
    }
  }

  // 사용자 설정 저장
  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save user settings:", error);
      throw error;
    }
  }

  // 데이터 내보내기
  async exportData(): Promise<string> {
    try {
      const characters = await this.getCharacterList();
      const settings = await this.getUserSettings();

      const exportData: StorageData = {
        version: STORAGE_VERSION,
        characters,
        settings,
        lastUpdated: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  // 데이터 가져오기
  async importData(jsonData: string): Promise<void> {
    try {
      const parsed: StorageData = JSON.parse(jsonData);

      // 버전 체크
      if (parsed.version !== STORAGE_VERSION) {
        console.warn(`Data version mismatch: expected ${STORAGE_VERSION}, got ${parsed.version}`);
      }

      // 기존 데이터 백업
      const backup = await this.exportData();
      const backupKey = `backup_${Date.now()}`;
      localStorage.setItem(backupKey, backup);

      // 새 데이터 저장
      if (parsed.characters && Array.isArray(parsed.characters)) {
        await this.saveCharacters(parsed.characters);
      }

      if (parsed.settings) {
        await this.saveUserSettings(parsed.settings);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }

  // 모든 데이터 초기화
  async clearAllData(): Promise<void> {
    try {
      // 백업 생성
      const backup = await this.exportData();
      const backupKey = `backup_clear_${Date.now()}`;
      localStorage.setItem(backupKey, backup);

      // 데이터 삭제
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  }

  // Private methods
  private async saveCharacters(characters: CharacterData[]): Promise<void> {
    const data: StorageData = {
      version: STORAGE_VERSION,
      characters,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// 싱글톤 인스턴스
export const unifiedStorage = new UnifiedCharacterStorage();

// 기존 character-storage와의 호환성을 위한 래퍼
export class CharacterStorage {
  async getCharacters(): Promise<CharacterData[]> {
    const characters = await unifiedStorage.getCharacterList();
    // selectedItems와 ownedMaterials만 제거하고 lastUpdated는 유지
    return characters.map(({ selectedItems, ownedMaterials, ...base }) => base);
  }

  async createCharacter(character: CharacterData): Promise<CharacterData> {
    const created = await unifiedStorage.createCharacter(character);
    // selectedItems와 ownedMaterials만 제거하고 lastUpdated는 유지
    const { selectedItems, ownedMaterials, ...base } = created;
    return base;
  }

  async updateCharacters(updatedCharacters: CharacterData[]): Promise<void> {
    return unifiedStorage.updateCharacters(updatedCharacters);
  }

  async deleteCharacters(ids: string[]): Promise<void> {
    return unifiedStorage.deleteCharacters(ids);
  }

  async clearAll(): Promise<void> {
    return unifiedStorage.clearAllData();
  }

  async exportData(): Promise<string> {
    return unifiedStorage.exportData();
  }

  async importData(jsonData: string): Promise<void> {
    return unifiedStorage.importData(jsonData);
  }
}

// 기존 코드와의 호환성
export const characterStorage = new CharacterStorage();
