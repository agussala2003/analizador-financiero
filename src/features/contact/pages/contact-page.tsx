// src/features/contact/pages/contact-page.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Twitter, Linkedin, Github } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '../../../hooks/use-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { logger } from '../../../lib/logger';

/**
 * Página de contacto.
 * Muestra un formulario para que los usuarios puedan enviar mensajes
 * y la información de contacto de la aplicación.
 * 
 * @example
 * ```tsx
 * <Route path="/contact" element={<ContactPage />} />
 * ```
 */
export default function ContactPage() {
  const config = useConfig();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Por favor completa todos los campos.');
      return;
    }

    if (formData.message.length < 10) {
      toast.error('El mensaje debe tener al menos 10 caracteres.');
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        // Log del contacto
        await logger.info('CONTACT_FORM_SUBMITTED', 'Contact form submitted', {
          name: formData.name,
          email: formData.email,
          messageLength: formData.message.length,
        });

        // En producción, aquí se enviaría el email o se guardaría en la base de datos
        // Por ahora solo mostramos un mensaje de éxito
        toast.success('Mensaje enviado correctamente.');
        toast.info('Nos pondremos en contacto contigo pronto.');

        // Limpiar formulario
        setFormData({ name: '', email: '', message: '' });
      } catch (error) {
        await logger.error('CONTACT_FORM_ERROR', 'Error submitting contact form', {
          errorMessage: error instanceof Error ? error.message : String(error),
        });
        toast.error('Error al enviar el mensaje. Intenta nuevamente.');
      } finally {
        setLoading(false);
      }
    })();
  };

  const socialLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      url: config.app.socialMedia?.twitter,
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: config.app.socialMedia?.linkedin,
    },
    {
      name: 'GitHub',
      icon: Github,
      url: config.app.socialMedia?.github,
    },
  ];

  return (
    <div className="container-wide stack-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Contacto</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ¿Tienes alguna pregunta o sugerencia? Nos encantaría escucharte.
            Completa el formulario o contáctanos directamente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Envíanos un mensaje
              </CardTitle>
              <CardDescription>
                Completa el formulario y te responderemos lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Escribe tu mensaje aquí..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 10 caracteres
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a
                    href={`mailto:${config.app.contactEmail}`}
                    className="text-primary hover:underline"
                  >
                    {config.app.contactEmail}
                  </a>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Horario de Atención</h3>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Viernes: 9:00 AM - 6:00 PM (ART)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
                  <p className="text-sm text-muted-foreground">
                    Normalmente respondemos en menos de 24 horas hábiles.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Síguenos en Redes Sociales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return social.url ? (
                      <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        aria-label={social.name}
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ¿Tienes dudas sobre los planes, características o cómo usar la
                  plataforma? Consulta nuestra{' '}
                  <a href="/plans" className="text-primary hover:underline">
                    página de planes
                  </a>{' '}
                  para más información.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
