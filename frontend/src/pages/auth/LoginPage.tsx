import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Center,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "../../schemas/authSchemas";
import { getErrorMessage } from "../../services/api";
import { TurnstileWidget } from "../../components/auth/TurnstileWidget";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    if (!turnstileToken) return;
    setError(null);
    try {
      await login(values.identifier, values.password, turnstileToken);
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? "/labels");
    } catch (err) {
      setError(getErrorMessage(err));
      setTurnstileToken(null);
    }
  }

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" w={380} radius="md">
        <Title order={2} mb="xs">
          DocShare
        </Title>
        <Text c="dimmed" size="sm" mb="lg">
          Entre com seu e-mail ou cracha
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="E-mail ou cracha"
              placeholder="seu.email@empresa.com"
              {...register("identifier")}
              error={errors.identifier?.message}
            />
            <PasswordInput
              label="Senha"
              placeholder="Sua senha"
              {...register("password")}
              error={errors.password?.message}
            />
            <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
            <Button type="submit" loading={isSubmitting} disabled={!turnstileToken} fullWidth>
              Entrar
            </Button>
            <Text ta="center" size="sm">
              <Link to="/esqueci-senha">Esqueci minha senha</Link>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
