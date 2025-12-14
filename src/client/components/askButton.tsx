import Link from "next/link";

export default function AskButton() {
    return(
        <Link
            href="/questions/new"
            className="flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer"
        >
            Ask new question
        </Link>
    )
}