import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/Layout/AuthLayout";
import Card from "../components/Layout/Card";
import Input from "../components/Form/Input";
import PasswordInput from "../components/Form/PasswordInput";
import Button from "../components/Form/Button";
import Alert from "../components/Feedback/Alert";
import { useAuth } from "../context/AuthContext";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo de 6 caracteres"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Usuário ou senha inválidos");
    }
  }

  return (
    <AuthLayout>
      <Card title="Login">
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "grid", gap: 16 }}
        >
          <Input
            label="Email"
            placeholder="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            autoFocus
          />
          <PasswordInput
            label="Senha"
            placeholder="Senha"
            {...register("password")}
            error={errors.password?.message}
          />

          {error && <Alert>{error}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid}
            fullWidth
          >
            Entrar
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link
            to="/register"
            style={{ color: "#4b4b4b", textDecoration: "none" }}
          >
            Cadastre-se
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
