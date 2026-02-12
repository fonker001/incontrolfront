// hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/lib/api/productApi'; // Import productApi
import { cartApi } from '@/lib/api/sales'; // Import cartApi if needed

{/*
  
  useProducts hook returns a query object for fetching product data.
  It uses productApi.list to fetch the list of products.
  */}
  

export const useProducts = () => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: productApi.list, // Now productApi is defined
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    // Note: Your cartApi.addToCart expects (inventoryId, quantity) not just productId
    mutationFn: (productId: string) => cartApi.addToCart(Number(productId), 1),
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // Snapshot previous value
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistically update
      queryClient.setQueryData(['cart'], (old: any) => {
        const oldCart = old || { items: [] };
        return { 
          ...oldCart, 
          items: [...oldCart.items, { 
            productId, 
            quantity: 1,
            // Add other required fields if needed
          }] 
        };
      });
      
      return { previousCart };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch cart data after mutation
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};