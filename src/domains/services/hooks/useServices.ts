
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Service, ServiceFormValues } from "../types";

export function useServices() {
  const queryClient = useQueryClient();
  
  const getServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Transform the data to include is_active property for compatibility
    const services = data.map(service => ({
      ...service,
      is_active: true // Default all services to active for backward compatibility
    }));
    
    return services as Service[];
  };

  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  const createService = async (serviceData: ServiceFormValues) => {
    const { is_active, ...serviceDbData } = serviceData;
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        name: serviceDbData.name,
        description: serviceDbData.description || null,
        price: serviceDbData.price,
        duration: serviceDbData.duration,
        type: serviceDbData.type,
        icon: serviceDbData.icon || null
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Add is_active field for frontend compatibility
    return { ...data, is_active: true } as Service;
  };

  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      toast.error(`Error creating service: ${error.message}`);
    }
  });

  const updateService = async (serviceData: ServiceFormValues & { id: string }) => {
    const { id, is_active, ...data } = serviceData;
    
    const { data: updatedService, error } = await supabase
      .from('services')
      .update({
        name: data.name,
        description: data.description || null,
        price: data.price,
        duration: data.duration,
        type: data.type,
        icon: data.icon || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Add is_active field for frontend compatibility
    return { ...updatedService, is_active: true } as Service;
  };

  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success("Service updated successfully");
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      toast.error(`Error updating service: ${error.message}`);
    }
  });

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(error.message);
    }
  };

  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success("Service deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: any) => {
      toast.error(`Error deleting service: ${error.message}`);
    }
  });

  return {
    services,
    isLoading,
    error,
    createService: createServiceMutation.mutate,
    updateService: updateServiceMutation.mutate,
    deleteService: deleteServiceMutation.mutate,
    isCreating: createServiceMutation.isPending,
    isUpdating: updateServiceMutation.isPending,
    isDeleting: deleteServiceMutation.isPending,
  };
}
