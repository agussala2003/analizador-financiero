# Dashboard PDF Export Restrictions - Implementation Summary

**Date:** January 2025  
**Status:** ✅ COMPLETED  
**Priority:** High - Feature Parity with Portfolio

## Overview

Implemented plan-based restrictions for PDF export functionality in dashboard components to match the existing portfolio export restrictions. Users with 'basico' plan now see upgrade prompts, while 'plus' and higher tiers can export data.

## Problem Statement

The portfolio section already had PDF export restrictions based on user plan (`exportPdf` feature requires 'plus' plan), but the dashboard analysis components allowed all users to export PDFs regardless of their plan. This created inconsistent user experience and monetization gaps.

## Implementation Details

### Modified Components

**1. Price Analysis Table** (`src/features/dashboard/components/analysis/price-analysis-table.tsx`)
- Added `usePlanFeature('exportPdf')` hook
- Wrapped export button with `Tooltip` component
- Added `disabled={!canExportPdf}` to button
- Shows upgrade message tooltip when access is denied

**2. Fundamentals Table** (`src/features/dashboard/components/analysis/fundamentals-table.tsx`)
- Same pattern as Price Analysis Table
- Integrated with existing `Tooltip` component (was already imported)
- Maintains existing `hideNA` checkbox functionality alongside export restriction

**3. Correlation Matrix** (`src/features/dashboard/components/analysis/correlation-matrix.tsx`)
- Same pattern as above components
- Tooltip shows upgrade message for restricted users

### Code Pattern

```typescript
// Import hook
import { usePlanFeature } from "../../../../hooks/use-plan-feature";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../components/ui/tooltip";

// Inside component
const { hasAccess: canExportPdf, upgradeMessage } = usePlanFeature('exportPdf');

// Wrap export button
<Tooltip>
  <TooltipTrigger asChild>
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            disabled={!canExportPdf}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handlePdfExport}>
            Exportar a PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </TooltipTrigger>
  {!canExportPdf && (
    <TooltipContent>
      <p className="text-xs">{upgradeMessage}</p>
    </TooltipContent>
  )}
</Tooltip>
```

## User Experience

### Basico Plan Users
- Export button appears **disabled** (grayed out)
- Hovering shows tooltip: "Mejora a Plan Plus o superior para exportar datos en PDF"
- Cannot trigger PDF export functionality
- Clear visual feedback about restriction

### Plus/Premium/Admin Users
- Export button appears **enabled**
- Full access to PDF export functionality
- No tooltip shown (feature unlocked)

## Technical Details

### `usePlanFeature` Hook
- Located in `src/hooks/use-plan-feature.ts`
- Returns: `{ hasAccess: boolean, requiredPlan: string, upgradeMessage: string }`
- Feature key: `'exportPdf'`
- Required plan: `'plus'` or higher

### Plan Hierarchy
```
basico (5 API calls/day) → ❌ No PDF export
plus (25 API calls/day) → ✅ PDF export enabled
premium (50 API calls/day) → ✅ PDF export enabled
administrador (unlimited) → ✅ PDF export enabled
```

## Testing Checklist

- [ ] **Basico plan user:**
  - Export button disabled in all 3 components
  - Tooltip shows upgrade message
  - Button click does nothing
  
- [ ] **Plus plan user:**
  - Export button enabled in all 3 components
  - No tooltip shown
  - PDF exports successfully
  
- [ ] **Mobile responsive:**
  - Tooltip works on mobile (tap)
  - Button sizing correct on small screens
  
- [ ] **Dark mode:**
  - Disabled button visible
  - Tooltip readable in dark theme

## Related Documentation

- **Portfolio Export Pattern:** `src/features/portfolio/pages/portfolio-page.tsx` (line 29)
- **Plan Feature Hook:** `src/hooks/use-plan-feature.ts`
- **Plan Limits Reference:** `docs/PLAN_LIMITS_AUDIT.md`
- **Export PDF Utility:** `src/utils/export-pdf.ts`

## Consistency Achieved

✅ **Portfolio** - PDF export restricted to 'plus'+  
✅ **Dashboard - Price Analysis** - PDF export restricted to 'plus'+  
✅ **Dashboard - Fundamentals** - PDF export restricted to 'plus'+  
✅ **Dashboard - Correlation Matrix** - PDF export restricted to 'plus'+

All export features now follow the same plan-based access control pattern.

## Future Enhancements

1. **Analytics tracking:** Log upgrade prompt impressions for conversion optimization
2. **In-place upgrade CTA:** Add "Upgrade Now" link in tooltip
3. **Feature preview:** Show sample PDF in modal before prompting upgrade
4. **CSV/Excel exports:** Apply same restrictions when those formats are implemented (currently commented out)

## Files Modified

```
src/features/dashboard/components/analysis/
├── price-analysis-table.tsx (+3 imports, +7 lines UI logic)
├── fundamentals-table.tsx (+2 imports, +7 lines UI logic)
└── correlation-matrix.tsx (+2 imports, +7 lines UI logic)
```

**Total Impact:** 3 files, ~25 lines of code, zero breaking changes.
