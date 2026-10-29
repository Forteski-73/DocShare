import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Anchor,
  Button,
  Center,
  Image,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
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
        <Center mb={18}>
          <Image src="/logo-doc-share.png" alt="DocShare" w="100%" maw={288} fit="contain" />
        </Center>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}
            <TextInput
              label="E-mail ou Crachá"
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
              <Anchor component={Link} to="/esqueci-senha" c="#044B88" td="none">
                Esqueci minha senha
              </Anchor>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Center>
  );
}
