export default function SuggestionCardSkeleton() {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col gap-3 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-700 mt-3">
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-700 rounded-full w-1/3"></div>
            </div>
        </div>
    );
}