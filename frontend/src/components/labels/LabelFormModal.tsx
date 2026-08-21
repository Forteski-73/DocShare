import { useEffect, useState } from "react";
import { Avatar, Button, FileInput, Group, Modal, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import * as labelsService from "../../services/labels.service";
import type { Label } from "../../types";

export type LabelFormValues = { name: string; description: string };

type LabelFormModalProps = {
  opened: boolean;
  label?: Label | null;
  loading?: boolean;
  photoRemoving?: boolean;
  onSubmit: (values: LabelFormValues, photo: File | null) => void;
  onRemovePhoto?: () => void;
  onClose: () => void;
};

export function LabelFormModal({
  opened,
  label,
  loading,
  photoRemoving,
  onSubmit,
  onRemovePhoto,
  onClose,
}: LabelFormModalProps) {
  const [photo, setPhoto] = useState<File | null>(null);

  const form = useForm<LabelFormValues>({
    initialValues: { name: "", description: "" },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Informe o nome" : null),
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({ name: label?.name ?? "", description: label?.description ?? "" });
      setPhoto(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, label]);

  function handleSubmit(values: LabelFormValues) {
    onSubmit(values, photo);
  }

  const photoPreviewUrl = photo
    ? URL.createObjectURL(photo)
    : label?.photoPath
      ? labelsService.photoUrl(label.id, label.photoPath)
      : null;

  return (
    <Modal opened={opened} onClose={onClose} title={label ? "Editar produto" : "Novo produto"} centered>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Ex: Produto X - linha 2026"
            data-autofocus
            {...form.getInputProps("name")}
          />
          <Textarea label="Descricao" placeholder="Opcional" {...form.getInputProps("description")} />

          <Group align="flex-end">
            <Avatar src={photoPreviewUrl} radius="md" size={64}>
              <IconPhoto size={24} />
            </Avatar>
            <div style={{ flex: 1 }}>
              <FileInput
                label="Foto do produto"
                placeholder="Selecione uma imagem (JPG, PNG ou WEBP)"
                leftSection={<IconUpload size={16} />}
                accept="image/jpeg,image/png,image/webp"
                value={photo}
                onChange={setPhoto}
                clearable
              />
              {label?.photoPath && !photo && onRemovePhoto && (
                <Text
                  size="xs"
                  c="red"
                  mt={4}
                  style={{ cursor: "pointer" }}
                  onClick={onRemovePhoto}
                >
                  <IconX size={12} style={{ verticalAlign: "middle" }} /> Remover foto atual
                  {photoRemoving ? "..." : ""}
                </Text>
              )}
            </div>
          </Group>

          <Button type="submit" loading={loading} fullWidth>
            {label ? "Salvar" : "Criar"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
