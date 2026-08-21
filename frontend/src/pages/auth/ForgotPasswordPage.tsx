import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Alert, Button, Center, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import * as authService from "../../services/auth.service";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../../schemas/authSchemas";
import { getErrorMessage } from "../../services/api";

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError(null);
    setMessage(null);
    try {
      const result = await authService.forgotPassword(values.identifier);
      setMessage(result);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" w={380} radius="md">
        <Title order={2} mb="xs">
          Esqueci minha senha
        </Title>
        <Text c="dimmed" size="sm" mb="lg">
          Informe seu e-mail ou cracha para receber o link de redefinicao
        </Text>
        {message ? (
          <Stack>
            <Alert color="green">{message}</Alert>
            <Button component={Link} to="/login" variant="light" fullWidth>
              Voltar para o login
            </Button>
          </Stack>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack>
              {error && <Alert color="red">{error}</Alert>}
              <TextInput
                label="E-mail ou cracha"
                {...register("identifier")}
                error={errors.identifier?.message}
              />
              <Button type="submit" loading={isSubmitting} fullWidth>
                Enviar
              </Button>
              <Text ta="center" size="sm">
                <Link to="/login">Voltar para o login</Link>
              </Text>
            </Stack>
          </form>
        )}
      </Paper>
    </Center>
  );
}
