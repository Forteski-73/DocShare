import { useEffect, useState } from "react";
import { Button, FileInput, Modal, Select, Stack, Text, Textarea } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import type { ApproverOption } from "./UploadQualityDocumentModal";

type ResubmitQualityDocumentModalProps = {
  opened: boolean;
  loading?: boolean;
  approverOptions: ApproverOption[];
  onSubmit: (input: { approverId: string; requesterNote?: string; file?: File }) => void;
  onClose: () => void;
};

export function ResubmitQualityDocumentModal({
  opened,
  loading,
  approverOptions,
  onSubmit,
  onClose,
}: ResubmitQualityDocumentModalProps) {
  const [approverId, setApproverId] = useState<string | null>(null);
  const [requesterNote, setRequesterNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (opened) {
      setApproverId(null);
      setRequesterNote("");
      setFile(null);
    }
  }, [opened]);

  function handleSubmit() {
    if (!approverId) return;
    onSubmit({ approverId, requesterNote: requesterNote.trim() || undefined, file: file ?? undefined });
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Reenviar para aprovacao" centered>
      <Stack>
        <Text size="sm" c="dimmed">
          Escolha um aprovador (pode ser o mesmo ou outro). Se quiser, envie um novo arquivo — caso
          contrario o arquivo atual sera mantido.
        </Text>
        <Select
          label="Aprovador"
          placeholder="Selecione quem vai aprovar este documento"
          data={approverOptions}
          value={approverId}
          onChange={setApproverId}
          searchable
        />
        <FileInput
          label="Novo arquivo (opcional)"
          placeholder="Selecione um arquivo (PDF, DOC/DOCX, XLS/XLSX)"
          leftSection={<IconUpload size={16} />}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          value={file}
          onChange={setFile}
          clearable
        />
        <Textarea
          label="Observacao (opcional)"
          placeholder="Contextualize o reenvio, se necessario"
          value={requesterNote}
          onChange={(event) => setRequesterNote(event.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Button onClick={handleSubmit} disabled={!approverId} loading={loading} fullWidth>
          Reenviar
        </Button>
      </Stack>
    </Modal>
  );
}
