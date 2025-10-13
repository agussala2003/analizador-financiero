// src/components/error-boundary/error-boundary.tsx

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { logger } from '../../lib/logger';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
    resetKeys?: unknown[];
    level?: 'root' | 'feature' | 'component';
    featureName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        const { level = 'component', featureName } = this.props;
        
        // Log the error with context
        void logger.error(
            'ERROR_BOUNDARY',
            `React Error Boundary caught an error at ${level} level${featureName ? ` in ${featureName}` : ''}`,
            {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                level,
                featureName,
                timestamp: new Date().toISOString(),
            }
        );

        this.setState({
            error,
            errorInfo,
        });
    }

    componentDidUpdate(prevProps: ErrorBoundaryProps): void {
        const { resetKeys = [] } = this.props;
        const { hasError } = this.state;

        // Auto-reset if resetKeys change
        if (hasError && prevProps.resetKeys !== resetKeys && resetKeys.length > 0) {
            const hasChanged = resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index]);
            if (hasChanged) {
                this.reset();
            }
        }
    }

    reset = (): void => {
        const { onReset } = this.props;
        
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        onReset?.();
    };

    render(): ReactNode {
        const { hasError, error } = this.state;
        const { children, fallback, level = 'component' } = this.props;

        if (!hasError) {
            return children;
        }

        // Custom fallback provided
        if (fallback) {
            return fallback;
        }

        // Default fallback UI based on level
        return this.renderDefaultFallback(error, level);
    }

    private renderDefaultFallback(error: Error | null, level: string): ReactNode {
        const isRootLevel = level === 'root';

        return (
            <div className="flex items-center justify-center min-h-[400px] p-6">
                <Card className="max-w-lg w-full p-8 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`rounded-full p-4 ${isRootLevel ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                            <AlertTriangle className={`h-12 w-12 ${isRootLevel ? 'text-destructive' : 'text-orange-500'}`} />
                        </div>
                        
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">
                                {isRootLevel ? 'Algo salió mal' : 'Error en esta sección'}
                            </h2>
                            <p className="text-muted-foreground">
                                {isRootLevel
                                    ? 'La aplicación ha encontrado un error inesperado.'
                                    : 'Esta sección encontró un problema, pero el resto de la app funciona correctamente.'}
                            </p>
                        </div>

                        {import.meta.env.DEV && error && (
                            <div className="w-full mt-4">
                                <details className="text-left">
                                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                                        Ver detalles técnicos
                                    </summary>
                                    <div className="mt-2 p-4 bg-muted rounded-md text-xs font-mono overflow-auto max-h-[200px]">
                                        <div className="text-destructive font-bold mb-2">{error.message}</div>
                                        <pre className="whitespace-pre-wrap text-muted-foreground">
                                            {error.stack}
                                        </pre>
                                    </div>
                                </details>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            {isRootLevel ? (
                                <>
                                    <Button onClick={() => window.location.href = '/'} variant="default">
                                        <Home className="mr-2 h-4 w-4" />
                                        Volver al Inicio
                                    </Button>
                                    <Button onClick={() => window.location.reload()} variant="outline">
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Recargar Página
                                    </Button>
                                </>
                            ) : (
                                <Button onClick={this.reset} variant="default">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Intentar de Nuevo
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }
}
