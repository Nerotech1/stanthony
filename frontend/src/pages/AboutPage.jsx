import React, { useState, useEffect } from 'react';
import { BookOpen, Heart, Users } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { api } from '../lib/api';

const AboutPage = () => {
  const [pageContent, setPageContent] = useState(null);
  const [clergy, setClergy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, clergyRes] = await Promise.all([
          api.getPage('about').catch(() => ({ data: null })),
          api.getClergy()
        ]);
        setPageContent(pageRes.data);
        setClergy(clergyRes.data);
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

  return (
    <div className="grain-overlay" data-testid="about-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1721884257519-31a3d7c2d825"
            alt="Church" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Learn About Us</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">About Our Parish</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            A community of faith rooted in tradition and committed to serving God and neighbor.
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {pageContent?.content ? (
              <div 
                className="prose prose-lg max-w-none font-dm-sans prose-headings:font-playfair prose-headings:text-church-red prose-p:text-stone-warm-800 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: pageContent.content }}
              />
            ) : (
              <div className="space-y-12">
                {/* History */}
                <div className="animate-fade-in">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <BookOpen className="text-church-red" size={28} />
                    </div>
                    <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-church-red">Our History</h2>
                  </div>
                  <p className="font-dm-sans text-stone-warm-800 leading-relaxed">
                    St. Anthony Catholic Church was established in 1985 to serve the growing Catholic community in AIT Alagbado, 
                    Lagos State. What began as a small mission with just a handful of faithful has grown into a vibrant parish 
                    community of over 2,000 families. Through the years, we have built not just a church, but a home where 
                    generations have celebrated the sacraments, grown in faith, and found community.
                  </p>
                </div>

                {/* Mission */}
                <div className="animate-fade-in animate-delay-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <Heart className="text-church-red" size={28} />
                    </div>
                    <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-church-red">Our Mission</h2>
                  </div>
                  <p className="font-dm-sans text-stone-warm-800 leading-relaxed">
                    We are committed to spreading the Gospel of Jesus Christ, celebrating the Sacraments, and serving our 
                    community with love and compassion. Our parish is a welcoming home for all who seek to grow in faith, 
                    find healing in Christ's mercy, and serve others in His name. We strive to be a beacon of hope and a 
                    sanctuary of peace in our neighborhood.
                  </p>
                </div>

                {/* Beliefs */}
                <div className="animate-fade-in animate-delay-400">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-church-red/10 rounded-lg">
                      <Users className="text-church-red" size={28} />
                    </div>
                    <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-church-red">Our Beliefs</h2>
                  </div>
                  <p className="font-dm-sans text-stone-warm-800 leading-relaxed">
                    As a Roman Catholic parish, we hold fast to the teachings of the Church, guided by Sacred Scripture and 
                    Sacred Tradition. We believe in the Real Presence of Christ in the Eucharist, the intercession of the 
                    Blessed Virgin Mary and the Saints, and the authority of the Pope and Magisterium. Our faith is expressed 
                    through worship, prayer, and charitable works.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Clergy Section */}
      {clergy.length > 0 && (
        <section className="py-16 md:py-24 bg-stone-warm-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-church-gold font-cormorant italic text-lg mb-2">Meet Our</p>
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-church-red">Clergy & Staff</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {clergy.map((person, index) => (
                <Card 
                  key={person.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {person.image_url ? (
                    <div className="h-64 overflow-hidden">
                      <img 
                        src={person.image_url} 
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-stone-warm-200 flex items-center justify-center">
                      <Users size={64} className="text-stone-warm-400" />
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <h3 className="font-playfair font-semibold text-xl text-stone-warm-800">{person.name}</h3>
                    <p className="text-church-gold font-dm-sans font-medium text-sm mt-1">{person.title}</p>
                    <p className="text-sm text-muted-foreground font-dm-sans mt-4 line-clamp-3">{person.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AboutPage;
