// components/ui/data-table/utils/column-size-parser.ts

export type ColumnSizeValue = number | string;

export interface ParsedColumnSize {
  type: 'px' | 'tailwind' | 'percentage' | 'vw' | 'fraction';
  value: string | number;
  cssValue: string;
  isFixed: boolean;
}

/**
 * 컬럼 size 값을 파싱하여 적절한 CSS 값으로 변환
 */
export function parseColumnSize(size: ColumnSizeValue): ParsedColumnSize {
  // 숫자인 경우: px 단위
  if (typeof size === 'number') {
    return {
      type: 'px',
      value: size,
      cssValue: `${size}px`,
      isFixed: true
    };
  }

  const sizeStr = size.toString().trim();

  // Tailwind CSS 클래스인 경우
  if (sizeStr.startsWith('w-')) {
    // w-[50px] 형태
    if (sizeStr.includes('[') && sizeStr.includes(']')) {
      const match = sizeStr.match(/w-\[(.+)\]/);
      if (match) {
        return {
          type: 'tailwind',
          value: sizeStr,
          cssValue: match[1],
          isFixed: match[1].includes('px') || match[1].includes('rem')
        };
      }
    }
    
    // w-full, w-1/2 등
    return {
      type: 'tailwind',
      value: sizeStr,
      cssValue: getTailwindWidthValue(sizeStr),
      isFixed: false // Tailwind 유틸리티는 기본적으로 responsive
    };
  }

  // 백분율인 경우 (50%, 100% 등)
  if (sizeStr.includes('%')) {
    return {
      type: 'percentage',
      value: sizeStr,
      cssValue: sizeStr,
      isFixed: false
    };
  }

  // vw 단위인 경우 (20vw, 50vw 등)
  if (sizeStr.includes('vw')) {
    return {
      type: 'vw',
      value: sizeStr,
      cssValue: sizeStr,
      isFixed: false
    };
  }

  // 분수 형태인 경우 (1/2, 1/3 등)
  if (sizeStr.includes('/')) {
    const [numerator, denominator] = sizeStr.split('/').map(Number);
    if (numerator && denominator) {
      const percentage = (numerator / denominator * 100).toFixed(2);
      return {
        type: 'fraction',
        value: sizeStr,
        cssValue: `${percentage}%`,
        isFixed: false
      };
    }
  }

  // 기본적으로 CSS 값으로 처리
  return {
    type: 'px',
    value: sizeStr,
    cssValue: sizeStr,
    isFixed: sizeStr.includes('px') || sizeStr.includes('rem')
  };
}

/**
 * Tailwind CSS width 클래스를 실제 CSS 값으로 변환
 */
function getTailwindWidthValue(className: string): string {
  const tailwindWidthMap: Record<string, string> = {
    // Fractions
    'w-1/2': '50%',
    'w-1/3': '33.333333%',
    'w-2/3': '66.666667%', 
    'w-1/4': '25%',
    'w-3/4': '75%',
    'w-1/5': '20%',
    'w-2/5': '40%',
    'w-3/5': '60%',
    'w-4/5': '80%',
    'w-1/6': '16.666667%',
    'w-5/6': '83.333333%',
    
    // Fixed widths (rem-based)
    'w-0': '0px',
    'w-px': '1px',
    'w-0.5': '0.125rem',
    'w-1': '0.25rem',
    'w-1.5': '0.375rem',
    'w-2': '0.5rem',
    'w-2.5': '0.625rem',
    'w-3': '0.75rem',
    'w-3.5': '0.875rem',
    'w-4': '1rem',
    'w-5': '1.25rem',
    'w-6': '1.5rem',
    'w-7': '1.75rem',
    'w-8': '2rem',
    'w-9': '2.25rem',
    'w-10': '2.5rem',
    'w-11': '2.75rem',
    'w-12': '3rem',
    'w-14': '3.5rem',
    'w-16': '4rem',
    'w-20': '5rem',
    'w-24': '6rem',
    'w-28': '7rem',
    'w-32': '8rem',
    'w-36': '9rem',
    'w-40': '10rem',
    'w-44': '11rem',
    'w-48': '12rem',
    'w-52': '13rem',
    'w-56': '14rem',
    'w-60': '15rem',
    'w-64': '16rem',
    'w-72': '18rem',
    'w-80': '20rem',
    'w-96': '24rem',
    
    // Responsive widths
    'w-auto': 'auto',
    'w-full': '100%',
    'w-screen': '100vw',
    'w-min': 'min-content',
    'w-max': 'max-content',
    'w-fit': 'fit-content',
  };

  return tailwindWidthMap[className] || '150px'; // 기본값
}

/**
 * 컬럼이 고정 크기인지 확인 (table-layout: fixed에서 사용)
 */
export function isFixedSizeColumn(size?: ColumnSizeValue): boolean {
  if (!size) return false;
  
  const parsed = parseColumnSize(size);
  return parsed.isFixed;
}