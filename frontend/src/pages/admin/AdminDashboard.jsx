import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Video, CalendarDays, Image, DollarSign, TrendingUp, Users, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { api } from '../../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getStats();
        setStats(res.data);
      } catch (e) {
        console.error('Error fetching stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Messages',
      value: stats?.messages?.total || 0,
      subtext: `${stats?.messages?.unread || 0} unread`,
      icon: MessageSquare,
      color: 'bg-blue-500',
      link: '/admin/messages'
    },
    {
      title: 'Sermons',
      value: stats?.sermons || 0,
      subtext: 'Published',
      icon: Video,
      color: 'bg-purple-500',
      link: '/admin/sermons'
    },
    {
      title: 'Events',
      value: stats?.events || 0,
      subtext: 'Scheduled',
      icon: CalendarDays,
      color: 'bg-orange-500',
      link: '/admin/events'
    },
    {
      title: 'Gallery Images',
      value: stats?.gallery || 0,
      subtext: 'Published',
      icon: Image,
      color: 'bg-green-500',
      link: '/admin/gallery'
    },
    {
      title: 'Donations',
      value: stats?.donations?.count || 0,
      subtext: `$${(stats?.donations?.total || 0).toFixed(2)} total`,
      icon: DollarSign,
      color: 'bg-church-gold',
      link: '/admin/donations'
    }
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Dashboard</h1>
        <p className="text-muted-foreground font-dm-sans mt-1">Welcome to St. Anthony Catholic Church Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} data-testid={`stat-card-${stat.title.toLowerCase().replace(' ', '-')}`}>
            <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-dm-sans">{stat.title}</p>
                    <p className="text-3xl font-cinzel font-bold text-stone-warm-800 mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-dm-sans mt-1">{stat.subtext}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="text-white" size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-lg text-church-red">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              to="/admin/sermons" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-warm-100 transition-colors"
              data-testid="quick-action-sermons"
            >
              <Video className="text-church-gold" size={20} />
              <span className="font-dm-sans">Add New Sermon</span>
            </Link>
            <Link 
              to="/admin/events" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-warm-100 transition-colors"
              data-testid="quick-action-events"
            >
              <CalendarDays className="text-church-gold" size={20} />
              <span className="font-dm-sans">Create Event</span>
            </Link>
            <Link 
              to="/admin/gallery" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-warm-100 transition-colors"
              data-testid="quick-action-gallery"
            >
              <Image className="text-church-gold" size={20} />
              <span className="font-dm-sans">Upload Gallery Images</span>
            </Link>
            <Link 
              to="/admin/announcements" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-warm-100 transition-colors"
              data-testid="quick-action-announcements"
            >
              <FileText className="text-church-gold" size={20} />
              <span className="font-dm-sans">Post Announcement</span>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-lg text-church-red">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.messages?.unread > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="text-blue-500" size={20} />
                  <span className="font-dm-sans text-sm">
                    You have <strong>{stats.messages.unread}</strong> unread messages
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 p-3 bg-stone-warm-100 rounded-lg">
                <TrendingUp className="text-church-gold" size={20} />
                <span className="font-dm-sans text-sm">
                  Total donations: <strong>${(stats?.donations?.total || 0).toFixed(2)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-warm-100 rounded-lg">
                <Users className="text-church-red" size={20} />
                <span className="font-dm-sans text-sm">
                  CMS is fully operational
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
