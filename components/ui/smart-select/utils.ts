import { ItemExtractor, ItemBooleanExtractor, ProcessedItem } from "./types";

/**
 * 아이템에서 값을 추출하는 유틸리티 함수
 */
export function extractValue<T>(item: T, extractor: ItemExtractor<T>): string {
  if (typeof extractor === "string") {
    return String((item as any)[extractor] ?? "");
  }
  return extractor(item);
}

/**
 * 아이템에서 boolean 값을 추출하는 유틸리티 함수
 */
export function extractBoolean<T>(item: T, extractor?: ItemBooleanExtractor<T>): boolean {
  if (!extractor) return false;
  
  if (typeof extractor === "string") {
    return Boolean((item as any)[extractor]);
  }
  return extractor(item);
}

/**
 * 아이템 배열을 처리된 아이템 배열로 변환
 */
export function processItems<T>(
  items: T[],
  itemText: ItemExtractor<T>,
  itemValue: ItemExtractor<T>,
  itemDisabled?: ItemBooleanExtractor<T>
): ProcessedItem<T>[] {
  return items.map(item => ({
    item,
    value: extractValue(item, itemValue),
    text: extractValue(item, itemText),
    disabled: extractBoolean(item, itemDisabled),
  }));
}

/**
 * 값으로 아이템 찾기
 */
export function findItemByValue<T>(
  processedItems: ProcessedItem<T>[],
  value: string
): ProcessedItem<T> | undefined {
  return processedItems.find(item => item.value === value);
}

/**
 * 다중 값으로 아이템들 찾기
 */
export function findItemsByValues<T>(
  processedItems: ProcessedItem<T>[],
  values: string[]
): ProcessedItem<T>[] {
  return processedItems.filter(item => values.includes(item.value));
}

/**
 * 선택된 값들을 배열로 정규화
 */
export function normalizeValue(
  value: string | string[] | null | undefined,
  multiple: boolean
): string[] {
  if (value === null || value === undefined) {
    return [];
  }
  
  if (multiple) {
    return Array.isArray(value) ? value : [value];
  } else {
    return Array.isArray(value) ? value.slice(0, 1) : [value];
  }
}

/**
 * 값이 선택되었는지 확인
 */
export function isValueSelected(
  value: string,
  selectedValues: string[]
): boolean {
  return selectedValues.includes(value);
}

/**
 * 값 토글 (다중 선택용)
 */
export function toggleValue(
  value: string,
  currentValues: string[]
): string[] {
  if (currentValues.includes(value)) {
    return currentValues.filter(v => v !== value);
  } else {
    return [...currentValues, value];
  }
}

/**
 * 값 추가 (다중 선택용)
 */
export function addValue(
  value: string,
  currentValues: string[]
): string[] {
  if (currentValues.includes(value)) {
    return currentValues;
  }
  return [...currentValues, value];
}

/**
 * 값 제거 (다중 선택용)
 */
export function removeValue(
  value: string,
  currentValues: string[]
): string[] {
  return currentValues.filter(v => v !== value);
}

/**
 * 모든 값 제거 (clearable용)
 */
export function clearAllValues(): string[] {
  return [];
}

/**
 * 반환 값 형식 결정 (returnObject 지원)
 */
export function formatReturnValue<T>(
  selectedItems: ProcessedItem<T>[],
  multiple: boolean,
  returnObject: boolean
): string | string[] | T | T[] {
  if (returnObject) {
    const objects = selectedItems.map(item => item.item);
    return multiple ? objects : (objects[0] || null);
  } else {
    const values = selectedItems.map(item => item.value);
    return multiple ? values : (values[0] || "");
  }
}