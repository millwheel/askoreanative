import { Card, CardContent } from "@/components/ui/card";
import { QuestionSummaryResponse } from "@/type/question";
import { QuestionCard } from "./questionCard";

export function QuestionList({
  questions,
}: {
  questions: QuestionSummaryResponse[];
}) {
  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-gray-500">
          No questions found. Try a different keyword.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q) => (
        <QuestionCard key={q.id} q={q} />
      ))}
    </div>
  );
}
