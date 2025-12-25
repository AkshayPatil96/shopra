import { SellerAuthAPI } from "@repo/shared-axios"
import { useQuery } from "@tanstack/react-query"

const useSeller = () => {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["seller"],
    queryFn: SellerAuthAPI.me,
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Stop aggressive retries for auth / rate limit errors
    retry: (failureCount, error: any) => {
      const status = error?.response?.status ?? error?.status
      if (status === 401 || status === 403 || status === 429) return false
      return failureCount < 1
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  return { seller: (user as any)?.data, isLoading, isError, refetch }
}

export default useSeller