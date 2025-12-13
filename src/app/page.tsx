import Link from "next/link";
import AskButton from "@/components/askButton";
import { CATEGORIES } from "@/data/filter";
import { QUESTIONS } from "@/data/question";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero 영역 */}
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Welcome to Korea Travel Q&amp;A
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-primary-lighter sm:text-base">
            Connect with local Korean experts who speak your language. Get
            authentic travel advice, cultural insights, and practical tips for
            your journey.
          </p>
          <Link
            href="/questions/new"
            className="mt-8 rounded-full bg-white px-6 py-2 text-sm font-semibold text-primary shadow-sm transition cursor-pointer"
          >
            Ask Your First Question
          </Link>
        </div>
      </section>

      {/* 검색 바 */}
      <section className="-mt-7">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-md md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search questions about Korea..."
                className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none
                focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <button className="flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary-hover cursor-pointer">
              🔍
            </button>

            <select className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary md:w-52">
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Recent Questions */}
      <section className="mx-auto mt-10 max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Questions
          </h2>
          <AskButton />
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <article
              key={q.id}
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {q.title}
                </h3>
                <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
                  {q.category}
                </span>
              </div>

              <p className="mb-4 text-sm text-gray-600">{q.excerpt}</p>

              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* 작성자 */}
                <div className="flex items-center gap-3">
                  <img
                    src={q.authorAvatar}
                    alt={q.authorName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-foreground">
                      {q.authorName}
                    </span>
                    <span className="text-xs text-gray-500">{q.createdAt}</span>
                  </div>
                </div>

                {/* 통계 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>👁</span>
                    <span>{q.views}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>💬</span>
                    <span>{q.replies}</span>
                  </div>
                  <button className="rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
