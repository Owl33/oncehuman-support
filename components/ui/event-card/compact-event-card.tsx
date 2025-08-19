"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  eventCardVariants,
  eventIconVariants,
  eventTextVariants,
  statusToggleVariants,
  completionBarVariants,
  categoryLabels
} from "./variants";
import { CompactEventCardProps } from "./types";

/**
 * 다크모드 호환 Compact Event Card
 * 
 * @example
 * ```tsx
 * <CompactEventCard
 *   variant="daily"
 *   title="일일 퀘스트"
 *   icon={Calendar}
 *   emoji="📅"
 *   completed={false}
 *   nextResetText="5시간 30분"
 *   onToggle={(completed) => console.log('Toggle:', completed)}
 * />
 * ```
 */
export function CompactEventCard({
  variant,
  title,
  icon: Icon,
  emoji,
  completed,
  nextResetText,
  onToggle,
  className
}: CompactEventCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(!completed);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!completed);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      className={cn(
        eventCardVariants({
          variant,
          state: completed ? "completed" : "pending",
          style: "compact"
        }),
        isHovered && "ring-2 ring-opacity-50",
        completed && isHovered && "ring-green-300 dark:ring-green-600/50",
        !completed && isHovered && `ring-${variant === 'hourly' ? 'green' : variant === 'daily' ? 'blue' : variant === 'weekly' ? 'purple' : 'gray'}-300 dark:ring-${variant === 'hourly' ? 'green' : variant === 'daily' ? 'blue' : variant === 'weekly' ? 'purple' : 'gray'}-600/50`,
        className
      )}
    >
      {/* Status Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggleClick}
        className={cn(statusToggleVariants({
          state: completed ? "completed" : "pending",
          size: "compact"
        }))}
      >
        {completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </motion.button>

      {/* Event Icon */}
      <div className={cn(eventIconVariants({
        variant: completed ? undefined : variant,
        state: completed ? "completed" : "pending",
        size: "compact"
      }))}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>

      {/* Event Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(eventTextVariants({
            element: "title",
            state: completed ? "completed" : "pending"
          }), "text-sm truncate")}>
            {title}
          </h4>
          {emoji && (
            <span className="text-sm flex-shrink-0">{emoji}</span>
          )}
        </div>
      </div>

      {/* Time Info */}
      <div className="flex-shrink-0 text-right">
        <div className={cn(eventTextVariants({
          element: "time",
          state: completed ? "completed" : "pending"
        }))}>
          {nextResetText}
        </div>
      </div>

      {/* Completion Indicator Stripe */}
      <div className={cn(completionBarVariants({
        visible: completed
      }))} />
    </motion.div>
  );
}