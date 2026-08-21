import { useState } from "react";
import { Button, FileInput, Modal, Select, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";

export type ApproverOption = { value: string; label: string };

type UploadQualityDocumentModalProps = {
  opened: boolean;
  loading?: boolean;
  approverOptions: ApproverOption[];
  onSubmit: (input: { title: string; approverId: string; requesterNote?: string; file: File }) => void;
  onClose: () => void;
};

export function UploadQualityDocumentModal({
  opened,
  loading,
  approverOptions,
  onSubmit,
  onClose,
}: UploadQualityDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [approverId, setApproverId] = useState<string | null>(null);
  const [requesterNote, setRequesterNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit() {
    if (!title.trim() || !approverId || !file) return;
    onSubmit({
      title: title.trim(),
      approverId,
      requesterNote: requesterNote.trim() || undefined,
      file,
    });
  }

  function handleClose() {
    setTitle("");
    setApproverId(null);
    setRequesterNote("");
    setFile(null);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Enviar documento" centered>
      <Stack>
        <TextInput
          label="Titulo"
          placeholder="Ex: Ficha de inspecao de recebimento"
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          data-autofocus
        />
        <FileInput
          label="Arquivo"
          placeholder="Selecione um arquivo (PDF, DOC/DOCX, XLS/XLSX)"
          leftSection={<IconUpload size={16} />}
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          value={file}
          onChange={setFile}
          clearable
        />
        <Text size="xs" c="dimmed">
          Tamanho maximo: 20MB
        </Text>
        <Select
          label="Aprovador"
          placeholder="Selecione quem vai aprovar este documento"
          data={approverOptions}
          value={approverId}
          onChange={setApproverId}
          searchable
        />
        <Textarea
          label="Observacao (opcional)"
          placeholder="Contextualize o pedido para o aprovador, se necessario"
          value={requesterNote}
          onChange={(event) => setRequesterNote(event.currentTarget.value)}
          autosize
          minRows={2}
        />
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !approverId || !file}
          loading={loading}
          fullWidth
        >
          Enviar para aprovacao
        </Button>
      </Stack>
    </Modal>
  );
}
