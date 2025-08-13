"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/base/button";
import { cn } from "@/lib/utils";

export function ToggleTheme({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn("size-7", className)}
        disabled
        {...props}>
        <Sun className="h-4 w-4" />
        <span className="sr-only">테마 변경</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    // 첫 클릭 시 system에서 현재 시스템 테마의 반대로 변경
    // 이후에는 Light ↔ Dark 토글
    if (theme === "system") {
      // 시스템 테마가 dark면 light로, light면 dark로
      setTheme(systemTheme === "dark" ? "light" : "dark");
    } else {
      // Light ↔ Dark 토글
      setTheme(theme === "light" ? "dark" : "light");
    }
  };

  const getIcon = () => {
    // 실제 표시되는 테마 확인
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    return currentTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getTooltip = () => {
    const currentTheme = theme === "system" ? systemTheme : theme;
    
    return currentTheme === "dark" 
      ? "다크 모드 (라이트로 변경)" 
      : "라이트 모드 (다크로 변경)";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={toggleTheme}
      title={getTooltip()}
      {...props}>
      {getIcon()}
      <span className="sr-only">{getTooltip()}</span>
    </Button>
  );
}
