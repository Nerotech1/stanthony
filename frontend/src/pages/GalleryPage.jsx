import React, { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { api } from '../lib/api';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [imagesRes, categoriesRes] = await Promise.all([
          api.getGallery(),
          api.getGalleryCategories()
        ]);
        setImages(imagesRes.data);
        setCategories(categoriesRes.data);
      } catch (e) {
        console.error('Error fetching gallery:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredImages = selectedCategory
    ? images.filter(img => img.category === selectedCategory)
    : images;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-church-red border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="grain-overlay" data-testid="gallery-page">
      {/* Hero */}
      <section className="relative py-24 bg-stone-warm-900">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1772915022580-01ac48b622a2"
            alt="Stained glass" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <p className="text-church-gold font-cormorant italic text-lg mb-2">Visual Journey</p>
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-white mb-4">Parish Gallery</h1>
          <p className="font-dm-sans text-stone-warm-200 max-w-2xl mx-auto">
            Explore the beauty of our parish through photos of our church, events, and community.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      {categories.length > 0 && (
        <section className="py-8 bg-white border-b border-stone-warm-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              <Button 
                variant={selectedCategory === null ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? 'bg-church-red hover:bg-church-red-dark' : 'border-church-gold text-church-red hover:bg-church-gold/10'}
                data-testid="gallery-all-btn"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button 
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'bg-church-red hover:bg-church-red-dark' : 'border-church-gold text-church-red hover:bg-church-gold/10'}
                  data-testid={`gallery-category-${category}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
          data-testid="gallery-lightbox"
        >
          <button 
            className="absolute top-4 right-4 text-white hover:text-church-gold transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X size={32} />
          </button>
          <div className="max-w-6xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <img 
              src={selectedImage.image_url} 
              alt={selectedImage.title}
              className="max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-center">
              <h3 className="font-playfair text-xl text-white">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-stone-warm-400 font-dm-sans mt-2">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid - Masonry Style */}
      <section className="py-16 md:py-24 bg-stone-warm-50">
        <div className="container mx-auto px-4">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-dm-sans">No images in the gallery yet. Check back soon!</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {filteredImages.map((image, index) => (
                <div 
                  key={image.id}
                  className="break-inside-avoid group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedImage(image)}
                  data-testid={`gallery-image-${index}`}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <img 
                      src={image.image_url} 
                      alt={image.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-playfair text-white font-semibold">{image.title}</h3>
                        <span className="text-xs text-church-gold font-dm-sans">{image.category}</span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <ZoomIn className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
