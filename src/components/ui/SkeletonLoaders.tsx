import { Skeleton } from "@/components/ui/skeleton";

export function MemberCardSkeleton() {
  return (
    <div className="flex shrink-0 items-start flex-col gap-2 justify-between w-[150px] md:w-[226px]">
      {/* Image skeleton - aspect-square comme dans MemberComp */}
      <div className="relative w-full aspect-square">
        <Skeleton className="w-full h-full rounded-none" />
      </div>

      {/* Name skeleton */}
      <Skeleton className="h-[20px] md:h-[24px] w-[90%]" />

      {/* Position skeleton */}
      <Skeleton className="h-[14px] md:h-[16px] w-[70%]" />

      {/* Department skeleton */}
      <Skeleton className="h-[14px] md:h-[16px] w-[60%]" />
    </div>
  );
}

export function TeamCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[15px] bg-white shrink-0 w-[321.27px] h-[500px] overflow-hidden">
      {/* Image skeleton - exactement comme dans TeamComp */}
      <Skeleton className="w-full h-[194.87px] rounded-t-[15px] rounded-b-none" />

      {/* Content container */}
      <div className="pl-6 flex flex-col justify-between gap-8 flex-1 py-8 max-w-[321.27px]">
        <div className="flex flex-col gap-5">
          {/* Stats (users + projects) */}
          <div className="flex gap-5 w-fit">
            <div className="flex gap-2 items-center">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-6" />
            </div>
            <div className="flex gap-2 items-center">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-6" />
            </div>
          </div>

          {/* Title and description */}
          <div className="w-fit flex flex-col gap-1.5">
            <Skeleton className="h-[20px] w-[200px]" />
            <Skeleton className="h-4 w-[280px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
        </div>

        {/* Button skeleton */}
        <Skeleton className="h-[30px] w-[120px] rounded-md ml-3" />
      </div>
    </div>
  );
}

export function PublicationCardSkeleton() {
  return (
    <div className="bg-white flex flex-col justify-between  w-full h-full p-6 mb-4 hover:shadow-md transition-shadow duration-300 border-grayBorder border-1">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-24 mt-4" />
      </div>
    </div>
  );
}
