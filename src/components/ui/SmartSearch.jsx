// src/components/ui/SmartSearch.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSmartSearch } from '../../hooks/useSmartSearch';

/**
 * Componente principal de búsqueda inteligente
 */
export function SmartSearchBox({ 
  searchAPI,
  placeholder = "Buscar acciones, noticias, blogs...",
  onResultSelect,
  className = "",
  showHistory = true,
  showSuggestions = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const {
    query,
    results,
    suggestions,
    isSearching,
    searchHistory,
    handleQueryChange,
    executeSearch,
    selectSuggestion,
    clearSearch,
    hasResults,
    hasSuggestions,
    hasHistory
  } = useSmartSearch({
    searchFunction: searchAPI,
    minQueryLength: 1,
    debounceMs: 300,
    maxSuggestions: 8
  });

  // Manejar clics fuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    const totalItems = (showSuggestions ? suggestions.length : 0) + 
                     (hasResults ? results.length : 0) + 
                     (showHistory && !query ? searchHistory.length : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => prev < totalItems - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex === -1) {
          executeSearch(query);
        } else {
          const allItems = [
            ...(showSuggestions ? suggestions : []),
            ...(hasResults ? results : []),
            ...(showHistory && !query ? searchHistory.map(h => ({ type: 'history', text: h.query })) : [])
          ];
          const selectedItem = allItems[focusedIndex];
          if (selectedItem) {
            if (selectedItem.type === 'history') {
              selectSuggestion(selectedItem);
            } else if (selectedItem.type) {
              selectSuggestion(selectedItem);
            } else {
              onResultSelect?.(selectedItem);
            }
          }
        }
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    handleQueryChange(value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion) => {
    selectSuggestion(suggestion);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleResultClick = (result) => {
    onResultSelect?.(result);
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    clearSearch();
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          autoComplete="off"
        />
        
        {/* Botones de loading/clear */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isSearching ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : query ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {/* Sugerencias */}
            {showSuggestions && hasSuggestions && (
              <div className="py-2">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Sugerencias
                </div>
                {suggestions.map((suggestion, index) => (
                  <SuggestionItem
                    key={`suggestion-${index}`}
                    suggestion={suggestion}
                    isActive={index === focusedIndex}
                    onClick={() => handleSuggestionClick(suggestion)}
                  />
                ))}
              </div>
            )}

            {/* Resultados de búsqueda */}
            {hasResults && (
              <div className="py-2 border-t border-gray-100">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Resultados
                </div>
                {results.slice(0, 5).map((result, index) => {
                  const adjustedIndex = (showSuggestions ? suggestions.length : 0) + index;
                  return (
                    <SearchResultItem
                      key={`result-${result.id || index}`}
                      result={result}
                      isActive={adjustedIndex === focusedIndex}
                      onClick={() => handleResultClick(result)}
                    />
                  );
                })}
                {results.length > 5 && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    {results.length - 5} resultados más...
                  </div>
                )}
              </div>
            )}

            {/* Historial */}
            {showHistory && hasHistory && !query && (
              <div className="py-2 border-t border-gray-100">
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Búsquedas recientes
                </div>
                {searchHistory.slice(0, 5).map((historyItem, index) => {
                  const adjustedIndex = (showSuggestions ? suggestions.length : 0) + 
                                       (hasResults ? Math.min(results.length, 5) : 0) + index;
                  return (
                    <SuggestionItem
                      key={`history-${index}`}
                      suggestion={{ type: 'history', text: historyItem.query, icon: '🕒' }}
                      isActive={adjustedIndex === focusedIndex}
                      onClick={() => handleSuggestionClick({ type: 'history', text: historyItem.query })}
                    />
                  );
                })}
              </div>
            )}

            {/* Estado vacío */}
            {!hasSuggestions && !hasResults && (!hasHistory || query) && (
              <div className="py-8 text-center text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm">
                  {query ? 'No se encontraron resultados' : 'Comience a escribir para buscar'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para items de sugerencia
 */
function SuggestionItem({ suggestion, isActive, onClick }) {
  return (
    <button
      className={`w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center ${
        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
      }`}
      onClick={onClick}
    >
      <span className="mr-3 text-lg">{suggestion.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{suggestion.text}</p>
        {suggestion.count && (
          <p className="text-xs text-gray-500">{suggestion.count} búsquedas</p>
        )}
      </div>
      {suggestion.type === 'autocomplete' && (
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7l10 10M7 17L17 7" />
        </svg>
      )}
    </button>
  );
}

/**
 * Componente para items de resultado
 */
function SearchResultItem({ result, isActive, onClick }) {
  const getIcon = () => {
    switch (result.type) {
      case 'stock': return '📈';
      case 'news': return '📰';
      case 'blog': return '📝';
      default: return '📄';
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'stock': return 'Acción';
      case 'news': return 'Noticia';
      case 'blog': return 'Blog';
      default: return 'Resultado';
    }
  };

  return (
    <button
      className={`w-full px-3 py-3 text-left hover:bg-gray-50 ${
        isActive ? 'bg-blue-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start">
        <span className="mr-3 text-lg mt-0.5">{getIcon()}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${
            isActive ? 'text-blue-700' : 'text-gray-900'
          }`}>
            {result.title || result.name || result.symbol}
          </p>
          {result.description && (
            <p className="text-xs text-gray-500 truncate mt-1">
              {result.description}
            </p>
          )}
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {getTypeLabel()}
            </span>
            {result.price && (
              <span className="text-xs text-green-600 ml-2">
                ${result.price}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Búsqueda compacta para el header
 */
export function CompactSearch({ onSearch, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query.trim());
      setQuery('');
      setIsExpanded(false);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    setQuery('');
  };

  return (
    <div className={`flex items-center ${className}`}>
      {!isExpanded ? (
        <button
          onClick={handleExpand}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex items-center">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="w-64 pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onBlur={(e) => {
                if (!e.relatedTarget?.closest('form')) {
                  setTimeout(handleCollapse, 150);
                }
              }}
            />
            <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleCollapse}
            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>
      )}
    </div>
  );
}

export default SmartSearchBox;
