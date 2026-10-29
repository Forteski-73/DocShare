import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <Center h="100vh">
      <Stack align="center">
        <Title order={2}>Acesso nao autorizado</Title>
        <Text c="dimmed">Voce nao tem permissao para acessar esta pagina.</Text>
        <Button component={Link} to="/labels">
          Voltar para o inicio
        </Button>
      </Stack>
    </Center>
  );
}
