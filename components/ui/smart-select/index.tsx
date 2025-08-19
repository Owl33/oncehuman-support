"use client";

import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/base/select";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import { Label } from "@/components/base/label";
import { X, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmartSelectProps } from "./types";
import {
  processItems,
  findItemsByValues,
  normalizeValue,
  toggleValue,
  clearAllValues,
  formatReturnValue,
} from "./utils";

/**
 * 개선된 Smart Select 컴포넌트 (Vuetify v-select 스타일)
 * 
 * @example
 * ```tsx
 * // 기본 사용법
 * <SmartSelect
 *   items={users}
 *   value={selectedUserId}
 *   onChange={setSelectedUserId}
 *   itemText="name"
 *   itemValue="id"
 *   label="사용자 선택"
 *   placeholder="사용자를 선택하세요"
 * />
 * 
 * // 다중 선택 + 칩
 * <SmartSelect
 *   items={characters}
 *   value={selectedCharacterIds}
 *   onChange={setSelectedCharacterIds}
 *   itemText="name"
 *   itemValue="id"
 *   multiple
 *   chips
 *   clearable
 *   label="캐릭터 선택"
 * />
 * 
 * // 커스텀 렌더링
 * <SmartSelect
 *   items={items}
 *   value={selectedId}
 *   onChange={setSelectedId}
 *   itemText="name"
 *   itemValue="id"
 *   renderOption={(item) => (
 *     <div className="flex items-center gap-2">
 *       <span>{item.name}</span>
 *       <span className="text-xs text-muted-foreground">({item.category})</span>
 *     </div>
 *   )}
 * />
 * ```
 */
export function SmartSelect<T>({
  // Data Props
  items = [],
  value,
  onChange,
  itemText,
  itemValue,
  itemDisabled,
  
  // Behavior Props
  clearable = false,
  multiple = false,
  chips = false,
  returnObject = false,
  dense = false,
  
  // Render Customization
  renderSelected,
  renderOption,
  renderChip,
  
  // UI Props
  label,
  placeholder = "선택하세요",
  prependIcon: PrependIcon,
  appendIcon: AppendIcon,
  emptyState,
  hint,
  errorMessage,
  hideDetails = false,
  
  // Style Props
  className,
  disabled = false,
  error = false,
}: SmartSelectProps<T>) {
  // 아이템 처리
  const processedItems = useMemo(() => 
    processItems(items, itemText, itemValue, itemDisabled),
    [items, itemText, itemValue, itemDisabled]
  );

  // 선택된 값들 정규화
  const selectedValues = useMemo(() => 
    normalizeValue(value, multiple),
    [value, multiple]
  );

  // 선택된 아이템들
  const selectedItems = useMemo(() => 
    findItemsByValues(processedItems, selectedValues),
    [processedItems, selectedValues]
  );

  // 값 변경 핸들러
  const handleValueChange = (newValue: string) => {
    let updatedValues: string[];
    
    if (multiple) {
      updatedValues = toggleValue(newValue, selectedValues);
    } else {
      updatedValues = [newValue];
    }
    
    const result = formatReturnValue(
      findItemsByValues(processedItems, updatedValues),
      multiple,
      returnObject
    );
    
    onChange(result as any);
  };

  // 개별 값 제거 (칩에서 사용)
  const handleRemoveValue = (valueToRemove: string) => {
    const updatedValues = selectedValues.filter(v => v !== valueToRemove);
    const result = formatReturnValue(
      findItemsByValues(processedItems, updatedValues),
      multiple,
      returnObject
    );
    
    onChange(result as any);
  };

  // 모든 값 제거 (clearable)
  const handleClear = () => {
    const result = formatReturnValue([], multiple, returnObject);
    onChange(result as any);
  };

  // 빈 상태 처리
  if (items.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label className={cn("text-sm font-medium", error && "text-destructive")}>
            {label}
          </Label>
        )}
        {emptyState || (
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              {PrependIcon && <PrependIcon className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div>
              <h3 className="font-medium text-foreground">항목이 없습니다</h3>
              <p className="text-sm text-muted-foreground">선택할 수 있는 항목이 없습니다.</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label */}
      {label && (
        <Label className={cn(
          "text-sm font-medium",
          error && "text-destructive",
          disabled && "text-muted-foreground"
        )}>
          {label}
        </Label>
      )}

      {/* Select Container */}
      <div className="relative">
        <Select
          value={multiple ? "" : (selectedValues[0] || "")}
          onValueChange={handleValueChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "w-full",
            dense && "h-8 text-sm",
            error && "border-destructive focus:ring-destructive",
            PrependIcon && "pl-10",
            (clearable && selectedValues.length > 0) && "pr-10"
          )}>
            {/* Prepend Icon */}
            {PrependIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <PrependIcon className={cn(
                  "text-muted-foreground",
                  dense ? "w-3 h-3" : "w-4 h-4"
                )} />
              </div>
            )}

            {/* Selected Content */}
            <div className="flex-1 text-left min-w-0">
              {selectedItems.length > 0 ? (
                multiple && chips ? (
                  // 다중 선택 + 칩 모드
                  <div className="flex flex-wrap gap-1">
                    {selectedItems.map((selectedItem) => (
                      <Badge
                        key={selectedItem.value}
                        variant="secondary"
                        className={cn(
                          "max-w-32",
                          dense && "text-xs px-1.5 py-0.5"
                        )}
                      >
                        {renderChip ? (
                          renderChip(selectedItem.item, () => handleRemoveValue(selectedItem.value))
                        ) : (
                          <>
                            <span className="truncate">{selectedItem.text}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 hover:bg-transparent"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveValue(selectedItem.value);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  // 단일 선택 또는 다중 선택 (칩 없음)
                  <div className="flex items-center min-w-0">
                    {renderSelected ? (
                      renderSelected(selectedItems[0]?.item)
                    ) : multiple ? (
                      <span className="truncate">
                        {selectedItems.length}개 선택됨
                      </span>
                    ) : (
                      <span className="truncate">{selectedItems[0]?.text}</span>
                    )}
                  </div>
                )
              ) : (
                // 플레이스홀더
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>

            {/* Clear Button */}
            {clearable && selectedValues.length > 0 && !disabled && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-8 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}

            {/* Append Icon or Chevron */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {AppendIcon ? (
                <AppendIcon className={cn(
                  "text-muted-foreground",
                  dense ? "w-3 h-3" : "w-4 h-4"
                )} />
              ) : (
                <ChevronDown className={cn(
                  "text-muted-foreground",
                  dense ? "w-3 h-3" : "w-4 h-4"
                )} />
              )}
            </div>
          </SelectTrigger>
          
          <SelectContent>
            {processedItems.map((processedItem) => (
              <SelectItem
                key={processedItem.value}
                value={processedItem.value}
                disabled={processedItem.disabled}
                className={cn(
                  multiple && selectedValues.includes(processedItem.value) && "bg-muted"
                )}
              >
                {renderOption ? (
                  renderOption(processedItem.item)
                ) : (
                  <span>{processedItem.text}</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Details */}
      {!hideDetails && (hint || errorMessage) && (
        <div className="space-y-1">
          {errorMessage && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span className="text-xs">{errorMessage}</span>
            </div>
          )}
          {hint && !errorMessage && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      )}
    </div>
  );
}

// 타입 export
export type { SmartSelectProps } from "./types";