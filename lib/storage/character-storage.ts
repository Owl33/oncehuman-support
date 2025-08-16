// lib/storage/character-storage.ts
import { Character, CreateCharacterInput, BaseCharacter } from "@/types/character";
import { CoopProgress, ScenarioType } from "@/types/coop-timer";

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

      const existingCharacter = characters[index];
      
      // 시나리오 변경 감지 및 자동 coopTimerData 정리
      if (updates.scenario && existingCharacter.scenario !== updates.scenario) {
        console.log(`Character ${existingCharacter.name} scenario changed: ${existingCharacter.scenario} → ${updates.scenario}`);
        console.log("Clearing existing coop timer data due to scenario change");
        
        // 시나리오 변경 시 기존 coop timer 데이터 초기화
        updates.coopTimerData = {};
      }

      characters[index] = {
        ...existingCharacter,
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

  // Coop Timer 데이터 업데이트 (특정 이벤트의 진행상황 업데이트)
  async updateCoopTimerData(
    characterId: string,
    eventId: string,
    progress: CoopProgress
  ): Promise<Character | null> {
    try {
      const character = await this.getCharacter(characterId);
      if (!character) return null;

      const currentCoopData = character.coopTimerData || {};
      const updatedCoopData = {
        ...currentCoopData,
        [eventId]: progress
      };

      return this.updateCharacter(characterId, {
        coopTimerData: updatedCoopData
      });
    } catch (error) {
      console.error("Failed to update coop timer data:", error);
      throw error;
    }
  }

  // Coop Timer 데이터 조회 (특정 이벤트의 진행상황 조회)
  async getCoopTimerProgress(
    characterId: string,
    eventId: string
  ): Promise<CoopProgress | null> {
    try {
      const character = await this.getCharacter(characterId);
      if (!character?.coopTimerData) return null;

      return character.coopTimerData[eventId] || null;
    } catch (error) {
      console.error("Failed to get coop timer progress:", error);
      return null;
    }
  }

  // 캐릭터의 모든 Coop Timer 데이터 조회
  async getAllCoopTimerData(characterId: string): Promise<Record<string, CoopProgress>> {
    try {
      const character = await this.getCharacter(characterId);
      return character?.coopTimerData || {};
    } catch (error) {
      console.error("Failed to get all coop timer data:", error);
      return {};
    }
  }

  // 시나리오 변경 시 기존 coop-timer 데이터 정리 (시나리오별 이벤트만 유지)
  async cleanupCoopDataOnScenarioChange(
    characterId: string,
    newScenario: ScenarioType,
    validEventIds: string[]
  ): Promise<Character | null> {
    try {
      const character = await this.getCharacter(characterId);
      if (!character?.coopTimerData) return character;

      // 새 시나리오의 유효한 이벤트만 유지
      const cleanedCoopData: Record<string, CoopProgress> = {};
      for (const eventId of validEventIds) {
        if (character.coopTimerData[eventId]) {
          cleanedCoopData[eventId] = character.coopTimerData[eventId];
        }
      }

      return this.updateCharacter(characterId, {
        coopTimerData: cleanedCoopData
      });
    } catch (error) {
      console.error("Failed to cleanup coop data on scenario change:", error);
      throw error;
    }
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

  // === 데이터 마이그레이션 관련 메서드들 ===

  // 마이그레이션 필요 여부 확인
  private isMigrationNeeded(): boolean {
    const migrationComplete = localStorage.getItem("coop_timer_migration_complete");
    const oldDataExists = localStorage.getItem("coop_timer_progress_v1");
    
    return !migrationComplete && !!oldDataExists;
  }

  // 기존 독립 localStorage 데이터를 통합 스토리지로 마이그레이션
  async migrateCoopTimerData(): Promise<void> {
    if (!this.isMigrationNeeded()) {
      console.log("Coop timer data migration not needed or already completed");
      return;
    }

    console.log("Starting coop timer data migration...");

    try {
      // 기존 데이터 로드
      const oldDataRaw = localStorage.getItem("coop_timer_progress_v1");
      if (!oldDataRaw) {
        console.log("No old coop timer data found");
        this.markMigrationComplete();
        return;
      }

      const oldProgress: Record<string, CoopProgress> = JSON.parse(oldDataRaw);
      console.log(`Found ${Object.keys(oldProgress).length} coop timer records to migrate`);

      // 캐릭터별로 데이터 분류
      const characterDataMap: Record<string, Record<string, CoopProgress>> = {};
      
      for (const [key, progress] of Object.entries(oldProgress)) {
        // 키 형태: "${characterId}-${eventId}"
        const lastDashIndex = key.lastIndexOf('-');
        if (lastDashIndex === -1) {
          console.warn(`Invalid key format: ${key}, skipping...`);
          continue;
        }

        const characterId = key.substring(0, lastDashIndex);
        const eventId = key.substring(lastDashIndex + 1);

        if (!characterDataMap[characterId]) {
          characterDataMap[characterId] = {};
        }

        characterDataMap[characterId][eventId] = progress;
      }

      // 각 캐릭터에 데이터 마이그레이션
      for (const [characterId, coopData] of Object.entries(characterDataMap)) {
        const character = await this.getCharacter(characterId);
        if (!character) {
          console.warn(`Character not found: ${characterId}, skipping migration for this character`);
          continue;
        }

        // 기존 coopTimerData와 병합 (기존 데이터 우선)
        const existingCoopData = character.coopTimerData || {};
        const mergedCoopData = {
          ...coopData, // 마이그레이션 데이터
          ...existingCoopData // 기존 데이터 (우선순위 높음)
        };

        await this.updateCharacter(characterId, {
          coopTimerData: mergedCoopData
        });

        console.log(`Migrated ${Object.keys(coopData).length} coop timer records for character: ${character.name} (${characterId})`);
      }

      // 마이그레이션 완료 처리
      this.markMigrationComplete();
      this.cleanupOldCoopTimerData();

      console.log("Coop timer data migration completed successfully");

    } catch (error) {
      console.error("Failed to migrate coop timer data:", error);
      throw error;
    }
  }

  // 마이그레이션 완료 표시
  private markMigrationComplete(): void {
    localStorage.setItem("coop_timer_migration_complete", "true");
    localStorage.setItem("coop_timer_migration_date", new Date().toISOString());
  }

  // 기존 독립 localStorage 키들 정리
  private cleanupOldCoopTimerData(): void {
    try {
      // 기존 coop timer 관련 키들 삭제
      const keysToRemove = [
        "coop_timer_progress_v1",
        "coop_timer_progress",
        "coopTimerProgress", 
        "coop-timer-progress",
        "timer_progress"
      ];

      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed old localStorage key: ${key}`);
        }
      });

      // 패턴에 맞는 다른 키들도 정리
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        // characterId-eventId 패턴으로 생성된 키들 제거
        if (key.includes('-') && !key.startsWith('character_') && !key.startsWith('coop_timer_migration')) {
          // 간단한 휴리스틱: 36자리 이하이고 대시가 포함된 키들
          if (key.length <= 36 && key.split('-').length >= 2) {
            try {
              const stored = localStorage.getItem(key);
              if (stored) {
                const parsed = JSON.parse(stored);
                // CoopProgress 형태의 객체인지 확인
                if (parsed && typeof parsed === 'object' && 
                    ('characterId' in parsed || 'eventId' in parsed || 'completedAt' in parsed)) {
                  localStorage.removeItem(key);
                  console.log(`Removed legacy coop timer key: ${key}`);
                }
              }
            } catch {
              // JSON 파싱 실패 시 무시
            }
          }
        }
      });

      console.log("Old coop timer data cleanup completed");

    } catch (error) {
      console.error("Failed to cleanup old coop timer data:", error);
    }
  }

  // 개발/테스트용: 마이그레이션 상태 초기화
  async resetMigrationState(): Promise<void> {
    localStorage.removeItem("coop_timer_migration_complete");
    localStorage.removeItem("coop_timer_migration_date");
    console.log("Migration state reset - migration will run again on next load");
  }
}

export const characterStorage = new CharacterStorage();
