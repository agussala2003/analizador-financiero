-- Tabla de watchlist para assets favoritos
-- Permite a los usuarios marcar assets como favoritos para seguimiento rápido

CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(10) NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    
    -- Índices para búsquedas rápidas
    CONSTRAINT watchlist_user_symbol_unique UNIQUE (user_id, symbol)
);

-- Índice para búsquedas por usuario
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);

-- Índice para búsquedas por símbolo
CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON public.watchlist(symbol);

-- Índice para ordenar por fecha
CREATE INDEX IF NOT EXISTS idx_watchlist_added_at ON public.watchlist(added_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propios watchlist items
CREATE POLICY "Users can view their own watchlist items"
    ON public.watchlist
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios watchlist items
CREATE POLICY "Users can insert their own watchlist items"
    ON public.watchlist
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios watchlist items
CREATE POLICY "Users can update their own watchlist items"
    ON public.watchlist
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios watchlist items
CREATE POLICY "Users can delete their own watchlist items"
    ON public.watchlist
    FOR DELETE
    USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE public.watchlist IS 'Assets favoritos de los usuarios para seguimiento rápido';
COMMENT ON COLUMN public.watchlist.symbol IS 'Símbolo del asset (ej: AAPL, MSFT)';
COMMENT ON COLUMN public.watchlist.notes IS 'Notas opcionales del usuario sobre el asset';
COMMENT ON COLUMN public.watchlist.added_at IS 'Fecha y hora en que se agregó a watchlist';
