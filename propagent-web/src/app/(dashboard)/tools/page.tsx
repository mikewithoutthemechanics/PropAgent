'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { toolsCatalog } from '@/lib/toolsCatalog';
import { cn } from '@/lib/utils';

const categoryOrder: Array<string> = [
  'Valuation',
  'Finance',
  'Tenants',
  'Operations',
  'Documents',
];

export default function ToolsIndexPage() {
  const grouped = categoryOrder.map((category) => ({
    category,
    tools: toolsCatalog.filter((t) => t.category === category),
  }));

  return (
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#D8F053] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-2xl md:text-4xl font-semibold text-charcoal-900">
              AI Tools
            </h1>
          </div>
          <p className="text-charcoal-500 mt-1 max-w-2xl">
            Purpose-built assistants for every stage of a property deal — valuation, finance,
            tenants, operations and paperwork. Click any tool to open it.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-100 text-xs text-charcoal-600">
          <span className="w-2 h-2 rounded-full bg-lime-500" />
          {toolsCatalog.length} tools available
        </div>
      </div>

      <div className="space-y-10">
        {grouped.map(({ category, tools }) =>
          tools.length === 0 ? null : (
            <section key={category}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-charcoal-500 mb-4">
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link
                      key={tool.slug}
                      href={`/tools/${tool.slug}`}
                      className="group relative overflow-hidden rounded-2xl border border-charcoal-100 bg-white p-5 hover:border-charcoal-300 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-sm',
                            tool.accent
                          )}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-charcoal-900 group-hover:text-black">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-charcoal-500 mt-1 line-clamp-3">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-end text-sm font-medium text-charcoal-600 group-hover:text-black">
                        Open tool
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}
