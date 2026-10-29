import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Erro nao tratado na interface:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Center h="100vh">
          <Stack align="center" maw={420}>
            <Title order={2}>Algo deu errado</Title>
            <Text c="dimmed" ta="center">
              Ocorreu um erro inesperado ao carregar esta pagina. Tente recarregar.
            </Text>
            <Button onClick={() => window.location.reload()}>Recarregar pagina</Button>
          </Stack>
        </Center>
      );
    }

    return this.props.children;
  }
}
