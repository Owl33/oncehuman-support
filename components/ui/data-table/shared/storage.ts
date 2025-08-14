// components/ui/data-table/shared/storage.ts

/**
 * 통합된 스토리지 유틸리티
 */
export class TableStorage {
  private static prefix = "datatable_";

  /**
   * sessionStorage에 데이터 저장
   */
  static save<T>(key: string, data: T, options?: { merge?: boolean }): void {
    try {
      const fullKey = this.prefix + key;
      let dataToSave = data;

      if (options?.merge) {
        const existing = this.load<T>(key);
        if (existing && typeof existing === 'object' && typeof data === 'object') {
          dataToSave = { ...existing, ...data } as T;
        }
      }

      sessionStorage.setItem(fullKey, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save to sessionStorage:', error);
    }
  }

  /**
   * sessionStorage에서 데이터 로드
   */
  static load<T>(key: string): T | null {
    try {
      const fullKey = this.prefix + key;
      const item = sessionStorage.getItem(fullKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to load from sessionStorage:', error);
      return null;
    }
  }

  /**
   * sessionStorage에서 데이터 삭제
   */
  static remove(key: string): void {
    try {
      const fullKey = this.prefix + key;
      sessionStorage.removeItem(fullKey);
    } catch (error) {
      console.warn('Failed to remove from sessionStorage:', error);
    }
  }

  /**
   * 모든 테이블 관련 데이터 삭제
   */
  static clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
  }
}

/**
 * 디바운스된 저장 hook용 함수
 */
export function createDebouncedSave<T>(
  key: string,
  delay: number = 300,
  options?: { merge?: boolean }
) {
  let timeoutId: NodeJS.Timeout;

  return (data: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      TableStorage.save(key, data, options);
    }, delay);
  };
}