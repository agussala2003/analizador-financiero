# Risk Premium Feature

## 📋 Overview

The **Risk Premium** feature displays country risk premium data for global markets. It provides an interactive table showing country risk premiums and total equity risk premiums, helping investors assess country-level investment risks.

This feature follows the **Feature-Sliced Design (FSD)** architecture, utilizing reusable components from the `dividends` feature (DataTable) and implementing its own filtering and display logic.

---

## 🎯 Purpose

The risk premium calculator serves multiple purposes:

1. **Risk Assessment**: Evaluate country-level investment risk
2. **Comparison**: Compare risk premiums across countries and continents
3. **Filtering**: Search and filter by country name or continent
4. **Education**: Understand how country risk affects investment returns

---

## 🏗️ Architecture

```
risk-premium/
├── components/
│   ├── filters/
│   │   └── risk-premium-filters.tsx  # Search and continent filters
│   ├── table/
│   │   └── risk-premium-table.tsx    # Data table with TanStack Table
│   ├── skeleton/
│   │   └── risk-premium-skeleton.tsx # Loading state
│   └── index.ts                      # Barrel export
├── lib/
│   └── risk-premium.utils.ts         # API calls, caching, utilities
├── pages/
│   └── risk-premium-page.tsx          # Main page
├── types/
│   └── risk-premium.types.ts          # TypeScript interfaces
└── README.md                          # This file
```

### Architecture Principles

- **Feature Reusability**: Uses `DataTable` component from dividends feature
- **Caching**: 24-hour cache in Supabase to reduce API calls
- **Type Safety**: All props and data structures are typed
- **Separation**: Filters, table, and skeleton are separate components
- **Pure Functions**: Utilities are side-effect free

---

## 📦 Components

### 1. **RiskPremiumFilters** (`filters/risk-premium-filters.tsx`)

Card component containing search and filter controls.

**Props:**
```typescript
interface RiskPremiumFiltersProps {
  countryFilter: string;              // Current country search text
  continentFilter: string;            // Selected continent
  continents: string[];               // Available continents
  onCountryFilterChange: (value: string) => void;
  onContinentFilterChange: (value: string) => void;
  onClearFilters: () => void;        // Clear all filters
}
```

**Features:**
- **Country Search**: Text input with search icon
- **Continent Filter**: Dropdown select with "All" option
- **Clear Button**: Resets both filters
- **Responsive**: Stacks on mobile, row on desktop

**Example Usage:**
```tsx
<RiskPremiumFilters
  countryFilter={countryFilter}
  continentFilter={continentFilter}
  continents={['North America', 'Europe', 'Asia']}
  onCountryFilterChange={setCountryFilter}
  onContinentFilterChange={setContinentFilter}
  onClearFilters={handleClearFilters}
/>
```

---

### 2. **RiskPremiumTable** (`table/risk-premium-table.tsx`)

Interactive sortable table using TanStack Table and the shared DataTable component.

**Props:**
```typescript
interface RiskPremiumTableProps {
  data: RiskPremiumData[];      // Risk premium data
  countryFilter: string;        // Country filter (debounced)
  continentFilter: string;      // Continent filter
}
```

**Features:**
- **Sortable Columns**: Click headers to sort
- **Color Coding**: 
  - Green: Risk <= 5% (Low)
  - Yellow: Risk 5-10% (Moderate)
  - Red: Risk > 10% (High)
- **Pagination**: 15 items per page
- **Filtering**: Real-time filtering with 300ms debounce
- **Responsive**: Mobile-friendly table layout

**Columns:**
1. **País** (Country) - Sortable, left-aligned
2. **Continente** (Continent) - Sortable, left-aligned
3. **Prima País** (Country Risk Premium) - Sortable, right-aligned, color-coded
4. **Prima Total** (Total Equity Risk Premium) - Sortable, right-aligned, color-coded

**Example Usage:**
```tsx
<RiskPremiumTable
  data={riskPremiumData}
  countryFilter={countryFilter}
  continentFilter={continentFilter}
/>
```

---

### 3. **RiskPremiumSkeleton** (`skeleton/risk-premium-skeleton.tsx`)

Loading state skeleton displayed while data is being fetched.

**Features:**
- Header skeleton (icon + title + description)
- Filter skeleton (search + select + button)
- Table skeleton (4 columns × 10 rows)
- Matches actual layout structure

**Example Usage:**
```tsx
if (loading) {
  return <RiskPremiumSkeleton />;
}
```

---

## 🔧 Utilities

### File: `lib/risk-premium.utils.ts`

#### 1. **extractFmpProxyEndpoint**
Extracts the FMP API endpoint from config object.

```typescript
extractFmpProxyEndpoint(raw: unknown): string
```

**Example:**
```typescript
const endpoint = extractFmpProxyEndpoint(config);
// Returns: "market_risk_premium"
```

---

#### 2. **getRiskColorClass**
Gets Tailwind color class based on risk premium value.

```typescript
getRiskColorClass(premium: number): string
```

**Rules:**
- `premium <= 5`: Green (low risk)
- `premium <= 10`: Yellow (moderate risk)
- `premium > 10`: Red (high risk)

**Example:**
```typescript
getRiskColorClass(3.5)   // "text-green-600 dark:text-green-400"
getRiskColorClass(7.2)   // "text-yellow-600 dark:text-yellow-500"
getRiskColorClass(12.8)  // "text-red-600 dark:text-red-500"
```

---

#### 3. **getRiskLevel**
Gets human-readable risk level label.

```typescript
getRiskLevel(premium: number): string
```

**Example:**
```typescript
getRiskLevel(3.5)   // "Bajo"
getRiskLevel(7.2)   // "Moderado"
getRiskLevel(12.8)  // "Alto"
```

---

#### 4. **sortDataByCountry**
Sorts risk premium data alphabetically by country name.

```typescript
sortDataByCountry(data: RiskPremiumData[]): RiskPremiumData[]
```

**Example:**
```typescript
const sorted = sortDataByCountry(data);
// [Argentina, Brazil, Chile, ...]
```

---

#### 5. **extractContinents**
Extracts unique continents from data and sorts them.

```typescript
extractContinents(data: RiskPremiumData[]): string[]
```

**Example:**
```typescript
const continents = extractContinents(data);
// ["Africa", "Asia", "Europe", "North America", "South America"]
```

---

#### 6. **isCacheValid**
Checks if cached data is still valid (< 24 hours old).

```typescript
isCacheValid(lastUpdatedAt: string): boolean
```

**Example:**
```typescript
isCacheValid("2025-01-12T10:00:00Z")  // true (if < 24h ago)
isCacheValid("2025-01-10T10:00:00Z")  // false (> 24h ago)
```

---

#### 7. **fetchCachedData**
Retrieves cached risk premium data from Supabase.

```typescript
fetchCachedData(): Promise<CachedRiskPremiumData | null>
```

**Returns:**
```typescript
{
  data: RiskPremiumData[];
  last_updated_at: string;
}
```

**Example:**
```typescript
const cached = await fetchCachedData();
if (cached && isCacheValid(cached.last_updated_at)) {
  return cached.data;
}
```

---

#### 8. **fetchFreshData**
Fetches fresh risk premium data from FMP API via Supabase Edge Function.

```typescript
fetchFreshData(endpoint: string): Promise<RiskPremiumData[]>
```

**Example:**
```typescript
const data = await fetchFreshData("market_risk_premium");
// Returns array of country risk data
```

---

#### 9. **saveCacheData**
Saves risk premium data to Supabase cache.

```typescript
saveCacheData(data: RiskPremiumData[]): Promise<void>
```

**Example:**
```typescript
await saveCacheData(freshData);
// Data cached for 24 hours
```

---

#### 10. **fetchRiskPremiumData**
Main function to fetch risk premium data with caching strategy.

```typescript
fetchRiskPremiumData(config: unknown): Promise<RiskPremiumData[]>
```

**Flow:**
1. Check cache first
2. If cache valid → return cached data
3. If cache invalid → fetch fresh data
4. Save fresh data to cache
5. Return fresh data

**Example:**
```typescript
const data = await fetchRiskPremiumData(config);
// Returns sorted array of risk premium data
```

---

## 📊 Types

### File: `types/risk-premium.types.ts`

#### 1. **RiskPremiumData**
Country risk premium data from API.

```typescript
export interface RiskPremiumData {
  country: string;
  continent: string;
  countryRiskPremium: number;      // Country-specific risk premium (%)
  totalEquityRiskPremium: number;  // Total equity risk premium (%)
}
```

**Example:**
```typescript
{
  country: "Argentina",
  continent: "South America",
  countryRiskPremium: 14.52,
  totalEquityRiskPremium: 19.52
}
```

---

#### 2. **CachedRiskPremiumData**
Cached data structure in Supabase.

```typescript
export interface CachedRiskPremiumData {
  data: RiskPremiumData[];
  last_updated_at: string;  // ISO 8601 timestamp
}
```

---

#### 3. **RiskPremiumFiltersProps**
Props for filters component.

```typescript
export interface RiskPremiumFiltersProps {
  countryFilter: string;
  continentFilter: string;
  continents: string[];
  onCountryFilterChange: (value: string) => void;
  onContinentFilterChange: (value: string) => void;
  onClearFilters: () => void;
}
```

---

#### 4. **RiskPremiumTableProps**
Props for table component.

```typescript
export interface RiskPremiumTableProps {
  data: RiskPremiumData[];
  countryFilter: string;
  continentFilter: string;
}
```

---

## 📄 Main Page

### File: `pages/risk-premium-page.tsx`

The main page orchestrates all components and manages state.

**State Management:**
```typescript
const [data, setData] = useState<RiskPremiumData[]>([]);
const [loading, setLoading] = useState(true);
const [countryFilter, setCountryFilter] = useState('');
const [continentFilter, setContinentFilter] = useState('');
```

**Data Fetching:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const riskData = await fetchRiskPremiumData(config);
      setData(riskData);
    } catch (error) {
      toast.error('Error al obtener los datos de riesgo país.');
    } finally {
      setLoading(false);
    }
  };

  if (config) void fetchData();
}, [config]);
```

**Layout:**
- **Header**: Icon, title, description
- **Filters**: Search and continent filter
- **Table**: Sortable, paginated risk premium data

**Animations:**
- Page fade-in on load
- Header slide-in from top

---

## 🎨 UI/UX Features

### Color Coding System
- **Green** (Low Risk ≤ 5%): Safe investment environment
- **Yellow** (Moderate Risk 5-10%): Caution advised
- **Red** (High Risk > 10%): Higher risk premium required

### Responsive Design
- **Mobile**: Single column layout, stacked filters
- **Desktop**: Multi-column table, row-based filters
- **Tablet**: Hybrid layout

### Accessibility
- Sortable table headers with visible indicators
- Clear labels for all inputs
- High contrast color scheme
- Keyboard navigation support

### User Experience
- 300ms debounce on country search (prevents excessive filtering)
- Instant continent filtering
- Pagination (15 items per page)
- Clear all filters button
- Loading skeleton matches final layout

---

## 🔄 Data Flow

```
User Opens Page
      ↓
Check Config Available
      ↓
fetchRiskPremiumData()
      ↓
Check Supabase Cache
      ↓
Is Cache Valid (< 24h)?
    ↙         ↘
  Yes          No
   ↓            ↓
Return       Fetch Fresh
Cached    →  from FMP API
Data           ↓
            Sort by Country
               ↓
            Save to Cache
               ↓
            Return Data
               ↓
         Display in Table
               ↓
    User Applies Filters
               ↓
    TanStack Table Filters
               ↓
    Re-render Visible Rows
```

---

## 🚀 Performance

### Optimizations
- **24-Hour Cache**: Reduces API calls significantly
- **Debounced Search**: Prevents excessive re-renders (300ms)
- **useMemo**: Continent list only recalculated when data changes
- **TanStack Table**: Efficient sorting and filtering
- **Code Splitting**: Table components loaded on demand

### Bundle Size
- **Main Page**: 7.55 kB (2.73 kB gzip)
- **Shared DataTable**: Reused from dividends feature
- **Total Feature**: ~10 kB including dependencies

---

## 📚 Dependencies

### Direct Dependencies
- **react** & **react-dom**: Core framework
- **@tanstack/react-table**: Table state management
- **framer-motion**: Page animations
- **sonner**: Toast notifications
- **@supabase/supabase-js**: API and caching
- **shadcn/ui**: UI components

### Shared Components
- **DataTable** from `dividends` feature
- **use-debounce** hook
- **use-config** hook

---

## 🧪 Testing Considerations

### Unit Tests
1. **Utilities**:
   - Test getRiskColorClass with boundaries (5%, 10%)
   - Test extractContinents with various data sets
   - Test isCacheValid with different timestamps
   
2. **Components**:
   - RiskPremiumFilters: Test filter changes
   - RiskPremiumTable: Test sorting and filtering
   - Skeleton: Test rendering

### Integration Tests
1. Data fetching with cache hit
2. Data fetching with cache miss
3. Filter updates trigger table re-render
4. Pagination works correctly

### E2E Tests
1. User searches for a country
2. User filters by continent
3. User sorts by different columns
4. User navigates between pages

---

## 🔮 Future Enhancements

### Short Term
1. **Export Data**: Download as CSV/Excel
2. **Historical Trends**: Show how risk premiums change over time
3. **Risk Alerts**: Notify when risk exceeds threshold
4. **Favorites**: Save frequently viewed countries

### Medium Term
1. **Comparison Mode**: Compare multiple countries side-by-side
2. **Visualization**: Charts showing risk distribution by continent
3. **Risk Calculator**: Calculate adjusted returns based on country risk
4. **News Integration**: Show news related to high-risk countries

### Long Term
1. **Predictive Analytics**: Forecast future risk premiums
2. **Portfolio Impact**: Show how country risk affects portfolio
3. **Custom Weighting**: User-defined risk tolerance
4. **Real-Time Updates**: WebSocket for live data

---

## 🐛 Common Issues & Solutions

### Issue: Cache not updating
**Solution**: Check Supabase connection and `asset_data_cache` table permissions

### Issue: Filters not working
**Solution**: Ensure debounce hook is working and TanStack Table columns configured correctly

### Issue: Colors not showing
**Solution**: Verify Tailwind dark mode classes are properly configured

### Issue: Empty table
**Solution**: Check API endpoint in config and FMP proxy edge function

---

## 📖 Risk Premium Explained

### What is Country Risk Premium?
The additional return investors require to compensate for country-specific risks:
- Political instability
- Economic volatility
- Currency risk
- Regulatory changes
- Default risk

### How It Affects Investments
- **Higher Premium**: Higher risk → Higher required return
- **Lower Premium**: Lower risk → Lower required return

### Formula
```
Total Equity Risk Premium = Base Market Risk Premium + Country Risk Premium
```

**Example:**
- Base Market Risk Premium: 5%
- Argentina Country Risk Premium: 14.52%
- **Total Required Return**: 19.52%

---

## 🏆 Best Practices Applied

- ✅ **Feature-Sliced Design**: Clear separation of layers
- ✅ **Type Safety**: All interfaces defined
- ✅ **Pure Functions**: Utilities without side effects
- ✅ **Component Reuse**: Leverages DataTable from dividends
- ✅ **Caching Strategy**: 24-hour cache reduces API load
- ✅ **Error Handling**: Graceful degradation with toast messages
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Performance**: Debouncing and memoization
- ✅ **Accessibility**: Proper labels and keyboard navigation
- ✅ **Documentation**: Comprehensive README

---

## 🤝 Integration Points

### With Other Features
- **Portfolio**: Could calculate portfolio-weighted country risk
- **Asset Detail**: Could show country risk for each asset
- **Dashboard**: Could display countries with highest risk

### With External Services
- **Supabase**: Caching layer (`asset_data_cache` table)
- **FMP API**: Risk premium data source (via proxy edge function)
- **Config**: API endpoints configuration

---

## 📊 Success Metrics

### User Engagement
- Number of countries searched
- Filters applied per session
- Sort interactions
- Page views

### Technical Performance
- Cache hit rate (target: > 80%)
- Average page load time (target: < 1s)
- API error rate (target: < 1%)

### Data Quality
- Data freshness (24-hour cycle)
- Number of countries covered
- Update reliability

---

## 🔗 Related Documentation

### Financial Concepts
- [Country Risk Premium Explained](https://www.investopedia.com/terms/c/countyriskpremium.asp)
- [Equity Risk Premium](https://www.investopedia.com/terms/e/equityriskpremium.asp)
- [Emerging Market Risks](https://www.investopedia.com/terms/e/emergingmarketfund.asp)

### Technical
- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Supabase Caching Strategies](https://supabase.com/docs/guides/database/caching)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

## 👥 Contributing

When modifying this feature:

1. **Maintain Type Safety**: Update types first
2. **Test Caching**: Ensure 24-hour cache works
3. **Color Coding**: Keep risk thresholds consistent
4. **Reuse Components**: Leverage shared DataTable
5. **Update Docs**: Keep README in sync

---

## 📝 Changelog

### v2.0.0 (Current)
- ✅ Refactored to Feature-Sliced Design
- ✅ Separated filters, table, and skeleton components
- ✅ Extracted 10 utility functions
- ✅ Created comprehensive type definitions
- ✅ Implemented 24-hour caching strategy
- ✅ Added 300ms debounce on country search
- ✅ Reused DataTable from dividends feature
- ✅ Enhanced color coding for risk levels

### v1.0.0 (Legacy)
- Basic risk premium table
- Monolithic component
- No caching
- Limited filtering

---

**Last Updated**: January 2025  
**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Bundle Size**: 7.55 kB (2.73 kB gzip)  
**Components**: 3  
**Utilities**: 10  
**Types**: 4
