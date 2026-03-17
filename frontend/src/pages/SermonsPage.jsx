import React, { useState, useEffect } from 'react';
import { Play, Calendar, User, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';

const SermonsPage = () => {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSermon, setSelectedSermon] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getSermons();
        setSermons(res.data);
      } catch (e) {
        console.error('Error fetching sermons:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getEmbedUrl = (url, type) => {
    if (type === 'youtube') {
      const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^"&?\/\s]{11})/)?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (type === 'vimeo') {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grain-overlay" data-testid="sermons-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1693854448297-29a0f9a3ac9a"
            alt="Pulpit" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Feed Your Soul</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Sermons & Homilies</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            Listen to inspiring homilies and teachings from our clergy. Let the Word of God transform your life.
          </p>
        </div>
      </section>

      {/* Video Player Modal */}
      {selectedSermon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelectedSermon(null)}>
          <div className="relative w-full max-w-4xl bg-stone-warm-900 rounded-lg overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-stone-warm-800 flex justify-between items-center">
              <h3 className="font-playfair text-lg text-white">{selectedSermon.title}</h3>
              <button onClick={() => setSelectedSermon(null)} className="text-stone-warm-400 hover:text-white">
                <span className="sr-only">Close</span>
                &times;
              </button>
            </div>
            <div className="aspect-video">
              {getEmbedUrl(selectedSermon.video_url, selectedSermon.video_type) ? (
                <iframe
                  src={getEmbedUrl(selectedSermon.video_url, selectedSermon.video_type)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={selectedSermon.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-warm-400">
                  <a href={selectedSermon.video_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-church-gold">
                    <ExternalLink size={24} />
                    Watch on external site
                  </a>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-sm text-stone-warm-400 font-dm-sans mb-4">
                <span className="flex items-center gap-1">
                  <User size={14} />
                  {selectedSermon.preacher}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(selectedSermon.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <p className="text-stone-warm-200 font-dm-sans">{selectedSermon.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sermons Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          {sermons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-dm-sans">No sermons available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sermons.map((sermon, index) => (
                <Card 
                  key={sermon.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedSermon(sermon)}
                  data-testid={`sermon-card-${index}`}
                >
                  <div className="relative h-48 bg-stone-warm-900 overflow-hidden">
                    {sermon.thumbnail_url ? (
                      <img 
                        src={sermon.thumbnail_url} 
                        alt={sermon.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-church-red to-stone-warm-900 flex items-center justify-center">
                        <Play size={48} className="text-church-gold" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-4 bg-white rounded-full">
                        <Play size={32} className="text-church-red" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-church-gold font-dm-sans mb-3">
                      <Calendar size={14} />
                      <span>{new Date(sermon.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <h3 className="font-playfair font-semibold text-xl text-stone-warm-800 mb-2 line-clamp-2">{sermon.title}</h3>
                    <p className="text-sm text-muted-foreground font-dm-sans mb-3 line-clamp-2">{sermon.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={14} />
                      <span className="font-dm-sans">{sermon.preacher}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SermonsPage;
