export default function PaginationControls ({ currentPage, totalPages, onPageChange }){
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        &larr; Anterior
      </button>
      <span className="text-gray-300 font-semibold">
        Página {currentPage + 1} de {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        Siguiente &rarr;
      </button>
    </div>
  );
};