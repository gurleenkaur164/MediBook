// Skeleton loader components
export const CardSkeleton = () => (
  <div className="glass-card p-5 space-y-4">
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-2xl shimmer flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 shimmer rounded w-3/4" />
        <div className="h-3 shimmer rounded w-1/2" />
        <div className="h-3 shimmer rounded w-1/3" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div className="h-9 shimmer rounded-lg" />
      <div className="h-9 shimmer rounded-lg" />
    </div>
    <div className="h-10 shimmer rounded-xl" />
  </div>
);

export const ListSkeleton = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="glass-card p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl shimmer flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 shimmer rounded w-2/3" />
          <div className="h-3 shimmer rounded w-1/2" />
        </div>
        <div className="w-20 h-6 shimmer rounded-full" />
      </div>
    ))}
  </div>
);

export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-indigo-500 border-t-transparent rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-16">
    {Icon && (
      <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-600" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    {description && <p className="text-slate-500 text-sm mb-6">{description}</p>}
    {action}
  </div>
);
