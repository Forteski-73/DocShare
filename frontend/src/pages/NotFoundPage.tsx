import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Center h="100vh">
      <Stack align="center">
        <Title order={2}>Pagina nao encontrada</Title>
        <Text c="dimmed">O endereco acessado nao existe.</Text>
        <Button component={Link} to="/labels">
          Voltar para o inicio
        </Button>
      </Stack>
    </Center>
  );
}
