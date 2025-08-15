// app/coop-timer/lib/timer-calculations.ts
import { ResetType, ResetConfig, WeekDay, CoopProgress } from "@/types/coop-timer";

export class ResetCalculator {
  /**
   * 다음 리셋 시간 계산
   */
  static getNextResetTime(resetConfig: ResetConfig): Date {
    const now = new Date();
    
    switch (resetConfig.type) {
      case ResetType.HOURLY:
        return this.getNextHourlyReset(now, resetConfig.interval!);
        
      case ResetType.DAILY:
        return this.getNextDailyReset(now, resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0);
        
      case ResetType.WEEKLY:
        return this.getNextWeeklyReset(
          now, 
          resetConfig.resetDay ?? WeekDay.WEDNESDAY,
          resetConfig.resetHour ?? 0,
          resetConfig.resetMinute ?? 0
        );
        
      case ResetType.CUSTOM:
        return this.getNextCustomReset(now, resetConfig.interval!);
        
      default:
        throw new Error(`Unsupported reset type: ${resetConfig.type}`);
    }
  }

  /**
   * 1시간 주기 리셋
   */
  private static getNextHourlyReset(now: Date, intervalMs: number): Date {
    return new Date(now.getTime() + intervalMs);
  }

  /**
   * 커스텀 간격 리셋
   */
  private static getNextCustomReset(now: Date, intervalMs: number): Date {
    return new Date(now.getTime() + intervalMs);
  }

  /**
   * 일일 리셋 (매일 지정된 시간)
   */
  private static getNextDailyReset(now: Date, hour: number, minute: number): Date {
    const todayReset = new Date(now);
    todayReset.setHours(hour, minute, 0, 0);
    
    // 오늘 리셋 시간이 아직 안지났으면 오늘로
    if (now < todayReset) {
      return todayReset;
    }
    
    // 내일로 설정
    const tomorrow = new Date(todayReset);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }

  /**
   * 주간 리셋 (특정 요일 지정된 시간)
   */
  private static getNextWeeklyReset(now: Date, targetDay: WeekDay, hour: number, minute: number): Date {
    const currentDay = now.getDay();
    const daysUntilReset = (targetDay - currentDay + 7) % 7;
    
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + daysUntilReset);
    nextReset.setHours(hour, minute, 0, 0);
    
    // 오늘이 리셋 요일이고 아직 리셋 시간이 안지났으면
    if (daysUntilReset === 0 && now < nextReset) {
      return nextReset;
    }
    
    // 다음주로 이동
    if (daysUntilReset === 0) {
      nextReset.setDate(nextReset.getDate() + 7);
    }
    
    return nextReset;
  }

  /**
   * 진행상황이 리셋되어야 하는지 확인
   */
  static shouldResetProgress(progress: CoopProgress, resetConfig: ResetConfig): boolean {
    if (!progress.isCompleted) return false;
    
    const completedTime = new Date(progress.completedAt);
    const lastResetTime = this.getLastResetTime(resetConfig);
    
    return completedTime < lastResetTime;
  }

  /**
   * 마지막 리셋 시간 계산
   */
  private static getLastResetTime(resetConfig: ResetConfig): Date {
    const now = new Date();
    
    switch (resetConfig.type) {
      case ResetType.HOURLY:
      case ResetType.CUSTOM:
        return new Date(now.getTime() - (resetConfig.interval!));
        
      case ResetType.DAILY:
        const todayReset = new Date(now);
        todayReset.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        
        if (now >= todayReset) {
          return todayReset;
        } else {
          const yesterday = new Date(todayReset);
          yesterday.setDate(yesterday.getDate() - 1);
          return yesterday;
        }
        
      case ResetType.WEEKLY:
        const currentDay = now.getDay();
        const targetDay = resetConfig.resetDay ?? WeekDay.WEDNESDAY;
        
        let daysSinceReset = (currentDay - targetDay + 7) % 7;
        
        const thisWeekReset = new Date(now);
        thisWeekReset.setDate(thisWeekReset.getDate() - daysSinceReset);
        thisWeekReset.setHours(resetConfig.resetHour ?? 0, resetConfig.resetMinute ?? 0, 0, 0);
        
        if (now < thisWeekReset) {
          const lastWeekReset = new Date(thisWeekReset);
          lastWeekReset.setDate(lastWeekReset.getDate() - 7);
          return lastWeekReset;
        }
        
        return thisWeekReset;
        
      default:
        return new Date(0);
    }
  }

  /**
   * 남은 시간을 사람이 읽기 쉬운 형태로 포맷
   */
  static formatTimeLeft(timeLeft: number): string {
    if (timeLeft <= 0) return "초기화됨";
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}일 ${remainingHours}시간`;
    }
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    
    return `${minutes}분`;
  }

  /**
   * 완료 시간을 사람이 읽기 쉬운 형태로 포맷
   */
  static formatCompletedTime(completedAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - completedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      return completedAt.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    if (diffHours > 0) {
      return `${diffHours}시간 전`;
    }
    
    if (diffMinutes > 0) {
      return `${diffMinutes}분 전`;
    }
    
    return "방금 전";
  }
}