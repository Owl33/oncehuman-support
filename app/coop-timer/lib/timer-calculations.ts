// app/coop-timer/lib/timer-calculations.ts
import { ResetType, ResetConfig, WeekDay, CoopProgress } from "@/types/coop-timer";

export class ResetCalculator {
  private static normalizeType(resetConfig: ResetConfig): string {
    const raw = resetConfig.type as any;
    if (typeof raw === "string") return raw.toUpperCase();
    try {
      const fromEnum = (ResetType as any)[raw];
      if (typeof fromEnum === "string") return String(fromEnum).toUpperCase();
    } catch {}
    return String(raw).toUpperCase();
  }

  static getNextResetTime(resetConfig: ResetConfig): Date {
    const now = new Date();
    const type = this.normalizeType(resetConfig);

    switch (type) {
      case "HOURLY":
        return this.getNextHourlyReset(now, resetConfig.interval!);
      case "DAILY":
        return this.getNextDailyReset(now, resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0);
      case "WEEKLY":
        return this.getNextWeeklyReset(now, resetConfig.resetDay ?? WeekDay.WEDNESDAY, resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0);
      case "CUSTOM":
        return this.getNextCustomReset(now, resetConfig.interval!);
      default:
        throw new Error(`Unsupported reset type: ${resetConfig.type}`);
    }
  }

  private static getNextHourlyReset(now: Date, intervalMs: number): Date {
    return this.getNextCustomReset(now, intervalMs);
  }

  private static getNextCustomReset(now: Date, intervalMs: number): Date {
    // Global epoch-aligned next boundary
    const nowMs = now.getTime();
    const lastResetMs = Math.floor(nowMs / intervalMs) * intervalMs;
    return new Date(lastResetMs + intervalMs);
  }

  private static getNextDailyReset(now: Date, hour: number, minute: number): Date {
    const todayReset = new Date(now);
    todayReset.setHours(hour, minute, 0, 0);
    if (now < todayReset) return todayReset;
    const tomorrow = new Date(todayReset);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  private static getNextWeeklyReset(now: Date, targetDay: WeekDay, hour: number, minute: number): Date {
    const currentDay = now.getDay();
    let daysUntilReset = (targetDay - currentDay + 7) % 7;
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + daysUntilReset);
    candidate.setHours(hour, minute, 0, 0);
    if (daysUntilReset === 0 && now >= candidate) candidate.setDate(candidate.getDate() + 7);
    return candidate;
  }

  static shouldResetProgress(progress: CoopProgress, resetConfig: ResetConfig): boolean {
    if (!progress.isCompleted) return false;
    if (!progress.completedAt || progress.completedAt === 0) return false;

    const completedTime = new Date(progress.completedAt).getTime();
    const lastResetTime = this.getLastResetTime(resetConfig).getTime();
    return completedTime < lastResetTime;
  }

  private static getLastResetTime(resetConfig: ResetConfig): Date {
    const now = new Date();
    const type = this.normalizeType(resetConfig);

    switch (type) {
      case "HOURLY":
      case "CUSTOM": {
        const intervalMs = resetConfig.interval!;
        const nowMs = now.getTime();
        const lastResetMs = Math.floor(nowMs / intervalMs) * intervalMs;
        return new Date(lastResetMs);
      }
      case "DAILY": {
        const todayReset = new Date(now);
        todayReset.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        if (now >= todayReset) return todayReset;
        const yesterday = new Date(todayReset);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      case "WEEKLY": {
        const currentDay = now.getDay();
        const targetDay = resetConfig.resetDay ?? WeekDay.WEDNESDAY;
        const daysSinceReset = (currentDay - targetDay + 7) % 7;
        const thisWeekReset = new Date(now);
        thisWeekReset.setDate(thisWeekReset.getDate() - daysSinceReset);
        thisWeekReset.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        if (now < thisWeekReset) {
          const lastWeekReset = new Date(thisWeekReset);
          lastWeekReset.setDate(lastWeekReset.getDate() - 7);
          return lastWeekReset;
        }
        return thisWeekReset;
      }
      default:
        return new Date(0);
    }
  }

  // --- 핵심: 완료 시점 기준 다음 리셋 계산 (사용자가 클릭한 시점으로부터 interval 계산 등)
  static getNextResetTimeAfterCompletion(resetConfig: ResetConfig, completedAtMs: number): Date {
    const type = this.normalizeType(resetConfig);
    const completed = new Date(completedAtMs);

    switch (type) {
      case "HOURLY":
      case "CUSTOM": {
        const intervalMs = resetConfig.interval!;
        return new Date(completedAtMs + intervalMs);
      }
      case "DAILY": {
        const base = new Date(completed);
        base.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        if (completed < base) return base;
        const next = new Date(base);
        next.setDate(next.getDate() + 1);
        return next;
      }
      case "WEEKLY": {
        const target = resetConfig.resetDay ?? WeekDay.WEDNESDAY;
        const completedDay = completed.getDay();
        let daysUntil = (target - completedDay + 7) % 7;
        const candidate = new Date(completed);
        candidate.setDate(candidate.getDate() + daysUntil);
        candidate.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        if (completed >= candidate) candidate.setDate(candidate.getDate() + 7);
        return candidate;
      }
      default:
        return this.getNextResetTime(resetConfig);
    }
  }

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

  static formatCompletedTime(completedAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - completedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (diffHours > 24) {
      return completedAt.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMinutes > 0) return `${diffMinutes}분 전`;
    return "방금 전";
  }
}
