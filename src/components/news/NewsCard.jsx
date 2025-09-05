export default function NewsCard ({ newsItem }) {
  const formattedDate = new Date(newsItem.publishedDate).toLocaleDateString("es-ES", {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col justify-between transition-transform duration-300 hover:scale-105">
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <span className="bg-blue-900/50 text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
          {newsItem.symbol}
        </span>
        <span className="text-xs text-gray-400 truncate ml-2">{newsItem.newsPublisher}</span>
      </div>
      <div className="p-4 flex-grow">
        <h3 className="text-base font-bold text-gray-100 mb-2 leading-tight h-20 overflow-hidden">
          {newsItem.newsTitle}
        </h3>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
      <div className="p-4 bg-gray-800/50 border-t border-gray-700 rounded-b-lg">
        <a 
          href={newsItem.newsURL} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
        >
          Leer noticia completa &rarr;
        </a>
      </div>
    </div>
  );
};