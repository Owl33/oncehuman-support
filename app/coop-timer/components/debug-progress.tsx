"use client";

import { CoopProgress } from "@/types/coop-timer";
import { Card } from "@/components/base/card";
import { Button } from "@/components/base/button";
import { Bug } from "lucide-react";
import { useState } from "react";

interface DebugProgressProps {
  progress: Record<string, CoopProgress>;
  selectedCharacterId?: string;
}

export function DebugProgress({ progress, selectedCharacterId }: DebugProgressProps) {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
        >
          <Bug className="h-4 w-4 mr-1" />
          Debug
        </Button>
      </div>
    );
  }

  const filteredProgress = selectedCharacterId 
    ? Object.entries(progress).filter(([key]) => key.startsWith(selectedCharacterId))
    : Object.entries(progress);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Bug className="h-4 w-4 text-yellow-600" />
            <h3 className="font-medium text-sm text-yellow-800">Progress Debug</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="text-yellow-600 hover:text-yellow-700 px-2 py-1 h-auto"
          >
            ✕
          </Button>
        </div>
        
        <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
          {filteredProgress.length === 0 ? (
            <p className="text-yellow-600">No progress data found</p>
          ) : (
            filteredProgress.map(([key, prog]) => (
              <div key={key} className="bg-white rounded p-2 border border-yellow-200">
                <div className="font-medium text-yellow-800">{key}</div>
                <div className="space-y-1 mt-1">
                  <div>완료: {prog.isCompleted ? "✅" : "❌"}</div>
                  <div>완료시간: {prog.completedAt > 0 ? new Date(prog.completedAt).toLocaleString() : "없음"}</div>
                  <div>이전완료: {prog.lastCompletedAt ? new Date(prog.lastCompletedAt).toLocaleString() : "없음"}</div>
                  <div>리셋시간: {prog.lastResetAt ? new Date(prog.lastResetAt).toLocaleString() : "없음"}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}