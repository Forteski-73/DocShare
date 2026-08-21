import { useEffect, useState } from "react";
import { Avatar, Button, FileInput, Group, Modal, Stack, Text } from "@mantine/core";
import { IconTrash, IconUpload, IconUserCircle } from "@tabler/icons-react";
import * as authService from "../../services/auth.service";
import type { CurrentUser } from "../../types";

type ProfileAvatarModalProps = {
  opened: boolean;
  user: CurrentUser | null;
  loading?: boolean;
  removing?: boolean;
  onSubmit: (file: File) => void;
  onRemove: () => void;
  onClose: () => void;
};

export function ProfileAvatarModal({
  opened,
  user,
  loading,
  removing,
  onSubmit,
  onRemove,
  onClose,
}: ProfileAvatarModalProps) {
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (opened) {
      setFile(null);
    }
  }, [opened]);

  const previewUrl = file
    ? URL.createObjectURL(file)
    : user?.avatarPath
      ? authService.avatarUrl(user.avatarPath)
      : null;

  return (
    <Modal opened={opened} onClose={onClose} title="Foto de perfil" centered>
      <Stack>
        <Group justify="center">
          <Avatar src={previewUrl} radius="xl" size={96}>
            <IconUserCircle size={40} />
          </Avatar>
        </Group>

        <FileInput
          label="Nova foto"
          placeholder="Selecione uma imagem (JPG, PNG ou WEBP)"
          leftSection={<IconUpload size={16} />}
          accept="image/jpeg,image/png,image/webp"
          value={file}
          onChange={setFile}
          clearable
        />
        <Text size="xs" c="dimmed">
          Tamanho maximo: 5MB
        </Text>

        <Group grow>
          <Button disabled={!file} loading={loading} onClick={() => file && onSubmit(file)}>
            Salvar foto
          </Button>
          {user?.avatarPath && (
            <Button
              variant="light"
              color="red"
              leftSection={<IconTrash size={16} />}
              loading={removing}
              onClick={onRemove}
            >
              Remover foto
            </Button>
          )}
        </Group>
      </Stack>
    </Modal>
  );
}
