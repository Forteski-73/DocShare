import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Group,
  Loader,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconDownload,
  IconEye,
  IconMailForward,
  IconPhoto,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as documentsService from "../../services/documents.service";
import * as labelsService from "../../services/labels.service";
import { getErrorMessage } from "../../services/api";
import { NotifyDocumentModal } from "../../components/documents/NotifyDocumentModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatBytes } from "../../utils/formatBytes";
import { formatDate } from "../../utils/formatDate";
import type { DocumentItem } from "../../types";

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [notifyingDocument, setNotifyingDocument] = useState<DocumentItem | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["documents", "all", page, search],
    queryFn: () => documentsService.list({ page, pageSize: 20, search: search || undefined }),
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

  const deleteMutation = useMutation({
    mutationFn: documentsService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "all"] });
      notifications.show({ message: "Documento excluido", color: "green" });
      setDeletingDocument(null);
    },
    onError: (err) => {
      notifications.show({ message: getErrorMessage(err), color: "red" });
      setDeletingDocument(null);
    },
  });

  return (
    <Stack>
      <Title order={2}>Documentos</Title>

      <TextInput
        placeholder="Buscar por nome do documento"
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          setPage(1);
        }}
        maw={360}
      />

      {isLoading || !data ? (
        <Loader />
      ) : data.data.length === 0 ? (
        <Text c="dimmed">Nenhum documento encontrado.</Text>
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Produto</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th>Tamanho</Table.Th>
                <Table.Th>Enviado por</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.data.map((document) => (
                <Table.Tr key={document.id}>
                  <Table.Td>{document.originalName}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Avatar
                        src={
                          document.category?.label.photoPath
                            ? labelsService.photoUrl(
                                document.category.label.id,
                                document.category.label.photoPath
                              )
                            : null
                        }
                        radius="sm"
                        size={24}
                      >
                        <IconPhoto size={12} />
                      </Avatar>
                      <Anchor
                        component={Link}
                        to={`/labels/${document.category?.label.id}`}
                        size="sm"
                      >
                        {document.category?.label.name}
                      </Anchor>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Anchor
                      component={Link}
                      to={`/labels/${document.category?.label.id}/categories/${document.category?.id}`}
                      size="sm"
                    >
                      {document.category?.name}
                    </Anchor>
                  </Table.Td>
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
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group justify="center">
            <Pagination
              total={Math.max(1, Math.ceil(data.total / data.pageSize))}
              value={page}
              onChange={setPage}
            />
          </Group>
        </>
      )}

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
