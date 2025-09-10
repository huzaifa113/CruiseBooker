import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import Header from '@/components/header';
import Footer from '@/components/footer';
import FilterSidebar from '@/components/filter-sidebar';
import CruiseCard from '@/components/cruise-card';
import ItineraryModal from '@/components/itinerary-modal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Cruise } from '@shared/schema';
import type { FilterState } from '@/lib/types';

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const [selectedCruise, setSelectedCruise] = useState<Cruise | null>(null);
  const [isItineraryModalOpen, setIsItineraryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;

  // Parse URL search params
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const initialFilters: FilterState = {
    minPrice: parseInt(searchParams.get('minPrice') || '500'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '5000'),
    duration: searchParams.get('duration')
      ? searchParams.get('duration')!.split(',').map(Number)
      : [],
    cruiseLines: searchParams.get('cruiseLines') ? searchParams.get('cruiseLines')!.split(',') : [],
    cabinTypes: searchParams.get('cabinTypes') ? searchParams.get('cabinTypes')!.split(',') : [],
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'price',
    sortOrder: (searchParams.get('sortOrder') as FilterState['sortOrder']) || 'asc',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Build query parameters for API call
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    // Only add non-empty search criteria from URL
    const keys = [
      'destination',
      'departurePort',
      'departureDate',
      'returnDate',
      'guestCount',
      'promotion',
    ];
    keys.forEach((key) => {
      const value = searchParams.get(key);
      if (value && value.trim() !== '') {
        params.append(key, value);
      }
    });

    // Add filter criteria
    if (filters.minPrice !== 500) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== 5000) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.duration.length > 0) {
      filters.duration.forEach((d) => params.append('duration', d.toString()));
    }
    if (filters.cruiseLines.length > 0) params.append('cruiseLines', filters.cruiseLines.join(','));
    if (filters.cabinTypes.length > 0) params.append('cabinTypes', filters.cabinTypes.join(','));
    params.append('sortBy', filters.sortBy);
    params.append('sortOrder', filters.sortOrder);

    return params.toString();
  };

  // Fetch cruises based on search and filter criteria
  const {
    data: allCruises,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['/api/cruises', buildQueryParams()],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/cruises?${queryString}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cruise results');
      }
      return response.json();
    },
  });

  // Pagination logic
  const totalResults = allCruises?.length || 0;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const endIndex = startIndex + resultsPerPage;
  const paginatedCruises = allCruises?.slice(startIndex, endIndex) || [];

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [
      FilterState['sortBy'],
      FilterState['sortOrder'],
    ];
    handleFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const handleViewItinerary = (cruise: Cruise) => {
    setSelectedCruise(cruise);
    setIsItineraryModalOpen(true);
  };

  const handleSelectCruise = (cruise: Cruise) => {
    setLocation(`/booking/${cruise.id}`);
  };

  const handleBookCruise = (cruise: Cruise) => {
    setIsItineraryModalOpen(false);
    setLocation(`/booking/${cruise.id}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchCriteria = {
    destination: searchParams.get('destination'),
    departureDate: searchParams.get('departureDate'),
    returnDate: searchParams.get('returnDate'),
    guestCount: searchParams.get('guestCount'),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Summary */}
      <section className="bg-white border-b border-gray-200 py-4 md:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Cruise Search Results</h1>
              <div className="flex flex-wrap gap-2 mt-2 text-xs md:text-sm text-gray-600">
                {searchCriteria.destination && (
                  <span className="bg-ocean-100 text-ocean-800 px-2 py-1 rounded-full">
                    {searchCriteria.destination}
                  </span>
                )}
                {searchCriteria.departureDate && (
                  <span className="bg-ocean-100 text-ocean-800 px-2 py-1 rounded-full">
                    Departs: {new Date(searchCriteria.departureDate).toLocaleDateString()}
                  </span>
                )}
                {searchCriteria.guestCount && (
                  <span className="bg-ocean-100 text-ocean-800 px-2 py-1 rounded-full">
                    {searchCriteria.guestCount} Guests
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              data-testid="button-modify-search"
            >
              Modify Search
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Filter Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar filters={filters} onFiltersChange={handleFiltersChange} />
          </div>

          {/* Main Results */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
              <p className="text-sm md:text-base text-gray-600" data-testid="results-count">
                {isLoading ? (
                  <Skeleton className="h-4 w-32" />
                ) : error ? (
                  'Error loading results'
                ) : (
                  `Showing ${startIndex + 1}-${Math.min(endIndex, totalResults)} of ${totalResults} cruises`
                )}
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Lowest Price</SelectItem>
                    <SelectItem value="price-desc">Highest Price</SelectItem>
                    <SelectItem value="departure-asc">Soonest Departure</SelectItem>
                    <SelectItem value="departure-desc">Latest Departure</SelectItem>
                    <SelectItem value="duration-asc">Shortest Duration</SelectItem>
                    <SelectItem value="duration-desc">Longest Duration</SelectItem>
                    <SelectItem value="rating-desc">Best Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-6">
                {Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="flex flex-col lg:flex-row">
                        <div className="lg:w-1/3">
                          <Skeleton className="w-full h-48 lg:h-full" />
                        </div>
                        <div className="lg:w-2/3 p-6 space-y-4">
                          <div className="flex items-center">
                            <Skeleton className="w-16 h-10 rounded mr-3" />
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <div className="flex justify-between items-end">
                            <div className="flex space-x-3">
                              <Skeleton className="h-9 w-24" />
                              <Skeleton className="h-9 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-9 w-28" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <i className="fas fa-exclamation-triangle text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">
                  We encountered an error while searching for cruises. Please try again or modify
                  your search criteria.
                </p>
                <Button onClick={() => window.location.reload()} data-testid="button-retry-search">
                  Try Again
                </Button>
              </div>
            )}

            {/* No Results */}
            {!isLoading && !error && totalResults === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <i className="fas fa-search text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cruises Found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any cruises matching your search criteria. Try adjusting your
                  filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleFiltersChange({
                        minPrice: 500,
                        maxPrice: 5000,
                        duration: [],
                        cruiseLines: [],
                        cabinTypes: [],
                        sortBy: 'price',
                        sortOrder: 'asc',
                      })
                    }
                    data-testid="button-clear-filters"
                  >
                    Clear All Filters
                  </Button>
                  <Button onClick={() => setLocation('/')} data-testid="button-new-search">
                    Start New Search
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {!isLoading && !error && paginatedCruises.length > 0 && (
              <>
                <div className="space-y-6">
                  {paginatedCruises.map((cruise: Cruise) => (
                    <CruiseCard
                      key={cruise.id}
                      cruise={cruise}
                      onViewItinerary={handleViewItinerary}
                      onSelectCruise={handleSelectCruise}
                      compact={false}
                      hideRightFavoriteButton={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <nav className="flex space-x-2" data-testid="pagination">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNumber}
                            variant={currentPage === pageNumber ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className={currentPage === pageNumber ? 'bg-ocean-600 text-white' : ''}
                            data-testid={`button-page-${pageNumber}`}
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-3 py-2 text-gray-500">...</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            data-testid={`button-page-${totalPages}`}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Itinerary Modal */}
      <ItineraryModal
        cruise={selectedCruise}
        isOpen={isItineraryModalOpen}
        onClose={() => setIsItineraryModalOpen(false)}
        onBookCruise={handleBookCruise}
      />

      <Footer />
    </div>
  );
}
