import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import type { FilterState } from '@/lib/types';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0],
      maxPrice: values[1],
    });
  };

  const handleDurationChange = (duration: number, checked: boolean) => {
    const newDuration = checked
      ? [...filters.duration, duration]
      : filters.duration.filter((d) => d !== duration);

    onFiltersChange({
      ...filters,
      duration: newDuration,
    });
  };

  const handleCruiseLineChange = (line: string, checked: boolean) => {
    const newLines = checked
      ? [...filters.cruiseLines, line]
      : filters.cruiseLines.filter((l) => l !== line);

    onFiltersChange({
      ...filters,
      cruiseLines: newLines,
    });
  };

  const handleCabinTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.cabinTypes, type]
      : filters.cabinTypes.filter((t) => t !== type);

    onFiltersChange({
      ...filters,
      cabinTypes: newTypes,
    });
  };

  return (
    <Card className="sticky top-24" data-testid="filter-sidebar">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Filter Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
          <div className="space-y-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={5000}
              min={500}
              step={50}
              className="w-full"
              data-testid="slider-price-range"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span data-testid="text-min-price">${priceRange[0]}</span>
              <span data-testid="text-max-price">${priceRange[1]}+</span>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Duration</h4>
          <div className="space-y-2">
            {[
              { range: [3, 5], label: '3-5 days', value: 4 },
              { range: [6, 8], label: '6-8 days', value: 7 },
              { range: [9, 14], label: '9-14 days', value: 11 },
              { range: [15, 30], label: '15+ days', value: 20 },
            ].map(({ range, label, value }) => (
              <label key={value} className="flex items-center">
                <Checkbox
                  checked={filters.duration.includes(value)}
                  onCheckedChange={(checked) => handleDurationChange(value, !!checked)}
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  data-testid={`checkbox-duration-${value}`}
                />
                <span className="ml-2 text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cruise Lines */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Cruise Lines</h4>
          <div className="space-y-2">
            {['Royal Caribbean', 'Norwegian', 'Princess', 'Celebrity'].map((line) => (
              <label key={line} className="flex items-center">
                <Checkbox
                  checked={filters.cruiseLines.includes(line)}
                  onCheckedChange={(checked) => handleCruiseLineChange(line, !!checked)}
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  data-testid={`checkbox-cruise-line-${line.replace(/\s+/g, '-').toLowerCase()}`}
                />
                <span className="ml-2 text-sm text-gray-700">{line}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cabin Type */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Cabin Type</h4>
          <div className="space-y-2">
            {['Interior', 'Ocean View', 'Balcony', 'Suite'].map((type) => (
              <label key={type} className="flex items-center">
                <Checkbox
                  checked={filters.cabinTypes.includes(type)}
                  onCheckedChange={(checked) => handleCabinTypeChange(type, !!checked)}
                  className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500"
                  data-testid={`checkbox-cabin-type-${type.replace(/\s+/g, '-').toLowerCase()}`}
                />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
