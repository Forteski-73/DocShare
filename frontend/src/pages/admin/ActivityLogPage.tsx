import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Group, Loader, Pagination, Stack, Table, Title } from "@mantine/core";
import * as activityLogsService from "../../services/activityLogs.service";
import { formatDate } from "../../utils/formatDate";

const ACTION_LABELS: Record<string, string> = {
  CREATE_USER: "Criou usuario",
  UPDATE_USER: "Atualizou usuario",
  DEACTIVATE_USER: "Desativou usuario",
  RESEND_INVITE: "Reenviou convite",
  UPDATE_PERMISSIONS: "Atualizou permissoes",
  CREATE_LABEL: "Criou produto",
  UPDATE_LABEL: "Atualizou produto",
  DELETE_LABEL: "Excluiu produto",
  CREATE_CATEGORY: "Criou categoria",
  UPDATE_CATEGORY: "Atualizou categoria",
  DELETE_CATEGORY: "Excluiu categoria",
  UPLOAD_DOCUMENT: "Enviou documento",
  DELETE_DOCUMENT: "Excluiu documento",
  RESEND_DOCUMENT_NOTIFICATION: "Reenviou notificacao de documento",
  UPDATE_LABEL_PHOTO: "Atualizou foto do produto",
  REMOVE_LABEL_PHOTO: "Removeu foto do produto",
  UPDATE_LOGO: "Atualizou logo do sistema",
  REMOVE_LOGO: "Removeu logo do sistema",
};

export function ActivityLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity-logs", page],
    queryFn: () => activityLogsService.list({ page, pageSize: 20 }),
  });

  return (
    <Stack>
      <Title order={2}>Atividades</Title>

      {isLoading || !data ? (
        <Loader />
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Usuario</Table.Th>
                <Table.Th>Ação</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Data</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.data.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>{log.user.badgeNumber}</Table.Td>
                  <Table.Td>{ACTION_LABELS[log.action] ?? log.action}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{log.entityType}</Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(log.createdAt)}</Table.Td>
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
    </Stack>
  );
}
