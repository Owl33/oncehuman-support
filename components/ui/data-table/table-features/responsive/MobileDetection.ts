// components/ui/data-table/table-features/responsive/MobileDetection.ts
"use client";
import { useState, useEffect } from "react";
import { BREAKPOINTS } from "../../shared/constants";
import type { MobileDetectionHook } from "../../shared/types";
import { getDeviceType } from "../../shared/helpers";

/**
 * 모바일 감지 Hook - 개선된 버전
 */
export function useMobileDetection(): MobileDetectionHook {
  const [screenWidth, setScreenWidth] = useState(0);
  
  useEffect(() => {
    // 초기값 설정
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // 초기 실행
    handleResize();
    
    // 리사이즈 이벤트 등록
    window.addEventListener('resize', handleResize);
    
    // 오리엔테이션 변경 감지 (모바일 기기용)
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const deviceType = getDeviceType(screenWidth);

  return {
    isMobile: deviceType === "mobile",
    isTablet: deviceType === "tablet", 
    isDesktop: deviceType === "desktop",
    screenWidth,
  };
}

/**
 * 터치 디바이스 감지
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
}

/**
 * 화면 크기 기반 컬럼 개수 계산
 */
export function useOptimalColumnCount(baseColumnCount: number = 12): number {
  const { screenWidth } = useMobileDetection();

  if (screenWidth < BREAKPOINTS.mobile) {
    // 모바일: 2-3개 컬럼
    return Math.min(3, baseColumnCount);
  }
  
  if (screenWidth < BREAKPOINTS.tablet) {
    // 태블릿: 4-6개 컬럼  
    return Math.min(6, baseColumnCount);
  }
  
  // 데스크톱: 모든 컬럼
  return baseColumnCount;
}