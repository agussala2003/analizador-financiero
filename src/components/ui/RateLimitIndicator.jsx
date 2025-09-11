import { useRateLimit } from "../../enhancements";

/**
 * Componente para mostrar el estado del rate limit
 */
export function RateLimitIndicator({ className = '' }) {
  const rateLimit = useRateLimit();
  const percentage = rateLimit.getUsagePercentage();
  
  const getColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  if (percentage === 0) return null;
  
  return (
    <div className={`text-xs text-gray-400 ${className}`}>
      <div className="flex items-center gap-2">
        <span>API: {rateLimit.currentRequests}/{rateLimit.limit}</span>
        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      {rateLimit.isNearLimit() && (
        <div className="text-yellow-400 mt-1">
          ⚠️ Cerca del límite - {rateLimit.getRemainingRequests()} requests restantes
        </div>
      )}
    </div>
  );
}