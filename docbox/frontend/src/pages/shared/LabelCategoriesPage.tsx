import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Group,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPencil, IconPhoto, IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as labelsService from "../../services/labels.service";
import * as categoriesService from "../../services/categories.service";
import { useCanManageContent } from "../../hooks/usePermissions";
import { getErrorMessage } from "../../services/api";
import {
  CategoryFormModal,
  type CategoryFormValues,
} from "../../components/categories/CategoryFormModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { labelTypeToSlug } from "../../utils/labelType";
import type { Category } from "../../types";

export function LabelCategoriesPage() {
  const { labelId } = useParams<{ labelId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const canManage = useCanManageContent();

  const [formOpened, setFormOpened] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: label, isLoading } = useQuery({
    queryKey: ["labels", labelId],
    queryFn: () => labelsService.getById(labelId!),
    enabled: !!labelId,
  });

  const createMutation = useMutation({
    mutationFn: (values: CategoryFormValues) =>
      categoriesService.create({ labelId: labelId!, ...values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", labelId] });
      notifications.show({ message: "Categoria criada com sucesso", color: "green" });
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: CategoryFormValues }) =>
      categoriesService.update(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", labelId] });
      notifications.show({ message: "Categoria atualizada", color: "green" });
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", labelId] });
      notifications.show({ message: "Categoria excluida", color: "green" });
      setDeletingCategory(null);
    },
    onError: (err) => {
      notifications.show({ message: getErrorMessage(err), color: "red" });
      setDeletingCategory(null);
    },
  });

  function closeForm() {
    setFormOpened(false);
    setEditingCategory(null);
  }

  function handleFormSubmit(values: CategoryFormValues) {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  if (isLoading || !label) {
    return <Loader />;
  }

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor component={Link} to={`/produtos/${labelTypeToSlug(label.type)}`}>
          Produtos
        </Anchor>
        <Text>{label.name}</Text>
      </Breadcrumbs>

      <Group justify="space-between">
        <Group>
          <Avatar
            src={label.photoPath ? labelsService.photoUrl(label.id, label.photoPath) : null}
            radius="md"
            size={48}
          >
            <IconPhoto size={20} />
          </Avatar>
          <Title order={2}>{label.name}</Title>
        </Group>
        {canManage && (
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setEditingCategory(null);
              setFormOpened(true);
            }}
          >
            Nova categoria
          </Button>
        )}
      </Group>

      {label.categories.length === 0 && <Text c="dimmed">Nenhuma categoria cadastrada ainda.</Text>}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {label.categories.map((category) => (
          <Card
            key={category.id}
            withBorder
            shadow="sm"
            padding="lg"
            radius="md"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/labels/${labelId}/categories/${category.id}`)}
          >
            <Group justify="space-between" mb="xs" wrap="nowrap">
              <Text fw={500}>{category.name}</Text>
              <Badge>{category._count.documents} documentos</Badge>
            </Group>
            {category.description && (
              <Text size="sm" c="dimmed" mb="md">
                {category.description}
              </Text>
            )}
            {canManage && (
              <Group justify="flex-end" onClick={(event) => event.stopPropagation()}>
                <ActionIcon
                  variant="light"
                  onClick={() => {
                    setEditingCategory(category);
                    setFormOpened(true);
                  }}
                >
                  <IconPencil size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => setDeletingCategory(category)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            )}
          </Card>
        ))}
      </SimpleGrid>

      <CategoryFormModal
        opened={formOpened}
        category={editingCategory}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={closeForm}
      />

      <ConfirmDialog
        opened={!!deletingCategory}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${deletingCategory?.name}"? Todos os documentos vinculados a esta categoria serao excluidos permanentemente. Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deletingCategory && deleteMutation.mutate(deletingCategory.id)}
        onCancel={() => setDeletingCategory(null)}
      />
    </Stack>
  );
}
