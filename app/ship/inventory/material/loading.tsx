import { Skeleton } from "@/components/ui/skeleton"

export default function InitialStockLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-16 bg-white border-b border-gray-200">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
            <div className="flex gap-6">
              <Skeleton className="w-80 h-96" />
              <Skeleton className="flex-1 h-96" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
