import { UserAuthAPI } from "@repo/shared-axios"
import { useQuery } from "@tanstack/react-query"

const useUser = () => {
  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user"],
    queryFn: UserAuthAPI.me,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  return { user: (user as any)?.data, isLoading, isError, refetch }
}

export default useUser
