import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Cpu, 
  Database, 
  MessageSquare, 
  Code, 
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';

interface SystemStats {
  requests_today: number;
  active_models: number;
  total_plugins: number;
  uptime: string;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
}

interface RecentActivity {
  id: string;
  type: 'chat' | 'embedding' | 'code' | 'plugin';
  timestamp: string;
  status: 'success' | 'error';
  details: string;
}

export function Dashboard() {
  const [stats, setStats] = useState<SystemStats>({
    requests_today: 0,
    active_models: 0,
    total_plugins: 0,
    uptime: '0h 0m',
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStats({
        requests_today: 1247,
        active_models: 3,
        total_plugins: 8,
        uptime: '2d 14h 32m',
        cpu_usage: 45,
        memory_usage: 62,
        disk_usage: 78
      });

      setActivities([
        {
          id: '1',
          type: 'chat',
          timestamp: '2 minutes ago',
          status: 'success',
          details: 'Chat completion with mistral:latest'
        },
        {
          id: '2',
          type: 'embedding',
          timestamp: '5 minutes ago',
          status: 'success',
          details: 'Generated embeddings for 3 documents'
        },
        {
          id: '3',
          type: 'code',
          timestamp: '8 minutes ago',
          status: 'success',
          details: 'Executed Python code successfully'
        },
        {
          id: '4',
          type: 'plugin',
          timestamp: '12 minutes ago',
          status: 'error',
          details: 'Weather plugin timeout'
        }
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Requests Today',
      value: stats.requests_today.toLocaleString(),
      icon: Activity,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'Active Models',
      value: stats.active_models.toString(),
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      change: '+1'
    },
    {
      title: 'Total Plugins',
      value: stats.total_plugins.toString(),
      icon: Database,
      color: 'from-green-500 to-emerald-500',
      change: '+2'
    },
    {
      title: 'Uptime',
      value: stats.uptime,
      icon: Clock,
      color: 'from-orange-500 to-red-500',
      change: '99.9%'
    }
  ];

  const resourceMetrics = [
    { name: 'CPU Usage', value: stats.cpu_usage, color: 'bg-blue-500' },
    { name: 'Memory Usage', value: stats.memory_usage, color: 'bg-purple-500' },
    { name: 'Disk Usage', value: stats.disk_usage, color: 'bg-green-500' }
  ];

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Monitor your LocalAI+ instance performance and activity</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Resources */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              System Resources
            </h3>
            <div className="space-y-6">
              {resourceMetrics.map((metric) => (
                <div key={metric.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">{metric.name}</span>
                    <span className="text-white font-semibold">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${metric.color} transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </h3>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {activity.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{activity.details}</p>
                    <p className="text-gray-400 text-xs">{activity.timestamp}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'chat' ? 'bg-blue-400' :
                    activity.type === 'embedding' ? 'bg-purple-400' :
                    activity.type === 'code' ? 'bg-green-400' : 'bg-orange-400'
                  }`}></div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;