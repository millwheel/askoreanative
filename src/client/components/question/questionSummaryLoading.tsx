import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";

export function QuestionSummaryLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-5 w-14 rounded-full bg-gray-200" />
                <div className="h-5 w-20 rounded-full bg-gray-200" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </CardContent>

          <CardFooter className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
            <div className="h-3 w-10 rounded bg-gray-200" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
