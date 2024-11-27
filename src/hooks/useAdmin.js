import { useState, useEffect } from 'react';
import { pb } from '../lib/pocketbase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export const useAdmin = () => {
  const [stats, setStats] = useState({
    activeEmployees: 0,
    todayEntries: 0,
    absences: 0
  });
  const [dailyCode, setDailyCode] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [employeesResult, entriesResult] = await Promise.all([
        pb.collection('employees').getList(1, 1, {
          filter: "role = 'EMPLOYEE'",
          fields: 'id',
        }),
        pb.collection('time_entries').getList(1, 1, {
          filter: `timestamp >= "${today.toISOString()}"`,
          fields: 'id',
        })
      ]);

      setStats({
        activeEmployees: employeesResult.totalItems,
        todayEntries: entriesResult.totalItems,
        absences: employeesResult.totalItems - entriesResult.totalItems
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDailyCode = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const result = await pb.collection('daily_codes').getFirstListItem(`date = "${today}"`);
      setDailyCode(result.code);
    } catch (error) {
      console.error('Error fetching daily code:', error);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const result = await pb.collection('time_entries').getList(1, 50, {
        sort: '-timestamp',
        expand: 'employee',
        filter: `timestamp >= "${new Date().toISOString().split('T')[0]}"`,
      });
      setTimeEntries(result.items);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const generateNewCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await pb.collection('daily_codes').create({
        code,
        date: new Date().toISOString().split('T')[0],
      });
      setDailyCode(code);
      toast.success('New code generated');
    } catch (error) {
      toast.error('Error generating code');
      throw error;
    }
  };

  const validateEntry = async (entryId) => {
    try {
      await pb.collection('time_entries').update(entryId, {
        validated_by: pb.authStore.model?.id
      });
      fetchTimeEntries();
      toast.success('Entry validated');
    } catch (error) {
      toast.error('Error validating entry');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchDailyCode();
    fetchTimeEntries();

    const interval = setInterval(() => {
      fetchStats();
      fetchTimeEntries();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    dailyCode,
    timeEntries,
    generateNewCode,
    validateEntry
  };
};