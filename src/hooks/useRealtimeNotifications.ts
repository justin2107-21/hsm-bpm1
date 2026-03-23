import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/contexts/NotificationContext';

export const useRealtimeNotifications = (userId: string | undefined) => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to service requests changes
    const serviceRequestsSubscription = supabase
      .channel(`service_requests_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { old, new: updated } = payload;
          
          // Check if status changed
          if (old.status !== updated.status) {
            const title = updated.title || 'Service Request';
            const message = `${title} status updated to "${updated.status}"`;
            addNotification(message, `Updated on ${new Date().toLocaleTimeString()}`, 'info');
            toast.info(message);
          }
        }
      )
      .subscribe();

    // Subscribe to vaccinations changes
    const vaccinationsSubscription = supabase
      .channel(`vaccinations_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vaccinations',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { old, new: updated } = payload;
          
          // Check if status changed
          if (old.status !== updated.status) {
            const message = `${updated.vaccine} vaccination status updated to "${updated.status}"`;
            addNotification(message, `${updated.child_name} • ${new Date().toLocaleTimeString()}`, 'info');
            toast.info(message);
          }
        }
      )
      .subscribe();

    // Subscribe to establishments changes
    const establishmentsSubscription = supabase
      .channel(`establishments_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'establishments',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { old, new: updated } = payload;
          
          // Check if status changed
          if (old.status !== updated.status) {
            const message = `${updated.business_name} status updated to "${updated.status}"`;
            addNotification(message, `Updated on ${new Date().toLocaleTimeString()}`, 'info');
            toast.info(message);
          }
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(serviceRequestsSubscription);
      supabase.removeChannel(vaccinationsSubscription);
      supabase.removeChannel(establishmentsSubscription);
    };
  }, [userId, addNotification]);
};
