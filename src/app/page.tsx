import React, { Suspense } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import HeroSearch from '@/components/hero-search';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <HeroSearch />
        
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <div className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Featured Cruises</h2>
              <div className="text-center">Coming soon...</div>
            </div>
          </div>
        </Suspense>
      </main>
      
      <Footer />
    </div>
  );
}