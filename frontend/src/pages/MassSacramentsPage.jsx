import React, { useState, useEffect } from 'react';
import { Clock, Droplets, Heart, Baby, Church, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { api } from '../lib/api';

const MassSacramentsPage = () => {
  const [settings, setSettings] = useState(null);
  const [pageContent, setPageContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, pageRes] = await Promise.all([
          api.getSettings(),
          api.getPage('sacraments').catch(() => ({ data: null }))
        ]);
        setSettings(settingsRes.data);
        setPageContent(pageRes.data);
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  const sacraments = [
    {
      icon: Church,
      title: 'Holy Mass',
      description: 'The Holy Sacrifice of the Mass is the source and summit of our faith. We celebrate Mass daily, with special solemnity on Sundays and Holy Days of Obligation.'
    },
    {
      icon: Heart,
      title: 'Confession',
      description: 'The Sacrament of Reconciliation is available on Saturdays from 5:00 PM to 6:00 PM, and by appointment. Prepare your heart to receive God\'s mercy.'
    },
    {
      icon: Baby,
      title: 'Baptism',
      description: 'Baptisms are celebrated on the first Sunday of each month after the 10:00 AM Mass. Parents must attend a preparation class. Contact the parish office to register.'
    },
    {
      icon: Users,
      title: 'Marriage',
      description: 'Couples planning to marry should contact the parish at least six months in advance. Pre-marriage preparation is required.'
    },
    {
      icon: Droplets,
      title: 'Anointing of the Sick',
      description: 'For the seriously ill or elderly, please contact the parish office to arrange for a priest visit and anointing.'
    }
  ];

  return (
    <div className="grain-overlay" data-testid="mass-sacraments-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1773372546055-cb3f09995376"
            alt="Mass" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Encounter Christ</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Mass & Sacraments</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            The seven sacraments are the means by which we receive God's grace and grow in holiness.
          </p>
        </div>
      </section>

      {/* Mass Times */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-church-gold font-cormorant italic text-lg mb-2">Join Us in Prayer</p>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Mass Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
            {(settings?.mass_times || []).map((mass, index) => (
              <Card 
                key={index}
                className="bg-stone-warm-50 border-l-4 border-church-red hover:shadow-lg transition-shadow duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="text-church-gold flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-playfair font-semibold text-lg text-stone-warm-800">{mass.day}</h3>
                      <p className="text-2xl font-cinzel font-bold text-church-red mt-1">{mass.time}</p>
                      {mass.type && <p className="text-sm text-muted-foreground font-dm-sans mt-1">{mass.type}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Confession Times */}
          {(settings?.confession_times || []).length > 0 && (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-church-red/5 border-church-red/20">
                <CardHeader>
                  <CardTitle className="font-cinzel text-xl text-church-red flex items-center gap-3">
                    <Heart size={24} className="text-church-gold" />
                    Confession Times
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings.confession_times.map((conf, index) => (
                      <div key={index} className="flex justify-between items-center font-dm-sans">
                        <span className="text-stone-warm-800">{conf.day}</span>
                        <span className="text-church-red font-medium">{conf.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Sacraments */}
      <section className="py-16 md:py-24 bg-stone-warm-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-church-gold font-cormorant italic text-lg mb-2">Channels of Grace</p>
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">The Sacraments</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {sacraments.map((sacrament, index) => (
              <Card 
                key={index}
                className="bg-white hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="p-4 bg-church-red/10 rounded-xl">
                      <sacrament.icon className="text-church-red" size={32} />
                    </div>
                    <div>
                      <h3 className="font-playfair font-semibold text-xl text-stone-warm-800 mb-3">{sacrament.title}</h3>
                      <p className="text-muted-foreground font-dm-sans leading-relaxed">{sacrament.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Content from CMS */}
      {pageContent?.content && (
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div 
              className="max-w-4xl mx-auto prose prose-lg font-dm-sans prose-headings:font-playfair prose-headings:text-church-red"
              dangerouslySetInnerHTML={{ __html: pageContent.content }}
            />
          </div>
        </section>
      )}
    </div>
  );
};

export default MassSacramentsPage;
