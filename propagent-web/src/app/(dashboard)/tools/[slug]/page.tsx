'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getToolBySlug } from '@/lib/toolsCatalog';
import { cn } from '@/lib/utils';

export default function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  const Icon = tool.icon;

  return (
    <div className="min-h-screen bg-white text-charcoal-900 p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-3 text-sm text-charcoal-500">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1 hover:text-charcoal-900"
        >
          <ArrowLeft className="w-4 h-4" />
          All AI Tools
        </Link>
      </div>

      <div className="mb-8 flex items-start gap-4">
        <div
          className={cn(
            'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shrink-0 shadow-md',
            tool.accent
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
            {tool.category}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-charcoal-900 mt-1">
            {tool.title}
          </h1>
          <p className="text-charcoal-500 mt-2 max-w-3xl">{tool.description}</p>
        </div>
      </div>

      <div>{tool.render()}</div>
    </div>
  );
}
