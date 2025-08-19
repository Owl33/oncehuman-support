import { cva } from "class-variance-authority";

/**
 * 카테고리별 스타일 variants
 * shadcn/ui 테마 시스템을 활용한 다크모드 호환 스타일
 */
export const categoryVariants = cva(
  "relative overflow-hidden rounded-xl border p-4 transition-colors",
  {
    variants: {
      variant: {
        // 시간별 이벤트 - emerald/teal 계열
        hourly: [
          "bg-gradient-to-br from-green-50 to-emerald-50",
          "border-green-200",
          "dark:from-green-950/30 dark:to-emerald-950/30",
          "dark:border-green-800/30"
        ],
        // 일간 이벤트 - blue 계열
        daily: [
          "bg-gradient-to-br from-blue-50 to-sky-50", 
          "border-blue-200",
          "dark:from-blue-950/30 dark:to-sky-950/30",
          "dark:border-blue-800/30"
        ],
        // 주간 퀘스트 - purple 계열
        weekly: [
          "bg-gradient-to-br from-purple-50 to-violet-50",
          "border-purple-200", 
          "dark:from-purple-950/30 dark:to-violet-950/30",
          "dark:border-purple-800/30"
        ],
        // 테스트 이벤트 - gray 계열
        test: [
          "bg-gradient-to-br from-gray-50 to-slate-50",
          "border-gray-200",
          "dark:from-gray-950/30 dark:to-slate-950/30", 
          "dark:border-gray-800/30"
        ]
      },
      size: {
        compact: "p-4 space-y-3",
        modern: "p-6 space-y-4"
      }
    },
    defaultVariants: {
      variant: "hourly",
      size: "compact"
    }
  }
);

/**
 * 카테고리 아이콘 wrapper 스타일
 */
export const categoryIconVariants = cva(
  "flex items-center justify-center rounded-lg text-white shadow-sm transition-colors",
  {
    variants: {
      variant: {
        hourly: [
          "bg-gradient-to-br from-green-500 to-emerald-600",
          "dark:from-green-600 dark:to-emerald-700"
        ],
        daily: [
          "bg-gradient-to-br from-blue-500 to-sky-600",
          "dark:from-blue-600 dark:to-sky-700"
        ],
        weekly: [
          "bg-gradient-to-br from-purple-500 to-violet-600", 
          "dark:from-purple-600 dark:to-violet-700"
        ],
        test: [
          "bg-gradient-to-br from-gray-500 to-slate-600",
          "dark:from-gray-600 dark:to-slate-700"
        ]
      },
      size: {
        compact: "w-10 h-10",
        modern: "w-14 h-14"
      }
    },
    defaultVariants: {
      variant: "hourly", 
      size: "compact"
    }
  }
);

/**
 * 카테고리 제목 스타일
 */
export const categoryTitleVariants = cva(
  "font-semibold transition-colors",
  {
    variants: {
      variant: {
        hourly: "text-green-700 dark:text-green-300",
        daily: "text-blue-700 dark:text-blue-300", 
        weekly: "text-purple-700 dark:text-purple-300",
        test: "text-gray-700 dark:text-gray-300"
      },
      size: {
        compact: "text-sm",
        modern: "text-xl"
      }
    },
    defaultVariants: {
      variant: "hourly",
      size: "compact"
    }
  }
);

/**
 * 카테고리별 테마 매핑
 */
export const categoryThemes = {
  hourly: {
    title: "시간별",
    modernTitle: "시간별 이벤트",
    variant: "hourly" as const
  },
  daily: {
    title: "일간", 
    modernTitle: "일간 이벤트",
    variant: "daily" as const
  },
  weekly: {
    title: "주간",
    modernTitle: "주간 퀘스트", 
    variant: "weekly" as const
  },
  test: {
    title: "테스트",
    modernTitle: "테스트 이벤트",
    variant: "test" as const
  }
} as const;

export type CategoryVariant = keyof typeof categoryThemes;