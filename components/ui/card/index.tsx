import { ReactNode } from "react";

import {
  Card as UiCard,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/base/card";

interface CardProps {
  title?: string;
  description?: string;
  content?: ReactNode; // CardContent 안에 들어갈 내용
  slots?: {
    action?: ReactNode;
    footer?: ReactNode;
  };
}

export const Card = ({ title, content, slots, ...props }: CardProps) => {
  return (
    <UiCard
      className="w-full max-w-sm"
      {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Enter your email below to login to your account</CardDescription>
        <CardAction>
          {
            slots?.action
            // slots?.header
          }
        </CardAction>
      </CardHeader>
      <CardContent>{content}</CardContent>
      <CardFooter className="flex-col gap-2">{slots?.footer}</CardFooter>
    </UiCard>
  );
};
