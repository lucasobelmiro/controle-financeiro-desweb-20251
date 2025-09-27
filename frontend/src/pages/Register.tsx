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
import { registerRequest } from "../services/auth";

const schema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirm: z.string().min(6, "Mínimo de 6 caracteres"),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem",
  });

type FormValues = z.infer<typeof schema>;

export default function Register() {
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
      await registerRequest({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/login");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || "Erro ao cadastrar. Tente novamente.";
      setError(msg);
    }
  }

  return (
    <AuthLayout>
      <Card title="Cadastro de Usuário">
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "grid", gap: 16 }}
        >
          <Input
            label="Nome"
            placeholder="Seu nome"
            {...register("name")}
            error={errors.name?.message}
            autoFocus
          />
          <Input
            label="Email"
            placeholder="email@exemplo.com"
            type="email"
            {...register("email")}
            error={errors.email?.message}
          />
          <PasswordInput
            label="Senha"
            placeholder="Mínimo de 6 caracteres"
            {...register("password")}
            error={errors.password?.message}
          />
          <PasswordInput
            label="Confirmar senha"
            placeholder="Repita a senha"
            {...register("confirm")}
            error={errors.confirm?.message}
          />

          {error && <Alert>{error}</Alert>}

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid}
            fullWidth
          >
            Cadastrar
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Link
            to="/login"
            style={{ color: "#4b4b4b", textDecoration: "none" }}
          >
            Já tem conta? Entrar
          </Link>
        </div>
      </Card>
    </AuthLayout>
  );
}
