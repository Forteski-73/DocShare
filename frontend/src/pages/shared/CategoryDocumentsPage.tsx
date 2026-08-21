import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Breadcrumbs,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  IconDownload,
  IconEye,
  IconMailForward,
  IconPhoto,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as categoriesService from "../../services/categories.service";
import * as documentsService from "../../services/documents.service";
import * as labelsService from "../../services/labels.service";
import { useCanManageContent } from "../../hooks/usePermissions";
import { getErrorMessage } from "../../services/api";
import { UploadDocumentModal } from "../../components/documents/UploadDocumentModal";
import { NotifyDocumentModal } from "../../components/documents/NotifyDocumentModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatBytes } from "../../utils/formatBytes";
import { formatDate } from "../../utils/formatDate";
import { labelTypeToSlug } from "../../utils/labelType";
import type { DocumentItem } from "../../types";

export function CategoryDocumentsPage() {
  const { labelId, categoryId } = useParams<{ labelId: string; categoryId: string }>();
  const [searchParams] = useSearchParams();
  const highlightedDocumentId = searchParams.get("documentId");
  const queryClient = useQueryClient();
  const canManage = useCanManageContent();

  const [uploadOpened, setUploadOpened] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<DocumentItem | null>(null);
  const [notifyingDocument, setNotifyingDocument] = useState<DocumentItem | null>(null);

  const { data: category, isLoading } = useQuery({
    queryKey: ["categories", categoryId],
    queryFn: () => categoriesService.getById(categoryId!),
    enabled: !!categoryId,
  });

  const uploadMutation = useMutation({
    mutationFn: (input: { file: File; notify: boolean }) =>
      documentsService.upload({ categoryId: categoryId!, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", categoryId] });
      notifications.show({ message: "Documento enviado com sucesso", color: "green" });
      setUploadOpened(false);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: documentsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", categoryId] });
      notifications.show({ message: "Documento excluido", color: "green" });
      setDeletingDocument(null);
    },
    onError: (err) => {
      notifications.show({ message: getErrorMessage(err), color: "red" });
      setDeletingDocument(null);
    },
  });

  const notifyMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: { toAll: boolean; userIds?: string[] } }) =>
      documentsService.notify(id, input),
    onSuccess: (recipientCount) => {
      notifications.show({
        message: `E-mail enviado para ${recipientCount} usuario(s)`,
        color: "green",
      });
      setNotifyingDocument(null);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  if (isLoading || !category) {
    return <Loader />;
  }

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor component={Link} to={`/produtos/${labelTypeToSlug(category.label.type)}`}>
          Produtos
        </Anchor>
        <Anchor component={Link} to={`/labels/${labelId}`}>
          {category.label.name}
        </Anchor>
        <Text>{category.name}</Text>
      </Breadcrumbs>

      <Group justify="space-between">
        <Group>
          <Avatar
            src={
              category.label.photoPath
                ? labelsService.photoUrl(category.label.id, category.label.photoPath)
                : null
            }
            radius="md"
            size={48}
          >
            <IconPhoto size={20} />
          </Avatar>
          <div>
            <Text size="xs" c="dimmed">
              {category.label.name}
            </Text>
            <Title order={2}>{category.name}</Title>
          </div>
        </Group>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setUploadOpened(true)}>
            Enviar documento
          </Button>
        )}
      </Group>

      {category.documents.length === 0 ? (
        <Text c="dimmed">Nenhum documento nesta categoria ainda.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Tamanho</Table.Th>
              <Table.Th>Enviado por</Table.Th>
              <Table.Th>Data</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {category.documents.map((document) => (
              <Table.Tr
                key={document.id}
                bg={document.id === highlightedDocumentId ? "blue.0" : undefined}
              >
                <Table.Td>{document.originalName}</Table.Td>
                <Table.Td>{formatBytes(document.sizeBytes)}</Table.Td>
                <Table.Td>{document.uploadedBy.badgeNumber}</Table.Td>
                <Table.Td>{formatDate(document.createdAt)}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      component="a"
                      href={documentsService.viewUrl(document.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="light"
                      aria-label="Visualizar"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      component="a"
                      href={documentsService.downloadUrl(document.id)}
                      variant="light"
                      aria-label="Baixar"
                    >
                      <IconDownload size={16} />
                    </ActionIcon>
                    {canManage && (
                      <>
                        <ActionIcon
                          variant="light"
                          aria-label="Reenviar por e-mail"
                          onClick={() => setNotifyingDocument(document)}
                        >
                          <IconMailForward size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="light"
                          color="red"
                          aria-label="Excluir"
                          onClick={() => setDeletingDocument(document)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <UploadDocumentModal
        opened={uploadOpened}
        loading={uploadMutation.isPending}
        onSubmit={(input) => uploadMutation.mutate(input)}
        onClose={() => setUploadOpened(false)}
      />

      <NotifyDocumentModal
        opened={!!notifyingDocument}
        document={notifyingDocument}
        loading={notifyMutation.isPending}
        onSubmit={(input) =>
          notifyingDocument && notifyMutation.mutate({ id: notifyingDocument.id, input })
        }
        onClose={() => setNotifyingDocument(null)}
      />

      <ConfirmDialog
        opened={!!deletingDocument}
        title="Excluir documento"
        message={`Tem certeza que deseja excluir "${deletingDocument?.originalName}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deletingDocument && deleteMutation.mutate(deletingDocument.id)}
        onCancel={() => setDeletingDocument(null)}
      />
    </Stack>
  );
}
