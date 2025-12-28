import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export function AnswerLoading() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          {/* Header: author + date + upvote */}
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-gray-200" />
                  <div className="h-3 w-48 rounded bg-gray-200" />
                </div>
              </div>

              <div className="h-6 w-16 rounded-full bg-gray-200" />
            </div>
          </CardHeader>

          {/* Title + content */}
          <CardContent className="space-y-3">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-11/12 rounded bg-gray-200" />
              <div className="h-3 w-10/12 rounded bg-gray-200" />
            </div>
          </CardContent>

          {/* Footer: optional actions placeholder */}
          <CardFooter className="flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-gray-200" />
            <div className="flex gap-2">
              <div className="h-8 w-20 rounded-full bg-gray-200" />
              <div className="h-8 w-20 rounded-full bg-gray-200" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
