import { useState } from "react";
import { Button, Checkbox, FileInput, Modal, Stack, Text } from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";

type UploadDocumentModalProps = {
  opened: boolean;
  loading?: boolean;
  onSubmit: (input: { file: File; notify: boolean }) => void;
  onClose: () => void;
};

export function UploadDocumentModal({
  opened,
  loading,
  onSubmit,
  onClose,
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notify, setNotify] = useState(false);

  function handleSubmit() {
    if (!file) return;
    onSubmit({ file, notify });
  }

  function handleClose() {
    setFile(null);
    setNotify(false);
    onClose();
  }

  return (
    <Modal opened={opened} onClose={handleClose} title="Enviar documento" centered>
      <Stack>
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
        <Checkbox
          label="Notificar todos os usuarios cadastrados por e-mail"
          checked={notify}
          onChange={(event) => setNotify(event.currentTarget.checked)}
        />
        <Button onClick={handleSubmit} disabled={!file} loading={loading} fullWidth>
          Enviar
        </Button>
      </Stack>
    </Modal>
  );
}
