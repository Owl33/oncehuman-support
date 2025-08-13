// lib/storage/character-storage.ts
import { Character, CreateCharacterInput, BaseCharacter } from "@/types/character";

const STORAGE_KEY = "character_data";
const STORAGE_VERSION = "1.0.0";

interface StorageData {
  version: string;
  characters: Character[];
  lastUpdated: string;
}

class CharacterStorage {
  // 모든 캐릭터 가져오기
  async getCharacters(): Promise<Character[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const parsed: StorageData = JSON.parse(data);
      return parsed.characters || [];
    } catch (error) {
      console.error("Failed to get characters:", error);
      return [];
    }
  }

  // 특정 캐릭터 가져오기
  async getCharacter(id: string): Promise<Character | null> {
    try {
      const characters = await this.getCharacters();
      return characters.find((char) => char.id === id) || null;
    } catch (error) {
      console.error("Failed to get character:", error);
      return null;
    }
  }

  // 캐릭터 생성
  async createCharacter(input: CreateCharacterInput): Promise<Character> {
    try {
      const characters = await this.getCharacters();

      // 새 캐릭터 생성 (SwitchPoint 데이터는 비워둠)
      const newCharacter: Character = {
        ...input,
        id: input.id || this.generateId(),
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

  // 캐릭터 업데이트 (부분 업데이트 지원)
  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character | null> {
    try {
      const characters = await this.getCharacters();
      const index = characters.findIndex((char) => char.id === id);

      if (index === -1) return null;

      characters[index] = {
        ...characters[index],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };

      await this.saveCharacters(characters);
      return characters[index];
    } catch (error) {
      console.error("Failed to update character:", error);
      throw error;
    }
  }

  // 여러 캐릭터 업데이트 (캐릭터 관리 페이지용)
  async updateCharacters(updatedCharacters: BaseCharacter[]): Promise<void> {
    try {
      const characters = await this.getCharacters();

      // 업데이트할 캐릭터들의 ID 맵 생성
      const updateMap = new Map(updatedCharacters.map((char) => [char.id, char]));

      // 기존 캐릭터 업데이트 (SwitchPoint 데이터는 유지)
      const newCharacters = characters.map((char) => {
        if (updateMap.has(char.id)) {
          const updates = updateMap.get(char.id)!;
          return {
            ...char,
            ...updates,
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

  // SwitchPoint 데이터 업데이트
  async updateSwitchPointData(
    id: string,
    data: {
      selectedItems?: Record<string, number>;
      ownedMaterials?: Record<string, number>;
    }
  ): Promise<Character | null> {
    return this.updateCharacter(id, data);
  }

  // 캐릭터 삭제
  async deleteCharacters(ids: string[]): Promise<void> {
    try {
      const characters = await this.getCharacters();
      const newCharacters = characters.filter((char) => !ids.includes(char.id));
      await this.saveCharacters(newCharacters);
    } catch (error) {
      console.error("Failed to delete characters:", error);
      throw error;
    }
  }

  // 모든 데이터 초기화
  async clearAll(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear data:", error);
      throw error;
    }
  }

  // 데이터 내보내기
  async exportData(): Promise<string> {
    try {
      const characters = await this.getCharacters();
      const exportData: StorageData = {
        version: STORAGE_VERSION,
        characters,
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
        console.warn(`Version mismatch: expected ${STORAGE_VERSION}, got ${parsed.version}`);
      }

      if (parsed.characters && Array.isArray(parsed.characters)) {
        // 필수 필드만 확인, SwitchPoint 데이터는 옵셔널
        const characters = parsed.characters.map((char) => ({
          ...char,
          lastUpdated: char.lastUpdated || new Date().toISOString(),
        }));

        await this.saveCharacters(characters);
      }
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }

  // Private methods
  private async saveCharacters(characters: Character[]): Promise<void> {
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

export const characterStorage = new CharacterStorage();
