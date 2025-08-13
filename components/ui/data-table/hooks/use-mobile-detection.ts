"use client";

import { useState, useEffect } from "react";

interface MobileDetectionHook {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
}

export function useMobileDetection(): MobileDetectionHook {
  const [screenWidth, setScreenWidth] = useState(0);
  
  useEffect(() => {
    // 초기값 설정
    setScreenWidth(window.innerWidth);
    
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tailwind CSS 브레이크포인트와 일치
  const isMobile = screenWidth > 0 && screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
  };
}