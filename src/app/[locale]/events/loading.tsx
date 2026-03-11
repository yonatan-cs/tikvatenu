export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Title skeleton */}
      <div className="h-10 w-48 bg-navy/10 rounded-lg mb-8 animate-pulse" />

      {/* Section title */}
      <div className="h-6 w-36 bg-navy/5 rounded mb-6 animate-pulse" />

      {/* Event cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-branch/5">
            <div className="aspect-[16/9] bg-navy/5 animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-5 w-3/4 bg-navy/10 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-navy/5 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-navy/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
