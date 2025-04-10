import { QUERY_STACK_PAGES } from "@/lib/api/graphql/queries";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

export const useStacksPagination = (domain: string, stackName: string) => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { data } = useQuery(QUERY_STACK_PAGES, {
    variables: {
      className: "Link",
      domain,
      stackName,
    },
  });

  useEffect(() => {
    if (data) {
      setTotalPages(data.pages.total_pages);
    }
  }, [data]);

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const isLoadMoreAvailable = totalPages > 1 && page < totalPages;

  return { page, isLoadMoreAvailable, setPage: changePage };
};
