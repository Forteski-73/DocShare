import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Button, ColorInput, FileInput, Group, Stack, Text, Title } from "@mantine/core";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as settingsService from "../../services/settings.service";
import { getErrorMessage } from "../../services/api";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [headerColor, setHeaderColor] = useState("");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.get,
  });

  useEffect(() => {
    if (settings) {
      setHeaderColor(settings.headerColor);
    }
  }, [settings]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["settings"] });
  }

  const uploadMutation = useMutation({
    mutationFn: settingsService.uploadLogo,
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Logo atualizado com sucesso", color: "green" });
      setLogoFile(null);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const removeMutation = useMutation({
    mutationFn: settingsService.removeLogo,
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Logo removido", color: "green" });
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const headerColorMutation = useMutation({
    mutationFn: settingsService.updateHeaderColor,
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Cor do cabeçalho atualizada", color: "green" });
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  if (isLoading || !settings) {
    return null;
  }

  const previewUrl = logoFile
    ? URL.createObjectURL(logoFile)
    : settings.logoPath
      ? settingsService.logoUrl(settings.logoPath)
      : null;

  return (
    <Stack maw={480}>
      <Title order={2}>Configurações</Title>

      <Stack gap="xs">
        <Text fw={500} size="sm">
          Logo da empresa
        </Text>
        <Text size="xs" c="dimmed">
          Exibido no cabeçalho do sistema para todos os usuários. Formatos aceitos: JPG, PNG ou
          WEBP, até 5MB.
        </Text>

        <Group align="flex-end">
          <Avatar src={previewUrl} radius="md" size={72}>
            <IconPhoto size={28} />
          </Avatar>
          <div style={{ flex: 1 }}>
            <FileInput
              placeholder="Selecione uma imagem"
              leftSection={<IconUpload size={16} />}
              accept="image/jpeg,image/png,image/webp"
              value={logoFile}
              onChange={setLogoFile}
              clearable
            />
          </div>
        </Group>

        <Group>
          <Button
            disabled={!logoFile}
            loading={uploadMutation.isPending}
            onClick={() => logoFile && uploadMutation.mutate(logoFile)}
          >
            Salvar logo
          </Button>
          {settings.logoPath && (
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={removeMutation.isPending}
              onClick={() => removeMutation.mutate()}
            >
              Remover logo
            </Button>
          )}
        </Group>
      </Stack>

      <Stack gap="xs">
        <Text fw={500} size="sm">
          Cor do cabeçalho
        </Text>
        <Text size="xs" c="dimmed">
          Cor de fundo do cabeçalho do sistema.
        </Text>

        <ColorInput value={headerColor} onChange={setHeaderColor} format="hex" />

        <Group>
          <Button
            disabled={!headerColor || headerColor === settings.headerColor}
            loading={headerColorMutation.isPending}
            onClick={() => headerColorMutation.mutate(headerColor)}
          >
            Salvar cor
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
