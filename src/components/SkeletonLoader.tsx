import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" aria-label="Loading dashboard content">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-44 rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card p-5 h-36 flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 h-72 flex flex-col justify-between">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="clay-card-dark p-6 h-72 flex flex-col justify-between">
          <Skeleton className="h-5 w-32 mb-2 opacity-30" />
          <Skeleton className="h-12 w-full rounded-xl opacity-30" />
          <Skeleton className="h-10 w-full rounded-xl opacity-30" />
        </div>
      </div>
    </div>
  );
};


