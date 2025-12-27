'use client';

interface FilterState {
  location: string;
  propertyType: ('Flat' | 'Villa' | 'Plot' | 'Commercial')[];
  budgetMin: number;
  budgetMax: number;
  bhk: string[];
  propertyAge: 'New' | 'Resale' | 'Both';
  constructionStatus: 'Ready' | 'Under-Construction' | 'Both';
}

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
}

export default function PropertyFilters({ filters, onFiltersChange, onReset }: PropertyFiltersProps) {
  const propertyTypes: ('Flat' | 'Villa' | 'Plot' | 'Commercial')[] = ['Flat', 'Villa', 'Plot', 'Commercial'];
  const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];

  const handlePropertyTypeToggle = (type: 'Flat' | 'Villa' | 'Plot' | 'Commercial') => {
    const newTypes = filters.propertyType.includes(type)
      ? filters.propertyType.filter(t => t !== type)
      : [...filters.propertyType, type];
    onFiltersChange({ ...filters, propertyType: newTypes });
  };

  const handleBhkToggle = (bhk: string) => {
    const newBhk = filters.bhk.includes(bhk)
      ? filters.bhk.filter(b => b !== bhk)
      : [...filters.bhk, bhk];
    onFiltersChange({ ...filters, bhk: newBhk });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Location Search */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="City, area, or landmark"
            value={filters.location}
            onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Property Type
          </label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handlePropertyTypeToggle(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.propertyType.includes(type)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Budget Range
          </label>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Min (₹L)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.budgetMin}
                  onChange={(e) => onFiltersChange({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-600 mb-1">Max (₹L)</label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={filters.budgetMax}
                  onChange={(e) => onFiltersChange({ ...filters, budgetMax: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.budgetMax}
                onChange={(e) => onFiltersChange({ ...filters, budgetMax: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              ₹{filters.budgetMin}L - ₹{filters.budgetMax}L
            </p>
          </div>
        </div>

        {/* BHK / Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            BHK / Size
          </label>
          <div className="flex flex-wrap gap-2">
            {bhkOptions.map((bhk) => (
              <button
                key={bhk}
                onClick={() => handleBhkToggle(bhk)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.bhk.includes(bhk)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bhk}
              </button>
            ))}
          </div>
        </div>

        {/* New vs Resale */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Property Age
          </label>
          <div className="flex gap-2">
            {(['New', 'Resale', 'Both'] as const).map((age) => (
              <button
                key={age}
                onClick={() => onFiltersChange({ ...filters, propertyAge: age as 'New' | 'Resale' | 'Both' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.propertyAge === age
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Ready to Move vs Under Construction */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Construction Status
          </label>
          <div className="flex gap-2">
            {(['Ready', 'Under-Construction', 'Both'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onFiltersChange({ ...filters, constructionStatus: status as 'Ready' | 'Under-Construction' | 'Both' })}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.constructionStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'Under-Construction' ? 'Under Construction' : status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

