// components/ui/data-table/table-features/responsive/TouchHandlers.ts
"use client";
import { useCallback, useRef } from "react";

export interface TouchGestureConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  threshold?: number; // 스와이프 감지 임계값
  longPressDelay?: number; // 롱프레스 감지 시간
}

/**
 * 터치 제스처 처리 Hook
 */
export function useTouchGestures(config: TouchGestureConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
  } = config;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // 롱프레스 타이머 시작
    if (onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
        touchStartRef.current = null; // 롱프레스 후 다른 제스처 방지
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // 롱프레스 타이머 클리어
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // 스와이프 제스처 감지
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // 수평 스와이프
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // 수직 스와이프
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    } else if (deltaTime < 300) {
      // 탭 제스처 감지
      const now = Date.now();
      const lastTap = lastTapRef.current;
      lastTapRef.current = now;

      if (now - lastTap < 300 && onDoubleTap) {
        // 더블탭
        onDoubleTap();
        lastTapRef.current = 0; // 더블탭 후 리셋
      } else if (onTap) {
        // 단일 탭 (더블탭 확인을 위해 약간 지연)
        setTimeout(() => {
          if (lastTapRef.current === now) {
            onTap();
          }
        }, 300);
      }
    }

    touchStartRef.current = null;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap, threshold]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 터치 이동 중에는 롱프레스 취소
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchMove: handleTouchMove,
  };
}

/**
 * 행 스와이프 액션을 위한 특화된 Hook
 */
export function useRowSwipeActions(config: {
  onSwipeLeftAction?: () => void; // 예: 삭제
  onSwipeRightAction?: () => void; // 예: 편집
  onDoubleTapAction?: () => void; // 예: 상세보기
}) {
  return useTouchGestures({
    onSwipeLeft: config.onSwipeLeftAction,
    onSwipeRight: config.onSwipeRightAction,
    onDoubleTap: config.onDoubleTapAction,
    threshold: 80, // 행 스와이프는 더 큰 임계값
  });
}

/**
 * 스크롤 동작 최적화
 */
export function useOptimizedScroll() {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  const handleScroll = useCallback((callback?: () => void) => {
    isScrollingRef.current = true;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      isScrollingRef.current = false;
      callback?.();
    }, 150);
  }, []);

  return {
    isScrolling: () => isScrollingRef.current,
    onScroll: handleScroll,
  };
}