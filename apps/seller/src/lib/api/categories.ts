import { CategoryAPI } from "@repo/shared-axios";
import { CategoryFormDTO } from "@repo/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CategoryFormDTO) => {
      const response = await CategoryAPI.createCategory(data);
      return response;
    },
    onSuccess: () => {
      // Handle success (e.g., show a toast, invalidate queries, etc.)
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  })
};

export const useGetCategories = (params?: { page?: number; limit?: number; q?: string; sort?: string, select?: string }) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: async () => {
      const response = await CategoryAPI.getCategories(params);
      return response;
    },
  })
};

export const useGetCategory = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await CategoryAPI.getCategoryById(id);
      return response;
    }
  });
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: CategoryFormDTO }) => {
      const response = await CategoryAPI.updateCategory(id, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", "category"] });
    },
  })
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await CategoryAPI.deleteCategory(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", "category"] });
    },
  })
}
