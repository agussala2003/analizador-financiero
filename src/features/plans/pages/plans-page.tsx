// src/features/plans/pages/plans-page.tsx

import { motion } from 'framer-motion';
import { Check, Crown, Zap, Rocket, Shield } from 'lucide-react';
import { useConfig } from '../../../hooks/use-config';
import { useAuth } from '../../../hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';

/**
 * Página de planes y precios.
 * Muestra una comparación detallada de los diferentes planes disponibles
 * y sus características.
 * 
 * @example
 * ```tsx
 * <Route path="/plans" element={<PlansPage />} />
 * ```
 */
export default function PlansPage() {
  const config = useConfig();
  const { user, profile } = useAuth();

  const plans = [
    {
      name: 'Básico',
      role: 'basico',
      icon: Zap,
      description: 'Perfecto para comenzar tu análisis financiero',
      price: 'Gratis',
      priceDetail: 'Para siempre',
      features: [
        `${config.plans.roleLimits.basico} activos para analizar`,
        `${config.plans.portfolioLimits.basico} portafolio`,
        `Comparar hasta ${config.dashboard.maxTickersToCompare.basico} activos`,
        'Análisis fundamental completo',
        'Matriz de correlación',
        'Gráfico radar comparativo',
        'Calendario de dividendos',
        'Noticias financieras',
        'Acceso al blog comunitario',
      ],
      highlighted: false,
      ctaText: 'Plan Actual',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Plus',
      role: 'plus',
      icon: Crown,
      description: 'Para inversores serios que necesitan más análisis',
      price: '$9.99',
      priceDetail: 'por mes',
      features: [
        `${config.plans.roleLimits.plus} activos para analizar`,
        `Hasta ${config.plans.portfolioLimits.plus} portafolios`,
        `Comparar hasta ${config.dashboard.maxTickersToCompare.plus} activos`,
        'Todas las funciones del plan Básico',
        'Análisis de segmentación geográfica',
        'Análisis de segmentación de productos',
        'Stock grades (calificaciones)',
        'Exportar portafolio a PDF',
        'Calculadora de retiro avanzada',
        'Soporte prioritario',
      ],
      highlighted: true,
      ctaText: 'Actualizar a Plus',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Premium',
      role: 'premium',
      icon: Rocket,
      description: 'Para profesionales que demandan lo mejor',
      price: '$19.99',
      priceDetail: 'por mes',
      features: [
        `${config.plans.roleLimits.premium} activos para analizar`,
        `Hasta ${config.plans.portfolioLimits.premium} portafolios`,
        `Comparar hasta ${config.dashboard.maxTickersToCompare.premium} activos`,
        'Todas las funciones del plan Plus',
        'Acceso API para automatización',
        'Alertas personalizadas en tiempo real',
        'Análisis predictivo con IA',
        'Reportes personalizados',
        'Soporte 24/7',
        'Acceso anticipado a nuevas funciones',
      ],
      highlighted: false,
      ctaText: 'Actualizar a Premium',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const currentRole = profile?.role ?? 'basico';

  return (
    <div className="container-wide stack-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            Planes y Precios
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Elige el plan perfecto para ti
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Comienza gratis y actualiza cuando necesites más poder de análisis.
            Todos los planes incluyen acceso a funciones esenciales. Para actualizar tu plan, <a href="/contact" className="text-primary hover:underline font-semibold">contáctanos</a>.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isCurrentPlan = currentRole === plan.role;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'relative h-full flex flex-col',
                    plan.highlighted &&
                      'border-primary shadow-lg scale-105 md:scale-110'
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                        Más Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <div
                      className={cn(
                        'w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br flex items-center justify-center',
                        plan.color
                      )}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <div className="text-4xl font-bold">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">
                        {plan.priceDetail}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                      disabled={isCurrentPlan}
                      asChild={!isCurrentPlan}
                    >
                      {isCurrentPlan ? (
                        'Plan Actual'
                      ) : (
                        <a href="/contact">Contactar para {plan.name}</a>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Comparación Detallada
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">
                        Característica
                      </th>
                      <th className="text-center p-4 font-semibold">Básico</th>
                      <th className="text-center p-4 font-semibold bg-primary/5">
                        Plus
                      </th>
                      <th className="text-center p-4 font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Activos para analizar</td>
                      <td className="text-center p-4">
                        {config.plans.roleLimits.basico}
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        {config.plans.roleLimits.plus}
                      </td>
                      <td className="text-center p-4">
                        {config.plans.roleLimits.premium}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Número de portafolios</td>
                      <td className="text-center p-4">
                        {config.plans.portfolioLimits.basico}
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        {config.plans.portfolioLimits.plus}
                      </td>
                      <td className="text-center p-4">
                        {config.plans.portfolioLimits.premium}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Comparación simultánea</td>
                      <td className="text-center p-4">
                        {config.dashboard.maxTickersToCompare.basico}
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        {config.dashboard.maxTickersToCompare.plus}
                      </td>
                      <td className="text-center p-4">
                        {config.dashboard.maxTickersToCompare.premium}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Análisis fundamental</td>
                      <td className="text-center p-4">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4 bg-primary/5">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Stock grades</td>
                      <td className="text-center p-4">-</td>
                      <td className="text-center p-4 bg-primary/5">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Exportar a PDF</td>
                      <td className="text-center p-4">-</td>
                      <td className="text-center p-4 bg-primary/5">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                      <td className="text-center p-4">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">API para automatización</td>
                      <td className="text-center p-4">-</td>
                      <td className="text-center p-4 bg-primary/5">-</td>
                      <td className="text-center p-4">
                        <Check className="h-5 w-5 text-primary mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="p-4">Soporte</td>
                      <td className="text-center p-4">Email</td>
                      <td className="text-center p-4 bg-primary/5">
                        Prioritario
                      </td>
                      <td className="text-center p-4">24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Cómo puedo actualizar mi plan?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Para actualizar o cambiar tu plan, <a href="/contact" className="text-primary hover:underline">contáctanos</a> y te ayudaremos con el proceso. Los cambios se aplicarán rápidamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Qué métodos de pago aceptan?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aceptamos tarjetas de crédito, débito y transferencias
                  bancarias. Contáctanos para coordinar el método de pago que prefieras.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Hay período de prueba gratuito?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  El plan Básico es completamente gratuito para siempre. Puedes
                  probar todas las funciones esenciales sin límite de tiempo.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  ¿Necesito ayuda para elegir?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Nuestro equipo está aquí para ayudarte.{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Contáctanos
                  </a>{' '}
                  y te asesoraremos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <Card className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">
                ¿Listo para comenzar?
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu cuenta gratis y accede al plan Básico de inmediato.
              </p>
              <Button size="lg" asChild>
                <a href="/register">Crear Cuenta Gratis</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
