import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Timeline,
  Title,
} from "@mantine/core";
import { IconCheck, IconDownload, IconEye, IconSend, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as qualityDocumentsService from "../../services/qualityDocuments.service";
import { useAuth } from "../../hooks/useAuth";
import { getErrorMessage } from "../../services/api";
import { ResubmitQualityDocumentModal } from "../../components/quality-documents/ResubmitQualityDocumentModal";
import type { ApproverOption } from "../../components/quality-documents/UploadQualityDocumentModal";
import { ROLE_LABELS } from "../../utils/roleLabels";
import { formatBytes } from "../../utils/formatBytes";
import { formatDate } from "../../utils/formatDate";
import {
  APPROVAL_EVENT_LABELS,
  APPROVAL_STATUS_COLORS,
  APPROVAL_STATUS_LABELS,
} from "../../utils/approvalStatus";
import { qualityDocumentTypeDisplayName, qualityDocumentTypeToSlug } from "../../utils/qualityDocumentType";

export function QualityDocumentApprovalPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [approverNote, setApproverNote] = useState("");
  const [resubmitOpened, setResubmitOpened] = useState(false);

  const {
    data: document,
    isLoading: isLoadingDocument,
    isError: documentError,
  } = useQuery({
    queryKey: ["quality-documents", "detail", documentId],
    queryFn: () => qualityDocumentsService.getById(documentId!),
    enabled: !!documentId,
    retry: false,
  });

  const { data: history } = useQuery({
    queryKey: ["quality-documents", "history", documentId],
    queryFn: () => qualityDocumentsService.getHistory(documentId!),
    enabled: !!documentId,
    retry: false,
  });

  const { data: approverUsers } = useQuery({
    queryKey: ["quality-documents", "approvers"],
    queryFn: qualityDocumentsService.listApprovers,
  });

  const approverOptions: ApproverOption[] = (approverUsers ?? []).map((approver) => ({
    value: approver.id,
    label: `${approver.badgeNumber} (${ROLE_LABELS[approver.role]})`,
  }));

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["quality-documents"] });
  }

  const decideMutation = useMutation({
    mutationFn: (input: { decision: "APROVAR" | "REPROVAR"; approverNote?: string }) =>
      qualityDocumentsService.decide(documentId!, input),
    onSuccess: (_, variables) => {
      invalidate();
      notifications.show({
        message: variables.decision === "APROVAR" ? "Documento aprovado" : "Documento reprovado",
        color: variables.decision === "APROVAR" ? "green" : "red",
      });
      setApproverNote("");
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const resubmitMutation = useMutation({
    mutationFn: (input: { approverId: string; requesterNote?: string; file?: File }) =>
      qualityDocumentsService.resubmit(documentId!, input),
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Documento reenviado para aprovacao", color: "green" });
      setResubmitOpened(false);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  if (isLoadingDocument) {
    return <Loader />;
  }

  if (documentError || !document) {
    return (
      <Stack>
        <Text c="dimmed">
          Documento não encontrado ou você não tem permissão para visualizá-lo.
        </Text>
      </Stack>
    );
  }

  const isDesignatedApprover = user?.id === document.currentApproverId || user?.role === "ADMIN";
  const canDecide = document.approvalStatus === "PENDENTE_APROVACAO" && isDesignatedApprover;
  const isRequester = user?.id === document.currentRequesterId;
  const canResubmit = document.approvalStatus === "NAO_APROVADO" && isRequester;

  const latestRequestEvent = history
    ? [...history].reverse().find((event) => event.eventType === "SOLICITACAO" || event.eventType === "REENVIO")
    : undefined;

  return (
    <Stack>
      <Breadcrumbs>
        <Anchor
          component={Link}
          to={`/qualidade/${qualityDocumentTypeToSlug(document.type)}`}
        >
          Gestão de Qualidade
        </Anchor>
        <Text>{document.title}</Text>
      </Breadcrumbs>

      <Group justify="space-between">
        <div>
          <Text size="sm" c="dimmed">
            {qualityDocumentTypeDisplayName(document.type)}
          </Text>
          <Title order={2}>{document.title}</Title>
        </div>
        <Badge color={APPROVAL_STATUS_COLORS[document.approvalStatus]} size="lg">
          {APPROVAL_STATUS_LABELS[document.approvalStatus]}
        </Badge>
      </Group>

      <Card withBorder padding="lg" radius="md">
        <Stack gap="xs">
          <Text size="sm">
            <strong>Solicitado por:</strong> {document.uploadedBy.badgeNumber}
          </Text>
          {latestRequestEvent && (
            <>
              <Text size="sm">
                <strong>Data da solicitação:</strong> {formatDate(latestRequestEvent.createdAt)}
              </Text>
              {latestRequestEvent.note && (
                <Text size="sm">
                  <strong>Observação do solicitante:</strong> {latestRequestEvent.note}
                </Text>
              )}
            </>
          )}
          <Text size="sm">
            <strong>Arquivo:</strong> {document.originalName} ({formatBytes(document.sizeBytes)})
          </Text>

          <Group mt="xs">
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
          </Group>
        </Stack>
      </Card>

      {canDecide && (
        <Card withBorder padding="lg" radius="md">
          <Stack>
            <Title order={4}>Decisão</Title>
            <Textarea
              label="Observação do aprovador"
              description="Obrigatória ao não aprovar, opcional ao aprovar"
              value={approverNote}
              onChange={(event) => setApproverNote(event.currentTarget.value)}
              autosize
              minRows={2}
            />
            <Group>
              <Button
                color="green"
                leftSection={<IconCheck size={16} />}
                loading={decideMutation.isPending}
                onClick={() =>
                  decideMutation.mutate({ decision: "APROVAR", approverNote: approverNote.trim() || undefined })
                }
              >
                Aprovar
              </Button>
              <Button
                color="red"
                variant="light"
                leftSection={<IconX size={16} />}
                loading={decideMutation.isPending}
                onClick={() => {
                  if (!approverNote.trim()) {
                    notifications.show({
                      message: "Informe uma observação para reprovar o documento",
                      color: "red",
                    });
                    return;
                  }
                  decideMutation.mutate({ decision: "REPROVAR", approverNote: approverNote.trim() });
                }}
              >
                Não Aprovar
              </Button>
            </Group>
          </Stack>
        </Card>
      )}

      {canResubmit && (
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Este documento foi reprovado. Voce pode editar e reenviar para uma nova aprovacao.
            </Text>
            <Button leftSection={<IconSend size={16} />} onClick={() => setResubmitOpened(true)}>
              Reenviar
            </Button>
          </Group>
        </Card>
      )}

      {history && history.length > 0 && (
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="md">
            Histórico
          </Title>
          <Timeline active={history.length}>
            {history.map((event) => (
              <Timeline.Item key={event.id} title={APPROVAL_EVENT_LABELS[event.eventType]}>
                <Text size="sm" c="dimmed">
                  {event.user.badgeNumber} — {formatDate(event.createdAt)}
                </Text>
                {event.note && <Text size="sm">{event.note}</Text>}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      <ResubmitQualityDocumentModal
        opened={resubmitOpened}
        loading={resubmitMutation.isPending}
        approverOptions={approverOptions}
        onSubmit={(input) => resubmitMutation.mutate(input)}
        onClose={() => setResubmitOpened(false)}
      />
    </Stack>
  );
}
