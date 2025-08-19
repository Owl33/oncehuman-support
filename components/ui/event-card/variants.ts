import { cva } from "class-variance-authority";

/**
 * 이벤트 카드 스타일 variants
 * 다크모드 호환 색상 시스템
 */
export const eventCardVariants = cva(
  "group relative transition-all duration-200 cursor-pointer",
  {
    variants: {
      variant: {
        hourly: [
          "border-green-200 dark:border-green-800/50",
          "hover:border-green-300 dark:hover:border-green-700/70"
        ],
        daily: [
          "border-blue-200 dark:border-blue-800/50",
          "hover:border-blue-300 dark:hover:border-blue-700/70"
        ],
        weekly: [
          "border-purple-200 dark:border-purple-800/50",
          "hover:border-purple-300 dark:hover:border-purple-700/70"
        ],
        test: [
          "border-gray-200 dark:border-gray-700/50",
          "hover:border-gray-300 dark:hover:border-gray-600/70"
        ]
      },
      state: {
        pending: [
          "bg-card",
          "hover:shadow-md"
        ],
        completed: [
          "bg-green-50 dark:bg-green-950/30",
          "border-green-200 dark:border-green-800/50"
        ]
      },
      style: {
        compact: "flex items-center gap-3 p-3 rounded-xl border",
        modern: "overflow-hidden rounded-2xl border-2 bg-card shadow-lg hover:shadow-xl"
      }
    },
    defaultVariants: {
      variant: "hourly",
      state: "pending",
      style: "compact"
    }
  }
);

/**
 * 이벤트 아이콘 container variants
 */
export const eventIconVariants = cva(
  "flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        hourly: [
          "bg-green-100 dark:bg-green-900/50",
          "text-green-600 dark:text-green-400"
        ],
        daily: [
          "bg-blue-100 dark:bg-blue-900/50", 
          "text-blue-600 dark:text-blue-400"
        ],
        weekly: [
          "bg-purple-100 dark:bg-purple-900/50",
          "text-purple-600 dark:text-purple-400"
        ],
        test: [
          "bg-gray-100 dark:bg-gray-800/50",
          "text-gray-600 dark:text-gray-400"
        ]
      },
      state: {
        pending: "",
        completed: "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
      },
      size: {
        compact: "w-8 h-8",
        modern: "w-12 h-12"
      }
    },
    defaultVariants: {
      variant: "hourly",
      state: "pending", 
      size: "compact"
    }
  }
);

/**
 * 이벤트 텍스트 variants
 */
export const eventTextVariants = cva(
  "transition-colors duration-200",
  {
    variants: {
      element: {
        title: "font-medium text-foreground",
        badge: "inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium",
        description: "text-sm text-muted-foreground line-clamp-2",
        time: "text-xs font-medium",
        status: "text-sm"
      },
      variant: {
        hourly: "",
        daily: "",
        weekly: "",
        test: ""
      },
      state: {
        pending: "",
        completed: "text-green-800 dark:text-green-200"
      }
    },
    compoundVariants: [
      // Badge variants
      {
        element: "badge",
        variant: "hourly",
        className: "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200"
      },
      {
        element: "badge", 
        variant: "daily",
        className: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200"
      },
      {
        element: "badge",
        variant: "weekly", 
        className: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200"
      },
      {
        element: "badge",
        variant: "test",
        className: "bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200"
      },
      // Time variants
      {
        element: "time",
        state: "pending",
        className: "text-muted-foreground"
      },
      {
        element: "time", 
        state: "completed",
        className: "text-orange-600 dark:text-orange-400"
      }
    ],
    defaultVariants: {
      element: "title",
      variant: "hourly",
      state: "pending"
    }
  }
);

/**
 * 상태 토글 버튼 variants
 */
export const statusToggleVariants = cva(
  "flex-shrink-0 transition-colors duration-200",
  {
    variants: {
      state: {
        pending: "text-muted-foreground hover:text-foreground",
        completed: "text-green-600 dark:text-green-400"
      },
      size: {
        compact: "w-5 h-5",
        modern: "w-6 h-6"
      }
    },
    defaultVariants: {
      state: "pending",
      size: "compact"
    }
  }
);

/**
 * 완료 표시줄 variants (compact 스타일용)
 */
export const completionBarVariants = cva(
  "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
  {
    variants: {
      visible: {
        true: "bg-green-500 dark:bg-green-400",
        false: "opacity-0"
      }
    },
    defaultVariants: {
      visible: false
    }
  }
);

/**
 * 카테고리 설정 매핑
 */
export const categoryLabels = {
  hourly: "시간별",
  daily: "일간", 
  weekly: "주간",
  test: "테스트"
} as const;

export type EventCardVariant = keyof typeof categoryLabels;