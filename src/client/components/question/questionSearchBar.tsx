"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function QuestionSearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex w-full items-center gap-2 md:flex-1">
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-full"
      />
      <Button className="rounded-full px-4">🔍</Button>
    </div>
  );
}
