// components/ui/data-table/components/main/smart-tooltip-cell.tsx
"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/base/tooltip";

interface SmartTooltipCellProps {
  children: React.ReactNode;
  className?: string;
  tooltipText?: string; // 툴팁에 표시할 텍스트를 별도로 전달
}

/**
 * 텍스트가 실제로 잘렸을 때만 툴팁을 표시하는 스마트한 셀
 */
export function SmartTooltipCell({ children, className = "", tooltipText }: SmartTooltipCellProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const element = textRef.current;
        const isTextOverflowing = element.scrollWidth > element.clientWidth;
        setIsOverflowing(isTextOverflowing);
      }
    };

    // DOM 업데이트 후 체크
    const timeoutId = setTimeout(checkOverflow, 0);

    // 리사이즈 이벤트에도 반응
    window.addEventListener("resize", checkOverflow);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkOverflow);
    };
  }, [children]);

  // 툴팁에 표시할 텍스트 (별도로 전달되거나 children에서 추출)
  const textContent = tooltipText || (typeof children === "string" ? children : "");
  const spanElement = (
    <span
      ref={textRef}
      className={`overflow-hidden text-ellipsis whitespace-nowrap ${className}`}
      style={{ minWidth: 0 }}>
      {children}
    </span>
  );

  // 오버플로우가 있고 텍스트가 있을 때만 툴팁 표시
  if (isOverflowing && textContent.trim()) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{spanElement}</TooltipTrigger>
          <TooltipContent
            side="top"
            className="">
            <p>{textContent}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return spanElement;
}
