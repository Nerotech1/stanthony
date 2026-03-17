import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Heart, DollarSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { api } from '../lib/api';

const DonatePage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorInfo, setDonorInfo] = useState({
    name: '',
    email: '',
    message: ''
  });

  const presetAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const checkPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attempts >= maxAttempts) {
      setCheckingPayment(false);
      setPaymentStatus('timeout');
      return;
    }

    setCheckingPayment(true);
    try {
      const res = await api.getDonationStatus(sessionId);
      const { payment_status, status } = res.data;

      if (payment_status === 'paid') {
        setPaymentStatus('success');
        setCheckingPayment(false);
        toast.success('Thank you for your generous donation!');
      } else if (status === 'expired') {
        setPaymentStatus('expired');
        setCheckingPayment(false);
      } else {
        setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setCheckingPayment(false);
      setPaymentStatus('error');
    }
  };

  const handleDonate = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createDonationCheckout({
        amount: parseFloat(amount.toFixed(2)),
        donor_name: donorInfo.name,
        donor_email: donorInfo.email,
        message: donorInfo.message,
        origin_url: window.location.origin
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to process donation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Payment Status Display
  if (checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-warm-50" data-testid="donate-page-checking">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-16 w-16 animate-spin text-church-gold mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-semibold text-stone-warm-800 mb-2">Processing Your Donation</h2>
            <p className="text-muted-foreground font-dm-sans">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-warm-50" data-testid="donate-page-success">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-semibold text-stone-warm-800 mb-2">Thank You!</h2>
            <p className="text-muted-foreground font-dm-sans mb-6">
              Your generous donation has been received. May God bless you abundantly for your generosity.
            </p>
            <Button 
              onClick={() => window.location.href = '/donate'}
              className="bg-church-red hover:bg-church-red-dark font-cinzel uppercase tracking-wider"
            >
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'expired' || paymentStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-warm-50" data-testid="donate-page-error">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-semibold text-stone-warm-800 mb-2">Payment Issue</h2>
            <p className="text-muted-foreground font-dm-sans mb-6">
              {paymentStatus === 'expired' 
                ? 'Your payment session has expired. Please try again.'
                : 'There was an issue processing your payment. Please try again.'}
            </p>
            <Button 
              onClick={() => window.location.href = '/donate'}
              className="bg-church-red hover:bg-church-red-dark font-cinzel uppercase tracking-wider"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grain-overlay" data-testid="donate-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1765146567664-cf0c0d987da9"
            alt="Church" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Support Our Mission</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Make a Donation</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            Your generous contribution helps us maintain our parish, support our ministries, and serve those in need.
          </p>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
              <CardHeader className="border-b border-stone-warm-200 pb-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-3 bg-church-red/10 rounded-full">
                    <Heart className="text-church-red" size={28} />
                  </div>
                  <CardTitle className="font-playfair text-2xl text-church-red">Give Online</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {/* Amount Selection */}
                <div className="mb-8">
                  <Label className="font-dm-sans font-medium text-stone-warm-800 mb-4 block">Select Amount (USD)</Label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {presetAmounts.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={selectedAmount === amount ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedAmount(amount);
                          setCustomAmount('');
                        }}
                        className={selectedAmount === amount 
                          ? 'bg-church-red hover:bg-church-red-dark font-cinzel' 
                          : 'border-church-gold text-church-red hover:bg-church-gold/10 font-cinzel'}
                        data-testid={`donate-amount-${amount}`}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      className="pl-10 border-stone-warm-200 focus:border-church-gold"
                      min="1"
                      step="0.01"
                      data-testid="donate-custom-amount"
                    />
                  </div>
                </div>

                {/* Donor Info */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-playfair text-lg font-semibold text-stone-warm-800">Donor Information (Optional)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="donor-name" className="font-dm-sans">Name</Label>
                      <Input
                        id="donor-name"
                        value={donorInfo.name}
                        onChange={(e) => setDonorInfo({...donorInfo, name: e.target.value})}
                        placeholder="Your name"
                        className="border-stone-warm-200 focus:border-church-gold"
                        data-testid="donate-name-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="donor-email" className="font-dm-sans">Email</Label>
                      <Input
                        id="donor-email"
                        type="email"
                        value={donorInfo.email}
                        onChange={(e) => setDonorInfo({...donorInfo, email: e.target.value})}
                        placeholder="Your email"
                        className="border-stone-warm-200 focus:border-church-gold"
                        data-testid="donate-email-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donor-message" className="font-dm-sans">Message / Prayer Intention</Label>
                    <Textarea
                      id="donor-message"
                      value={donorInfo.message}
                      onChange={(e) => setDonorInfo({...donorInfo, message: e.target.value})}
                      placeholder="Leave a message or prayer intention..."
                      rows={3}
                      className="border-stone-warm-200 focus:border-church-gold resize-none"
                      data-testid="donate-message-input"
                    />
                  </div>
                </div>

                {/* Donate Button */}
                <Button
                  onClick={handleDonate}
                  disabled={loading || (!selectedAmount && !customAmount)}
                  className="w-full bg-church-red hover:bg-church-red-dark font-cinzel uppercase tracking-wider py-6 text-lg"
                  data-testid="donate-submit-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Heart size={20} />
                      Donate ${selectedAmount || customAmount || '0'}
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground font-dm-sans mt-6">
                  Secure payment powered by Stripe. Your donation is tax-deductible.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Give Section */}
      <section className="py-16 md:py-24 bg-stone-warm-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-church-gold font-cormorant italic text-lg mb-2">Your Support Matters</p>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Why Give?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-church-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⛪</span>
                </div>
                <h3 className="font-playfair font-semibold text-lg text-stone-warm-800 mb-2">Parish Operations</h3>
                <p className="text-sm text-muted-foreground font-dm-sans">
                  Support daily operations, maintenance, and utilities for our parish facilities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-church-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🤝</span>
                </div>
                <h3 className="font-playfair font-semibold text-lg text-stone-warm-800 mb-2">Community Outreach</h3>
                <p className="text-sm text-muted-foreground font-dm-sans">
                  Help us serve the poor, feed the hungry, and support those in need.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-church-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="font-playfair font-semibold text-lg text-stone-warm-800 mb-2">Faith Formation</h3>
                <p className="text-sm text-muted-foreground font-dm-sans">
                  Support religious education, youth ministry, and adult faith programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonatePage;
