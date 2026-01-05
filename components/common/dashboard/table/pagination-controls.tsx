"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PaginationMeta = {
  page: number;
  totalPages: number;
};

export function PaginationControls({
  pagination,
}: {
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = pagination.page;

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Previous
      </Button>

      <span className="text-sm">
        Page <strong>{currentPage}</strong> of {pagination.totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= pagination.totalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}
