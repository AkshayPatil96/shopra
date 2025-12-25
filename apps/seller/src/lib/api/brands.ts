import { BrandApi } from "@repo/shared-axios";
import { CreateBrandDTO } from "@repo/shared-types/brand.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCreateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBrandDTO) => {
      const response = await BrandApi.createBrand(data);
      return response;
    },
    onSuccess: () => {
      // Handle success (e.g., show a toast, invalidate queries, etc.)
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
    },
  });
};

export const useGetBrands = (params: any) => {
  return useQuery({
    queryKey: ["brands", params],
    queryFn: async () => {
      const response = await BrandApi.getBrands(params);
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetBrandById = (id: string) => {
  return useQuery({
    queryKey: ["brand", id],
    queryFn: async () => {
      const response = await BrandApi.getBrandById(id);
      return response;
    }
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CreateBrandDTO;
    }) => {
      const response = await BrandApi.updateBrand(id, data);
      return response;
    },
    onSuccess: (_data, variables) => {
      // Handle success (e.g., show a toast, invalidate queries, etc.)
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
      queryClient.invalidateQueries({
        queryKey: ["brand", variables.id],
      });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await BrandApi.deleteBrand(brandId);
      return response;
    },
    onSuccess: (data, brandId) => {
      // Handle success (e.g., show a toast, invalidate queries, etc.)
      queryClient.invalidateQueries({
        queryKey: ["brands"],
      });
      queryClient.invalidateQueries({
        queryKey: ["brand", brandId],
      });
    }
  });
};


