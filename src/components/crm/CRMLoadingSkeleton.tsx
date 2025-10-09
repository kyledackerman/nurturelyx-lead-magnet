import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Phase 3.4: Standardize loading states

export function CRMTableSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function CRMMetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CRMChartSkeleton() {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-48 mb-4" />
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-[250px] w-full" />
    </Card>
  );
}

export function CRMDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
