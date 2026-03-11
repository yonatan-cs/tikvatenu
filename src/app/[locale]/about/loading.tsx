export default function AboutLoading() {
  return (
    <div>
      {/* Hero skeleton */}
      <div className="bg-navy/10 py-24 animate-pulse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-12 w-64 bg-navy/10 rounded-lg mb-4" />
          <div className="h-6 w-96 bg-navy/5 rounded" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-navy/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-navy/5 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-navy/5 rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 bg-navy/10 rounded animate-pulse" />
            <div className="h-4 w-full bg-navy/5 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-navy/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
