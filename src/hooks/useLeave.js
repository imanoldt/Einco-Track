import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const useLeave = (employeeId) => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employeeId) {
      fetchLeaveRequests();
    }
  }, [employeeId]);

  const fetchLeaveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Error fetching leave requests');
    } finally {
      setLoading(false);
    }
  };

  const createLeaveRequest = async (request) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert([request])
        .select()
        .single();

      if (error) throw error;
      setLeaveRequests(prev => [data, ...prev]);
      toast.success('Leave request submitted successfully');
      return data;
    } catch (error) {
      console.error('Error creating leave request:', error);
      toast.error('Error submitting leave request');
      throw error;
    }
  };

  const updateLeaveRequest = async (id, status, approvedBy) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ status, approved_by: approvedBy })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setLeaveRequests(prev => prev.map(req => req.id === id ? data : req));
      toast.success('Leave request updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Error updating leave request');
      throw error;
    }
  };

  return {
    leaveRequests,
    loading,
    createLeaveRequest,
    updateLeaveRequest,
    refreshLeaveRequests: fetchLeaveRequests
  };
};