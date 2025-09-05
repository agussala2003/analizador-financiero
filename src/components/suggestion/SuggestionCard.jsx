export default function SuggestionCard({ suggestion }) {
  const formattedDate = new Date(suggestion.created_at).toLocaleDateString("es-ES", {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-5 flex flex-col gap-3 animate-fade-in">
      <p className="text-gray-200 flex-grow">{suggestion.content}</p>
      <div className="flex justify-between items-center text-xs text-gray-400 pt-3 border-t border-gray-700">
        <span>{formattedDate}</span>
        <span className={`px-2 py-1 rounded-full capitalize ${
          suggestion.status === 'nueva' ? 'bg-blue-900/50 text-blue-300' :
          suggestion.status === 'completada' ? 'bg-green-900/50 text-green-300' :
          'bg-gray-700 text-gray-300'
        }`}>
          {suggestion.status}
        </span>
      </div>
    </div>
  );
};