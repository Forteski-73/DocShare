import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button, Center, Paper, PasswordInput, Stack, Title } from "@mantine/core";
import * as authService from "../../services/auth.service";
import { setPasswordSchema, type SetPasswordFormValues } from "../../schemas/authSchemas";
import { getErrorMessage } from "../../services/api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({ resolver: zodResolver(setPasswordSchema) });

  async function onSubmit(values: SetPasswordFormValues) {
    setError(null);
    try {
      await authService.resetPassword(token, values.password);
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Center h="100vh">
      <Paper withBorder shadow="md" p="xl" w={380} radius="md">
        <Title order={2} mb="md">
          Redefinir senha
        </Title>

        {!token && <Alert color="red">Link invalido: token nao encontrado.</Alert>}

        {success ? (
          <Stack>
            <Alert color="green">Senha redefinida com sucesso!</Alert>
            <Button component={Link} to="/login" fullWidth>
              Ir para o login
            </Button>
          </Stack>
        ) : (
          token && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                {error && <Alert color="red">{error}</Alert>}
                <PasswordInput
                  label="Nova senha"
                  {...register("password")}
                  error={errors.password?.message}
                />
                <PasswordInput
                  label="Confirmar senha"
                  {...register("confirmPassword")}
                  error={errors.confirmPassword?.message}
                />
                <Button type="submit" loading={isSubmitting} fullWidth>
                  Redefinir senha
                </Button>
              </Stack>
            </form>
          )
        )}
      </Paper>
    </Center>
  );
}
