// components/ui/data-table/hooks/use-debounced-save.ts
import { useEffect, useRef } from 'react';
import { sessionStorageUtils } from '@/utils/session-storage';

interface UseDebouncedSaveOptions {
  delay?: number;
  merge?: boolean; // 기존 데이터와 병합할지 여부
}

export function useDebouncedSave<T>(
  key: string,
  value: T,
  options: UseDebouncedSaveOptions = {}
) {
  const { delay = 300, merge = true } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // 이전 timeout 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 새 timeout 설정
    timeoutRef.current = setTimeout(() => {
      if (merge) {
        const savedState = sessionStorageUtils.getJSON(key) || {};
        sessionStorageUtils.setJSON(key, {
          ...savedState,
          ...value,
        });
      } else {
        sessionStorageUtils.setJSON(key, value);
      }
    }, delay);
    
    // cleanup - 컴포넌트 언마운트 시 실행
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, value, delay, merge]);
}