// components/ui/coming-soon.tsx
"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/base/card";
import { Badge } from "@/components/base/badge";
import { Construction, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/base/button";
import { useRouter } from "next/navigation";

interface ComingSoonProps {
  title?: string;
  description?: string;
  expectedDate?: string;
  showBackButton?: boolean;
}

/**
 * 준비중인 페이지에서 사용할 공통 컴포넌트
 */
export function ComingSoon({ 
  title = "페이지 준비중", 
  description = "현재 이 페이지는 개발 중입니다. 빠른 시일 내에 서비스를 제공할 예정입니다.",
  expectedDate,
  showBackButton = true
}: ComingSoonProps) {
  const router = useRouter();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
            <Construction className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
          
          {expectedDate && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
              <Clock className="w-4 h-4" />
              <span>예상 완료: {expectedDate}</span>
            </div>
          )}
          
          <Badge variant="secondary" className="text-xs">
            개발 진행중
          </Badge>
          
          {showBackButton && (
            <div className="pt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGoBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                이전으로
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}