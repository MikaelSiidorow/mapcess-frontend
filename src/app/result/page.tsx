import { Search } from "@/components/search-form";
import { cn } from "@/lib/utils";
import { AccessibilityIcon, StarIcon } from "lucide-react";
import { getRoutes } from "@/api/routeService";
import dynamic from "next/dynamic";
const MainMap = dynamic(() => import("@/components/main-map"), { ssr: false });

type Result = Awaited<ReturnType<typeof getRoutes>>[number];

export default async function SearchResults({
  searchParams: { location, currentLng, currentLat, id },
}: {
  searchParams: {
    location?: string;
    currentLng?: string;
    currentLat?: string;
    id?: string;
  };
}) {
  if (!location || !id || !currentLng || !currentLat) {
    return null;
  }

  const results = await getRoutes(`${currentLat},${currentLng}`, location);
  const highestScore = Math.max(
    ...results.map((result) => result.accessibilityScore),
  );
  // const result = results?.length && results.find((result) => result.id === id)!;
  const result = results?.length && results[0]!;

  if (!result) {
    return null;
  }

  return (
    <main className="container flex min-h-screen flex-col items-center gap-4 p-4">
      <Search className="z-10" location={location} backButton />
      <div className="relative z-10 flex w-full gap-2 rounded-md border bg-background/80 p-4 ring ring-muted-foreground">
        {result?.accessibilityScore === highestScore && (
          <div className="absolute -right-2 -top-2 flex h-fit w-fit items-center justify-center rounded-full bg-muted p-2">
            <StarIcon className="h-6 w-6  text-yellow-500" />
          </div>
        )}
        <div className="flex flex-col">
          <span
            className={cn(
              result?.accessibilityScore <= 3.5 && "text-yellow-500",
              result?.accessibilityScore <= 2.5 && "text-red-500",
            )}
          >
            {result?.accessibilityScore} accessibility
          </span>
          <span className="text-muted-foreground">
            {result?.timeMinutes} minutes
          </span>
          <span className="text-muted-foreground">
            {result?.wheelchairAccessible && (
              <AccessibilityIcon className="h-4 w-4" />
            )}
          </span>
        </div>
      </div>

      <MainMap
        startLocation={result.polyline?.at(0)!.at(0)!}
        endLocation={result?.polyline?.at(-1)!.at(-1)!}
        polyline={result?.polyline}
      />
    </main>
  );
}
