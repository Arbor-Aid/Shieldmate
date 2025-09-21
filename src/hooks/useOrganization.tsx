
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationByUserId, getOrganizationClients } from "@/services/organizationService";
import { useAuth } from "@/hooks/useAuth";
import { Organization, Client } from "@/types/organization";

export function useOrganization() {
  const { currentUser, loading: authLoading } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const { 
    data: orgData, 
    isLoading: queryLoading,
    refetch
  } = useQuery({
    queryKey: ['organization', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      return await getOrganizationByUserId(currentUser.uid);
    },
    enabled: !!currentUser?.uid && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (orgData) {
      setOrganization(orgData as Organization);
    }
  }, [orgData]);

  useEffect(() => {
    setLoading(authLoading || queryLoading);
  }, [authLoading, queryLoading]);

  // Fetch clients when we have an organization
  useEffect(() => {
    const fetchClients = async () => {
      if (organization?.id) {
        try {
          const clientData = await getOrganizationClients(organization.id);
          setClients(clientData);
        } catch (error) {
          console.error("Error fetching clients:", error);
          setClients([]);
        }
      }
    };

    fetchClients();
  }, [organization?.id]);

  return { 
    organization, 
    clients,
    loading,
    refetch
  };
}
