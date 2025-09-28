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
import { NavLink } from "react-router-dom"
import { toast } from "sonner"
import { logger } from "../lib/logger"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signUp({ email: email, password: password });
      if (error) throw error;
      logger.info('REGISTER_SUCCESS', `User ${email} registered successfully.`);
      toast.success('Has creado tu cuenta correctamente.');
      setTimeout(() => toast.success('Revisa tu correo electrónico para verificar tu cuenta.'), 1000);
    } catch (error: any) {
      logger.error('REGISTER_FAILED', `User ${email} failed to register.`, { errorMessage: error.message });
      toast.error('Error al crear la cuenta. Intenta nuevamente.');
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">Crea tu cuenta</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu correo electrónico a continuación para crear una cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
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
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" required value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
              </div>
              <div className="flex flex-col gap-3">
                {}
                <Button onClick={handleSubmit} disabled={loading} className="w-full">
                  {loading ? "Cargando..." : "Crear Cuenta"}
                </Button>
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <NavLink to="/login" className="underline underline-offset-4">
                Iniciar sesión
              </NavLink>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
