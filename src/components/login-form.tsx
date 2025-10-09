import { cn } from "../lib/utils"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import React from "react"
import { supabase } from "../lib/supabase"
import { NavLink, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { logger } from "../lib/logger"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setLoading(true);
    void (async () => {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        void logger.info('LOGIN_SUCCESS', `User ${email} logged in successfully.`);
        toast.success('Has iniciado sesión correctamente.');
        setTimeout(() => {
          void navigate('/dashboard');
          window.location.reload();
        }, 500);
      } catch (error: unknown) {
        const errorMessage = (typeof error === 'object' && error && 'message' in error) ? (error as { message: string }).message : String(error);
        void logger.error('LOGIN_FAILED', `User ${email} failed to log in.`, { errorMessage });
        toast.error('Email o contraseña incorrectos.');
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    })();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Inicia sesión en tu cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                  <NavLink
                    to="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </NavLink>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                {}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Cargando..." : "Iniciar Sesion"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <NavLink to="/register" className="underline underline-offset-4">
                Crear cuenta
              </NavLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
