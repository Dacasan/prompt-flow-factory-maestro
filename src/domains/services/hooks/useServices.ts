
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Service, ServiceType } from "@/domains/services/types";

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
    
    return data as Service[];
  };
  
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });
  
  const createService = async (serviceData: {
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: ServiceType;
    icon?: string;
    is_active: boolean;
  }) => {
    const { data, error } = await supabase
      .from('services')
      .insert(serviceData)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Service;
  };
  
  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
      toast.error(`Error creating service: ${error.message}`);
    }
  });
  
  const updateService = async (serviceData: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    type: ServiceType;
    icon?: string;
    is_active: boolean;
  }) => {
    const { id, ...rest } = serviceData;
    
    const { data, error } = await supabase
      .from('services')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data as Service;
  };
  
  const updateServiceMutation = useMutation({
    mutationFn: updateService,
    onSuccess: () => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
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
    
    return { id };
  };
  
  const deleteServiceMutation = useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (error: Error) => {
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
