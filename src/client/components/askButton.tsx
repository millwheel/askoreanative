import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AskButton() {
    return(
        <Button asChild className="rounded-full">
            <Link href="/questions/new">
                Ask new question
            </Link>
        </Button>
    )
}