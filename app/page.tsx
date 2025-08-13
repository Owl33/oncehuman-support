// app/page.tsx
"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { User, ArrowRightLeft, Calculator, Timer, Mail, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("ahsxkc@gmail.com");
      toast.success("이메일 주소가 복사되었습니다!");
    } catch (err) {
      toast.error("복사에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">OnceHuman Support</h1>
        <p className="text-xl text-muted-foreground mb-8">
          원스휴먼에 도움이 되는 각종 계산 구현 예정
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* 메인 기능 */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>캐릭터 관리</CardTitle>
                <CardDescription>캐릭터 정보 및 진행 상황 관리</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">캐릭터 정보를 입력해주세요.</p>
            <Link href="/character">
              <Button className="w-full">시작하기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <CardTitle>이전 포인트 계산</CardTitle>
                <CardDescription>서버 이전에 필요한 포인트 계산</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              서버 이전을 위한 제작 아이템과 필요 재료를 계산합니다.
            </p>
            <Link href="/switch-point">
              <Button className="w-full">계산하기</Button>
            </Link>
          </CardContent>
        </Card>

        {/* 준비중 기능 */}
        <Card className="hover:shadow-lg transition-shadow opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calculator className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <CardTitle>데미지 계산기</CardTitle>
                <CardDescription>무기 데미지 및 빌드 최적화</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              다양한 무기의 DPS와 최적화된 빌드를 계산해보세요.
            </p>
            <Link href="/damage">
              <Button
                variant="outline"
                className="w-full">
                준비중
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow opacity-75">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <CardTitle>협동 타이머</CardTitle>
                <CardDescription>협동 미션 및 이벤트 타이머</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">협동 콘텐츠 타이머.</p>
            <Link href="/coop-timer">
              <Button
                variant="outline"
                className="w-full">
                준비중
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* 건의사항 / 제보 섹션 */}
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">건의사항 및 제보</h2>
          <p className="text-lg text-muted-foreground">
            버그 신고, 기능 제안, 개선사항 등을 알려주세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle>이메일 문의</CardTitle>
                  <CardDescription>이메일로 내용을 보내주세요</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  className="w-full "
                  onClick={handleCopyEmail}>
                  <Copy className="mr-2 h-4 w-4" />
                  ahsxkc@gmail.com
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <CardTitle>카카오톡 오픈채팅</CardTitle>
                  <CardDescription> 확인 후 답장 드리겠습니다.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a
                href="https://open.kakao.com/o/s1CwNlMh"
                target="_blank"
                rel="noopener noreferrer">
                <Button
                  variant="outline"
                  className="w-full">
                  오픈채팅방 참여하기
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
