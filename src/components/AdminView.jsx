import React, { useState, useEffect } from 'react';
import { Users, Clock, Download, Filter, UserPlus, RefreshCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import LeaveRequestList from './LeaveRequestList';

export const AdminView = () => {
  const [stats, setStats] = useState({
    activeEmployees: 0,
    todayEntries: 0,
    absences: 0
  });
  const [timeEntries, setTimeEntries] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dailyCode, setDailyCode] = useState('');

  useEffect(() => {
    fetchStats();
    fetchTimeEntries();
    fetchLeaveRequests();
    fetchDailyCode();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Suscripción a cambios en las tablas relevantes usando Supabase Realtime
    const timeEntriesSubscription = supabase
      .channel('public:time_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_entries' }, payload => {
        console.log('Cambio en registro de tiempo:', payload);
        fetchTimeEntries();
        fetchStats();
      })
      .subscribe();

    const dailyCodeSubscription = supabase
      .channel('public:daily_codes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_codes' }, payload => {
        console.log('Cambio en código diario:', payload);
        fetchDailyCode();
      })
      .subscribe();

    return () => {
      timeEntriesSubscription.unsubscribe();
      dailyCodeSubscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      const [{ count: employeeCount }, { count: entryCount }] = await Promise.all([
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('time_entries')
          .select('*', { count: 'exact', head: true })
          .gte('timestamp', new Date().toISOString().split('T')[0])
      ]);

      setStats({
        activeEmployees: employeeCount || 0,
        todayEntries: entryCount || 0,
        absences: (employeeCount || 0) - (entryCount || 0)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Error fetching statistics');
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          employee:employees(id, name, dni)
        `)
        .gte('timestamp', new Date().toISOString().split('T')[0])
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setTimeEntries(data || []);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast.error('Error fetching time entries');
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Error fetching leave requests');
    }
  };

  const fetchDailyCode = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_codes')
        .select('code')
        .eq('date', new Date().toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setDailyCode(data?.code || '');
    } catch (error) {
      console.error('Error fetching daily code:', error);
      toast.error('Error fetching daily code');
    }
  };

  const generateNewCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error } = await supabase
        .from('daily_codes')
        .insert([{
          code,
          date: new Date().toISOString().split('T')[0],
          created_by: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;
      setDailyCode(code);
      toast.success('New code generated successfully');
    } catch (error) {
      console.error('Error generating code:', error);
      toast.error('Error generating new code');
    }
  };

  const handleLeaveRequest = async (id, status) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status,
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
      fetchLeaveRequests();
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error('Error updating leave request');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Stats Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Daily Code</h2>
              <button
                onClick={generateNewCode}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <RefreshCcw className="h-5 w-5" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-600 mb-2">
                {dailyCode || 'No code generated'}
              </div>
              <p className="text-sm text-gray-500">Valid until midnight</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Active Employees</span>
                <span className="font-semibold">{stats.activeEmployees}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Today's Entries</span>
                <span className="font-semibold">{stats.todayEntries}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span>Absences</span>
                <span className="font-semibold text-red-600">{stats.absences}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Entries Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Employee</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-left py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {timeEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{entry.employee?.name}</div>
                        <div className="text-sm text-gray-500">{entry.employee?.dni}</div>
                      </td>
                      <td className="py-3 px-4">{entry.type}</td>
                      <td className="py-3 px-4">
                        {format(new Date(entry.timestamp), 'HH:mm:ss')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Leave Requests</h2>
            <LeaveRequestList
              requests={leaveRequests}
              isAdmin={true}
              onApprove={(id) => handleLeaveRequest(id, 'APPROVED')}
              onReject={(id) => handleLeaveRequest(id, 'REJECTED')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;