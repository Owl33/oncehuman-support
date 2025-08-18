// app/coop-timer/lib/timer-calculations.ts
import { ResetConfig, CoopProgress } from "@/types/coop-timer";

// 리셋 패턴 정보
interface ResetInfo {
  type: "interval" | "daily" | "weekly";
  ms?: number;
  hour?: number;
  minute?: number;
  day?: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export class ResetCalculator {
  /**
   * 리셋 패턴 문자열을 파싱
   * @param reset - "3600000" | "daily-00:00" | "weekly-wed-06:00"
   */
  private static parseResetPattern(reset: string): ResetInfo {
    // 숫자만 있으면 interval (ms)
    if (/^\d+$/.test(reset)) {
      return { type: "interval", ms: parseInt(reset) };
    }

    // daily-HH:MM 패턴
    const dailyMatch = reset.match(/^daily-(\d{2}):(\d{2})$/);
    if (dailyMatch) {
      return {
        type: "daily",
        hour: parseInt(dailyMatch[1]),
        minute: parseInt(dailyMatch[2]),
      };
    }

    // weekly-DAY-HH:MM 패턴
    const weeklyMatch = reset.match(/^weekly-(mon|tue|wed|thu|fri|sat|sun)-(\d{2}):(\d{2})$/);
    if (weeklyMatch) {
      const dayMap = {
        sun: 0,
        mon: 1,
        tue: 2,
        wed: 3,
        thu: 4,
        fri: 5,
        sat: 6,
      };
      return {
        type: "weekly",
        day: dayMap[weeklyMatch[1] as keyof typeof dayMap],
        hour: parseInt(weeklyMatch[2]),
        minute: parseInt(weeklyMatch[3]),
      };
    }

    throw new Error(`Invalid reset pattern: ${reset}`);
  }

  /**
   * 다음 리셋 시간 계산
   */
  static getNextResetTime(resetConfig: ResetConfig): Date {
    const info = this.parseResetPattern(resetConfig.reset);
    const now = new Date();

    switch (info.type) {
      case "interval":
        return this.getNextIntervalReset(now, info.ms!);

      case "daily":
        return this.getNextDailyReset(now, info.hour!, info.minute!);

      case "weekly":
        return this.getNextWeeklyReset(now, info.day!, info.hour!, info.minute!);

      default:
        throw new Error(`Unsupported reset type: ${info.type}`);
    }
  }

  /**
   * 완료 시점 기준 다음 리셋 시간 계산
   */
  static getNextResetTimeAfterCompletion(resetConfig: ResetConfig, completedAtMs: number): Date {
    const info = this.parseResetPattern(resetConfig.reset);
    const completed = new Date(completedAtMs);

    switch (info.type) {
      case "interval":
        // 완료 시점에서 interval만큼 후
        return new Date(completedAtMs + info.ms!);

      case "daily":
        // 완료 다음날 지정 시간
        const nextDay = new Date(completed);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(info.hour!, info.minute!, 0, 0);
        return nextDay;

      case "weekly":
        // 완료 다음 주 지정 요일/시간
        return this.getNextWeeklyReset(completed, info.day!, info.hour!, info.minute!);

      default:
        return this.getNextResetTime(resetConfig);
    }
  }

  /**
   * 진행상황이 리셋되어야 하는지 확인
   */
  static shouldResetProgress(progress: CoopProgress, resetConfig: ResetConfig): boolean {
    if (!progress.isCompleted) return false;
    if (!progress.completedAt || progress.completedAt === 0) return false;

    const completedTime = progress.completedAt;
    const lastResetTime = this.getLastResetTime(resetConfig).getTime();

    return completedTime < lastResetTime;
  }

  /**
   * 마지막 리셋 시간 계산
   */
  private static getLastResetTime(resetConfig: ResetConfig): Date {
    const info = this.parseResetPattern(resetConfig.reset);
    const now = new Date();

    switch (info.type) {
      case "interval": {
        // Epoch 기준으로 정렬된 마지막 리셋 시간
        const nowMs = now.getTime();
        const lastResetMs = Math.floor(nowMs / info.ms!) * info.ms!;
        return new Date(lastResetMs);
      }

      case "daily": {
        // 오늘 리셋 시간이 지났으면 오늘, 아니면 어제
        const todayReset = new Date(now);
        todayReset.setHours(info.hour!, info.minute!, 0, 0);

        if (now >= todayReset) {
          return todayReset;
        } else {
          const yesterday = new Date(todayReset);
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday;
        }
      }

      case "weekly": {
        // 이번 주 리셋 시간이 지났으면 이번 주, 아니면 지난 주
        const currentDay = now.getDay();
        const targetDay = info.day!;
        const daysSinceReset = (currentDay - targetDay + 7) % 7;

        const thisWeekReset = new Date(now);
        thisWeekReset.setDate(thisWeekReset.getDate() - daysSinceReset);
        thisWeekReset.setHours(info.hour!, info.minute!, 0, 0);

        if (now >= thisWeekReset) {
          return thisWeekReset;
        } else {
          const lastWeekReset = new Date(thisWeekReset);
          lastWeekReset.setDate(lastWeekReset.getDate() - 7);
          return lastWeekReset;
        }
      }

      default:
        return new Date(0);
    }
  }

  /**
   * Interval 기반 다음 리셋 시간
   */
  private static getNextIntervalReset(now: Date, intervalMs: number): Date {
    const nowMs = now.getTime();
    const lastResetMs = Math.floor(nowMs / intervalMs) * intervalMs;
    return new Date(lastResetMs + intervalMs);
  }

  /**
   * 일간 다음 리셋 시간
   */
  private static getNextDailyReset(now: Date, hour: number, minute: number): Date {
    const todayReset = new Date(now);
    todayReset.setHours(hour, minute, 0, 0);

    if (now < todayReset) {
      return todayReset;
    }

    const tomorrow = new Date(todayReset);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * 주간 다음 리셋 시간
   */
  private static getNextWeeklyReset(
    now: Date,
    targetDay: number,
    hour: number,
    minute: number
  ): Date {
    const currentDay = now.getDay();
    let daysUntilReset = (targetDay - currentDay + 7) % 7;

    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + daysUntilReset);
    candidate.setHours(hour, minute, 0, 0);

    // 오늘이 타겟 요일이고 이미 리셋 시간이 지났다면 다음 주
    if (daysUntilReset === 0 && now >= candidate) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  }

  /**
   * 남은 시간을 포맷팅
   */
  static formatTimeLeft(timeLeft: number): string {
    if (timeLeft <= 0) return "초기화됨";

    const totalSeconds = Math.floor(timeLeft / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    if (minutes > 0) return `${minutes}분 ${seconds}초`;
    return `${seconds}초`;
  }

  /**
   * 완료 시간을 절대 시간으로 포맷팅
   */
  static formatCompletedTime(completedAt: Date): string {
    return this.formatAbsoluteDateTime(completedAt);
  }

  /**
   * 한국어 날짜/시간 포맷팅 (예: 2025-08-16(월) 02:23)
   */
  static formatKoreanDateTime(date: Date): string {
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = weekdays[date.getDay()];
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}(${weekday}) ${hour}:${minute}`;
  }

  /**
   * 다음 리셋 시간을 절대 시간으로 포맷팅
   */
  static formatNextResetTime(nextReset: Date): string {
    return this.formatAbsoluteDateTime(nextReset);
  }

  /**
   * 절대 시간 포맷팅 (YYYY-MM-DD HH:MM:SS)
   */
  static formatAbsoluteDateTime(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    const second = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}
