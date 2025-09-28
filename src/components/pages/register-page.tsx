import { RegisterForm } from "../register-form";
import { motion } from "framer-motion";

export default function RegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <RegisterForm />
      </motion.div>
    </div>
  )
}