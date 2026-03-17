import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, User, Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { api } from '../../lib/api';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, count: 0 });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const res = await api.getDonations();
      setDonations(res.data);
      
      const paid = res.data.filter(d => d.payment_status === 'paid');
      setStats({
        count: paid.length,
        total: paid.reduce((sum, d) => sum + (d.amount || 0), 0)
      });
    } catch (e) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500">Expired</Badge>;
      default:
        return <Badge className="bg-gray-400">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <XCircle className="text-gray-400" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-donations">
      <div className="mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-stone-warm-800">Donations</h1>
        <p className="text-muted-foreground font-dm-sans mt-1">View donation transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-dm-sans">Total Donations</p>
                <p className="text-3xl font-cinzel font-bold text-church-red">${stats.total.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-church-gold/20 rounded-lg">
                <DollarSign className="text-church-gold" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-dm-sans">Successful Donations</p>
                <p className="text-3xl font-cinzel font-bold text-church-red">{stats.count}</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <CheckCircle className="text-green-500" size={32} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations List */}
      {donations.length === 0 ? (
        <Card className="p-12 text-center">
          <DollarSign className="mx-auto text-muted-foreground mb-4" size={48} />
          <p className="text-muted-foreground font-dm-sans">No donations yet.</p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-playfair text-lg text-church-red">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donations.map((donation) => (
                <div key={donation.id} className="flex items-start justify-between p-4 bg-stone-warm-50 rounded-lg">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(donation.payment_status)}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-cinzel font-bold text-stone-warm-800">
                          ${(donation.amount || 0).toFixed(2)}
                        </span>
                        {getStatusBadge(donation.payment_status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground font-dm-sans">
                        {donation.donor_name && (
                          <div className="flex items-center gap-2">
                            <User size={14} />
                            <span>{donation.donor_name}</span>
                          </div>
                        )}
                        {donation.donor_email && (
                          <div className="flex items-center gap-2">
                            <Mail size={14} />
                            <span>{donation.donor_email}</span>
                          </div>
                        )}
                        {donation.message && (
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} />
                            <span className="line-clamp-1">{donation.message}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground font-dm-sans">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(donation.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className="text-xs">{new Date(donation.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDonations;
