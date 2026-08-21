import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  SegmentedControl,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { IconDownload, IconEye, IconPlus, IconSend, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as qualityDocumentsService from "../../services/qualityDocuments.service";
import { useAuth } from "../../hooks/useAuth";
import { useCanManageContent } from "../../hooks/usePermissions";
import { getErrorMessage } from "../../services/api";
import { ROLE_LABELS } from "../../utils/roleLabels";
import {
  UploadQualityDocumentModal,
  type ApproverOption,
} from "../../components/quality-documents/UploadQualityDocumentModal";
import { ResubmitQualityDocumentModal } from "../../components/quality-documents/ResubmitQualityDocumentModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { formatBytes } from "../../utils/formatBytes";
import { formatDate } from "../../utils/formatDate";
import { APPROVAL_STATUS_COLORS, APPROVAL_STATUS_LABELS } from "../../utils/approvalStatus";
import {
  isQualityDocumentTypeSlug,
  qualityDocumentTypeDisplayName,
  qualityDocumentTypeSlugToType,
  type QualityDocumentTypeSlug,
} from "../../utils/qualityDocumentType";
import type { QualityDocument } from "../../types";

export function QualityDocumentsPage() {
  const { type: typeParam } = useParams<{ type: string }>();
  const slug: QualityDocumentTypeSlug = isQualityDocumentTypeSlug(typeParam)
    ? typeParam
    : "formularios";
  const type = qualityDocumentTypeSlugToType(slug);
  const typeDisplayName = qualityDocumentTypeDisplayName(type);
  const { user } = useAuth();
  const canManage = useCanManageContent();
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("active");
  const [uploadOpened, setUploadOpened] = useState(false);
  const [resubmittingDocument, setResubmittingDocument] = useState<QualityDocument | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<QualityDocument | null>(null);

  const active = activeFilter === "all" ? undefined : activeFilter === "active";

  const { data: documents, isLoading } = useQuery({
    queryKey: ["quality-documents", type, activeFilter],
    queryFn: () => qualityDocumentsService.list({ type, active }),
  });

  const { data: approverUsers } = useQuery({
    queryKey: ["quality-documents", "approvers"],
    queryFn: qualityDocumentsService.listApprovers,
    enabled: canManage,
  });

  const approverOptions: ApproverOption[] = (approverUsers ?? []).map((approver) => ({
    value: approver.id,
    label: `${approver.badgeNumber} (${ROLE_LABELS[approver.role]})`,
  }));

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["quality-documents", type] });
  }

  const uploadMutation = useMutation({
    mutationFn: (input: { title: string; approverId: string; requesterNote?: string; file: File }) =>
      qualityDocumentsService.upload({ ...input, type }),
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Documento enviado para aprovacao", color: "green" });
      setUploadOpened(false);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const resubmitMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: { approverId: string; requesterNote?: string; file?: File };
    }) => qualityDocumentsService.resubmit(id, input),
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Documento reenviado para aprovacao", color: "green" });
      setResubmittingDocument(null);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, nextActive }: { id: string; nextActive: boolean }) =>
      qualityDocumentsService.toggleActive(id, nextActive),
    onSuccess: invalidate,
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const deleteMutation = useMutation({
    mutationFn: qualityDocumentsService.remove,
    onSuccess: () => {
      invalidate();
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
      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed">
            Gestão de Qualidade
          </Text>
          <Title order={2}>{typeDisplayName}</Title>
        </div>
        {canManage && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setUploadOpened(true)}>
            Enviar documento
          </Button>
        )}
      </Group>

      <SegmentedControl
        value={activeFilter}
        onChange={(value) => setActiveFilter(value as "all" | "active" | "inactive")}
        data={[
          { label: "Ativos", value: "active" },
          { label: "Inativos", value: "inactive" },
          { label: "Todos", value: "all" },
        ]}
        maw={320}
      />

      {isLoading || !documents ? (
        <Loader />
      ) : documents.length === 0 ? (
        <Text c="dimmed">Nenhum documento encontrado.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Titulo</Table.Th>
              <Table.Th>Tamanho</Table.Th>
              <Table.Th>Enviado por</Table.Th>
              <Table.Th>Data</Table.Th>
              <Table.Th>Aprovação</Table.Th>
              <Table.Th>Ativo</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((document) => {
              const isRequester = document.currentRequesterId === user?.id;
              return (
                <Table.Tr key={document.id}>
                  <Table.Td>
                    <Anchor component={Link} to={`/qualidade/aprovacoes/${document.id}`} size="sm">
                      {document.title}
                    </Anchor>
                  </Table.Td>
                  <Table.Td>{formatBytes(document.sizeBytes)}</Table.Td>
                  <Table.Td>{document.uploadedBy.badgeNumber}</Table.Td>
                  <Table.Td>{formatDate(document.createdAt)}</Table.Td>
                  <Table.Td>
                    <Badge color={APPROVAL_STATUS_COLORS[document.approvalStatus]}>
                      {APPROVAL_STATUS_LABELS[document.approvalStatus]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {canManage ? (
                      <Switch
                        checked={document.active}
                        onChange={(event) =>
                          toggleActiveMutation.mutate({
                            id: document.id,
                            nextActive: event.currentTarget.checked,
                          })
                        }
                      />
                    ) : (
                      <Badge color={document.active ? "green" : "gray"}>
                        {document.active ? "Ativo" : "Inativo"}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <ActionIcon
                        component="a"
                        href={qualityDocumentsService.viewUrl(document.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="light"
                        aria-label="Visualizar"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon
                        component="a"
                        href={qualityDocumentsService.downloadUrl(document.id)}
                        variant="light"
                        aria-label="Baixar"
                      >
                        <IconDownload size={16} />
                      </ActionIcon>
                      {document.approvalStatus === "NAO_APROVADO" && isRequester && (
                        <ActionIcon
                          variant="light"
                          color="blue"
                          aria-label="Reenviar para aprovacao"
                          onClick={() => setResubmittingDocument(document)}
                        >
                          <IconSend size={16} />
                        </ActionIcon>
                      )}
                      {canManage && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          aria-label="Excluir"
                          onClick={() => setDeletingDocument(document)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}

      <UploadQualityDocumentModal
        opened={uploadOpened}
        loading={uploadMutation.isPending}
        approverOptions={approverOptions}
        onSubmit={(input) => uploadMutation.mutate(input)}
        onClose={() => setUploadOpened(false)}
      />

      <ResubmitQualityDocumentModal
        opened={!!resubmittingDocument}
        loading={resubmitMutation.isPending}
        approverOptions={approverOptions}
        onSubmit={(input) =>
          resubmittingDocument && resubmitMutation.mutate({ id: resubmittingDocument.id, input })
        }
        onClose={() => setResubmittingDocument(null)}
      />

      <ConfirmDialog
        opened={!!deletingDocument}
        title="Excluir documento"
        message={`Tem certeza que deseja excluir "${deletingDocument?.title}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deletingDocument && deleteMutation.mutate(deletingDocument.id)}
        onCancel={() => setDeletingDocument(null)}
      />
    </Stack>
  );
}
