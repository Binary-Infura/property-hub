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
    <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-10 sticky top-32 overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>

      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Filters</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Refine your search</p>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          Reset
        </button>
      </div>

      <div className="space-y-10">
        {/* Location Search */}
        <div>
          <label className="block text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
            Desired Haven
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search Area..."
              value={filters.location}
              onChange={(e) => onFiltersChange({ ...filters, location: e.target.value })}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.2rem] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Property Type */}
        <div>
          <label className="block text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
            Estate Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handlePropertyTypeToggle(type)}
                className={`px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 ${filters.propertyType.includes(type)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'bg-white border-slate-50 text-slate-400 hover:border-slate-100 hover:text-slate-600'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Range */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
              Budget Palette
            </label>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              ₹{filters.budgetMin}L - ₹{filters.budgetMax}L
            </span>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={filters.budgetMin}
                  onChange={(e) => onFiltersChange({ ...filters, budgetMin: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-black text-slate-700"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={filters.budgetMax}
                  onChange={(e) => onFiltersChange({ ...filters, budgetMax: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-black text-slate-700"
                />
              </div>
            </div>
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="5000"
                value={filters.budgetMax}
                onChange={(e) => onFiltersChange({ ...filters, budgetMax: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* BHK / Size */}
        <div>
          <label className="block text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
            Space Config
          </label>
          <div className="flex flex-wrap gap-2">
            {bhkOptions.map((bhk) => (
              <button
                key={bhk}
                onClick={() => handleBhkToggle(bhk)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${filters.bhk.includes(bhk)
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                  : 'bg-slate-50 border-slate-50 text-slate-400 hover:text-slate-600'
                  }`}
              >
                {bhk}
              </button>
            ))}
          </div>
        </div>

        {/* Ready to Move vs Under Construction */}
        <div>
          <label className="block text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
            Construction Phase
          </label>
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {(['Ready', 'Under-Construction', 'Both'] as const).map((status) => (
              <button
                key={status}
                onClick={() => onFiltersChange({ ...filters, constructionStatus: status as 'Ready' | 'Under-Construction' | 'Both' })}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filters.constructionStatus === status
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {status === 'Under-Construction' ? 'Const' : status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

