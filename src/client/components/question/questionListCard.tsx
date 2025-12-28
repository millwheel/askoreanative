import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, MessageCircle } from "lucide-react";
import { QuestionSummaryResponse } from "@/type/question";

export function QuestionListCard({ q }: { q: QuestionSummaryResponse }) {
  return (
    <Link href={`/questions/${q.id}`} className="block">
      <Card className="transition hover:shadow-md">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-base hover:underline">
              {q.title}
            </CardTitle>

            <div className="flex flex-wrap gap-2">
              {q.topics?.map((t) => (
                <Badge
                  key={`${q.id}-${t.slug}`}
                  variant="secondary"
                  className="whitespace-nowrap text-xs"
                >
                  {t.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600">{q.excerpt}</p>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={q.authorAvatarUrl ?? undefined}
                alt={q.authorDisplayName}
              />
              <AvatarFallback>{q.authorDisplayName?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900">
                {q.authorDisplayName}
              </span>
              <span className="text-xs text-gray-500">{q.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Eye className="h-3.5 w-3.5" />
              <span>{q.viewCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MessageCircle className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
