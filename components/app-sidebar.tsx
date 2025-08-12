"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Calculator, ArrowRightLeft, Timer, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
  SidebarGroupContent,
} from "@/components/base/sidebar";
import { ToggleTheme } from "@/components/toggle-theme";
import { useIsMobile } from "@/hooks/use-mobile";

// OnceHuman 게임 특화 네비게이션 데이터
const navigationData = [
  {
    title: "메인 기능",
    items: [
      {
        title: "캐릭터 관리",
        url: "/character",
        icon: User,
      },
      {
        title: "이전 포인트 계산",
        url: "/switch-point",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    title: "계산 도구",
    items: [
      {
        title: "데미지 계산",
        url: "/damage",
        icon: Calculator,
      },
      {
        title: "협동 타이머",
        url: "/coop-timer",
        icon: Timer,
      },
    ],
  },
  {
    title: "시스템",
    items: [
      {
        title: "설정",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const isMobileDevice = useIsMobile();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-background/80 backdrop-blur-xl border-border/50">
      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">메뉴</SidebarGroupLabel>
          <SidebarGroupContent className="px-1.5 md:px-0">
            <SidebarMenu>
              {navigationData.map((group) => (
                <>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="py-4"
                        isActive={pathname === item.url}
                        tooltip={item.title}>
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
                    <User className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">플레이어</span>
                    <span className="truncate text-xs text-muted-foreground">게임 도구 사용자</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
                      <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">플레이어</span>
                      <span className="truncate text-xs text-muted-foreground">게임 도구 사용자</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>설정</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Calculator className="mr-2 h-4 w-4" />
                  <span>계산기 도구</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter> */}

      <SidebarRail />
    </Sidebar>
  );
}
