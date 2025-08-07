// types/css-types.d.ts
import * as React from 'react';

// CSS 커스텀 프로퍼티를 위한 타입 확장
declare module 'react' {
  interface CSSProperties {
    // CSS 변수 지원
    [key: `--${string}`]: string | number;
  }
}