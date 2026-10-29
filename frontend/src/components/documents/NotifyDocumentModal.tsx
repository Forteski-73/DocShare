import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal, MultiSelect, Radio, Stack, Text } from "@mantine/core";
import * as usersService from "../../services/users.service";
import type { DocumentItem } from "../../types";

type NotifyDocumentModalProps = {
  opened: boolean;
  document: DocumentItem | null;
  loading?: boolean;
  onSubmit: (input: { toAll: boolean; userIds?: string[] }) => void;
  onClose: () => void;
};

export function NotifyDocumentModal({
  opened,
  document,
  loading,
  onSubmit,
  onClose,
}: NotifyDocumentModalProps) {
  const [target, setTarget] = useState<"all" | "some">("all");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { data: usersResult } = useQuery({
    queryKey: ["users", "active-for-notify"],
    queryFn: () => usersService.list({ status: "ACTIVE", pageSize: 200 }),
    enabled: opened,
  });

  useEffect(() => {
    if (opened) {
      setTarget("all");
      setSelectedUserIds([]);
    }
  }, [opened]);

  function handleSubmit() {
    if (target === "all") {
      onSubmit({ toAll: true });
    } else {
      onSubmit({ toAll: false, userIds: selectedUserIds });
    }
  }

  const canSubmit = target === "all" || selectedUserIds.length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title="Reenviar por e-mail" centered>
      <Stack>
        <Text size="sm" c="dimmed">
          Documento: <strong>{document?.originalName}</strong>
        </Text>

        <Radio.Group value={target} onChange={(value) => setTarget(value as "all" | "some")}>
          <Stack gap="xs">
            <Radio value="all" label="Enviar para todos os usuarios ativos" />
            <Radio value="some" label="Escolher usuarios especificos" />
          </Stack>
        </Radio.Group>

        {target === "some" && (
          <MultiSelect
            label="Destinatarios"
            placeholder="Selecione os usuarios"
            data={(usersResult?.data ?? []).map((user) => ({
              value: user.id,
              label: `${user.badgeNumber} - ${user.email}`,
            }))}
            value={selectedUserIds}
            onChange={setSelectedUserIds}
            searchable
            clearable
          />
        )}

        <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading} fullWidth>
          Enviar
        </Button>
      </Stack>
    </Modal>
  );
}
