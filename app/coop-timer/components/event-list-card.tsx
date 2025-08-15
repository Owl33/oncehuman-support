"use client";

import { CoopEvent, CoopProgress } from "@/types/coop-timer";
import { BaseCharacter } from "@/types/character";
import { Card } from "@/components/base/card";
import { EventItem } from "./event-item";
import { Trophy, Server } from "lucide-react";

interface EventListCardProps {
  character: BaseCharacter;
  events: CoopEvent[];
  progress: Record<string, CoopProgress>; // 추가
  onEventToggle: (eventId: string, completed: boolean) => void;
  getEventStatus: (characterId: string, eventId: string) => any;
  title?: string; // 선택적 title prop 추가
}

export function EventListCard({
  character,
  events,
  progress,
  onEventToggle,
  getEventStatus,
  title = "협동 이벤트", // 기본값 설정
}: EventListCardProps) {
  const completedCount = events.filter(e => 
    getEventStatus(character.id, e.id).completed
  ).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-green-100 rounded-xl">
            <Trophy className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-800">
              {character.name}의 {title}
            </h3>
            <p className="text-sm text-gray-600 flex items-center space-x-1">
              <Server className="h-4 w-4" />
              <span>{character.server}</span>
              <span>•</span>
              <span>{character.job}</span>
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {completedCount}/{events.length} 완료
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {events.map((event, index) => {
          const progressKey = `${character.id}-${event.id}`;
          return (
            <EventItem
              key={event.id}
              event={event}
              status={getEventStatus(character.id, event.id)}
              progress={progress[progressKey]}
              onToggle={(completed) => onEventToggle(event.id, completed)}
              animationDelay={index * 50}
            />
          );
        })}
      </div>
    </Card>
  );
}