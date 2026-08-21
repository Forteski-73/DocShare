import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Image,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconPencil, IconPhoto, IconPlus, IconSearch, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "react-router-dom";
import * as labelsService from "../../services/labels.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/api";
import { LabelFormModal, type LabelFormValues } from "../../components/labels/LabelFormModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  isLabelTypeSlug,
  labelTypeDisplayName,
  labelTypeSlugToType,
  type LabelTypeSlug,
} from "../../utils/labelType";
import type { Label } from "../../types";

export function LabelsBrowsePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { type: typeParam } = useParams<{ type: string }>();
  const slug: LabelTypeSlug = isLabelTypeSlug(typeParam) ? typeParam : "piso-laminado";
  const type = labelTypeSlugToType(slug);
  const typeDisplayName = labelTypeDisplayName(type);
  const [formOpened, setFormOpened] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [search, setSearch] = useState("");

  const { data: labels, isLoading } = useQuery({
    queryKey: ["labels", type],
    queryFn: () => labelsService.list({ type }),
  });

  function invalidateLabels() {
    queryClient.invalidateQueries({ queryKey: ["labels", type] });
  }

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => labelsService.uploadPhoto(id, file),
    onSuccess: invalidateLabels,
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const removePhotoMutation = useMutation({
    mutationFn: labelsService.removePhoto,
    onSuccess: () => {
      invalidateLabels();
      notifications.show({ message: "Foto removida", color: "green" });
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const createMutation = useMutation({
    mutationFn: labelsService.create,
    onSuccess: (newLabel) => {
      invalidateLabels();
      notifications.show({ message: "Produto criado com sucesso", color: "green" });
      if (pendingPhoto) {
        uploadPhotoMutation.mutate({ id: newLabel.id, file: pendingPhoto });
      }
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: LabelFormValues }) =>
      labelsService.update(id, values),
    onSuccess: () => {
      invalidateLabels();
      notifications.show({ message: "Produto atualizado", color: "green" });
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: labelsService.remove,
    onSuccess: () => {
      invalidateLabels();
      notifications.show({ message: "Produto excluido", color: "green" });
      setDeletingLabel(null);
    },
    onError: (err) => {
      notifications.show({ message: getErrorMessage(err), color: "red" });
      setDeletingLabel(null);
    },
  });

  function closeForm() {
    setFormOpened(false);
    setEditingLabel(null);
    setPendingPhoto(null);
  }

  function handleFormSubmit(values: LabelFormValues, photo: File | null) {
    if (editingLabel) {
      updateMutation.mutate({ id: editingLabel.id, values });
      if (photo) {
        uploadPhotoMutation.mutate({ id: editingLabel.id, file: photo });
      }
    } else {
      setPendingPhoto(photo);
      createMutation.mutate({ ...values, type });
    }
  }

  if (isLoading) {
    return <Loader />;
  }

  const filteredLabels = labels?.filter((label) =>
    label.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Stack>
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed">
            Produtos
          </Text>
          <Title order={2}>{typeDisplayName}</Title>
        </div>
        {user?.role === "ADMIN" && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingLabel(null);
              setFormOpened(true);
            }}
          >
            Novo produto
          </Button>
        )}
      </Group>

      <TextInput
        placeholder="Pesquisar produtos"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => setSearch(event.currentTarget.value)}
        maw={360}
      />

      {labels?.length === 0 && <Text c="dimmed">Nenhum produto cadastrado ainda.</Text>}
      {labels && labels.length > 0 && filteredLabels?.length === 0 && (
        <Text c="dimmed">Nenhum produto encontrado para "{search}".</Text>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {filteredLabels?.map((label) => (
          <Card
            key={label.id}
            withBorder
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/labels/${label.id}`)}
          >
            <Card.Section>
              {label.photoPath ? (
                <Image
                  src={labelsService.photoUrl(label.id, label.photoPath)}
                  h={140}
                  alt={label.name}
                />
              ) : (
                <Center h={140} bg="gray.1">
                  <IconPhoto size={32} color="var(--mantine-color-gray-5)" />
                </Center>
              )}
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs" wrap="nowrap">
              <Text fw={500}>{label.name}</Text>
              <Badge>{label._count?.categories ?? 0} categorias</Badge>
            </Group>
            {label.description && (
              <Text size="sm" c="dimmed" mb="md">
                {label.description}
              </Text>
            )}
            {user?.role === "ADMIN" && (
              <Group justify="flex-end" onClick={(event) => event.stopPropagation()}>
                <ActionIcon
                  variant="light"
                  onClick={() => {
                    setEditingLabel(label);
                    setFormOpened(true);
                  }}
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon variant="light" color="red" onClick={() => setDeletingLabel(label)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            )}
          </Card>
        ))}
      </SimpleGrid>

      <LabelFormModal
        opened={formOpened}
        label={editingLabel}
        loading={createMutation.isPending || updateMutation.isPending}
        photoRemoving={removePhotoMutation.isPending}
        onSubmit={handleFormSubmit}
        onRemovePhoto={() => editingLabel && removePhotoMutation.mutate(editingLabel.id)}
        onClose={closeForm}
      />

      <ConfirmDialog
        opened={!!deletingLabel}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${deletingLabel?.name}"? Todas as categorias e documentos vinculados a este produto serao excluidos permanentemente. Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deletingLabel && deleteMutation.mutate(deletingLabel.id)}
        onCancel={() => setDeletingLabel(null)}
      />
    </Stack>
  );
}
