import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Loader,
  Pagination,
  Select,
  Stack,
  Table,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconMailForward,
  IconPencil,
  IconPlus,
  IconRotate,
  IconUserCircle,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import * as usersService from "../../services/users.service";
import { getErrorMessage } from "../../services/api";
import { UserFormModal, type UserFormValues } from "../../components/users/UserFormModal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ROLE_LABELS, STATUS_LABELS } from "../../utils/roleLabels";
import type { Role, User, UserStatus } from "../../types";

const STATUS_COLORS: Record<UserStatus, string> = {
  PENDING: "yellow",
  ACTIVE: "green",
  INACTIVE: "gray",
};

export function UsersListPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<Role | null>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);

  const [formOpened, setFormOpened] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, roleFilter, statusFilter],
    queryFn: () =>
      usersService.list({
        page,
        pageSize: 20,
        role: roleFilter ?? undefined,
        status: statusFilter ?? undefined,
      }),
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }

  const createMutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Usuario criado e convite enviado", color: "green" });
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: Partial<UserFormValues> }) =>
      usersService.update(id, values),
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Usuario atualizado", color: "green" });
      closeForm();
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: usersService.deactivate,
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Usuario desativado", color: "green" });
      setDeactivatingUser(null);
    },
    onError: (err) => {
      notifications.show({ message: getErrorMessage(err), color: "red" });
      setDeactivatingUser(null);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) => usersService.update(id, { status: "ACTIVE" }),
    onSuccess: () => {
      invalidate();
      notifications.show({ message: "Usuario reativado", color: "green" });
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const resendInviteMutation = useMutation({
    mutationFn: usersService.resendInvite,
    onSuccess: () => notifications.show({ message: "Convite reenviado", color: "green" }),
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  function closeForm() {
    setFormOpened(false);
    setEditingUser(null);
  }

  function handleFormSubmit(values: UserFormValues) {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, values });
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Stack>
      <Group justify="space-between">
        <Title order={2}>Usuarios</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            setEditingUser(null);
            setFormOpened(true);
          }}
        >
          Novo usuario
        </Button>
      </Group>

      <Group>
        <Select
          placeholder="Filtrar por perfil"
          clearable
          data={(["ADMIN", "EDITOR", "READER"] as Role[]).map((role) => ({
            value: role,
            label: ROLE_LABELS[role],
          }))}
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(value as Role | null);
            setPage(1);
          }}
        />
        <Select
          placeholder="Filtrar por status"
          clearable
          data={(["PENDING", "ACTIVE", "INACTIVE"] as UserStatus[]).map((status) => ({
            value: status,
            label: STATUS_LABELS[status],
          }))}
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value as UserStatus | null);
            setPage(1);
          }}
        />
      </Group>

      {isLoading || !data ? (
        <Loader />
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th>Cracha</Table.Th>
                <Table.Th>E-mail</Table.Th>
                <Table.Th>Perfil</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.data.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Avatar
                      src={
                        user.avatarPath
                          ? usersService.avatarUrl(user.id, user.avatarPath)
                          : null
                      }
                      radius="xl"
                      size="sm"
                    >
                      <IconUserCircle size={18} />
                    </Avatar>
                  </Table.Td>
                  <Table.Td>{user.badgeNumber}</Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>{ROLE_LABELS[user.role]}</Table.Td>
                  <Table.Td>
                    <Badge color={STATUS_COLORS[user.status]}>{STATUS_LABELS[user.status]}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="flex-end">
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="light"
                          onClick={() => {
                            setEditingUser(user);
                            setFormOpened(true);
                          }}
                        >
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      {user.status === "PENDING" && (
                        <Tooltip label="Reenviar convite">
                          <ActionIcon
                            variant="light"
                            loading={resendInviteMutation.isPending}
                            onClick={() => resendInviteMutation.mutate(user.id)}
                          >
                            <IconMailForward size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {user.status === "ACTIVE" && (
                        <Tooltip label="Desativar">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => setDeactivatingUser(user)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {user.status === "INACTIVE" && (
                        <Tooltip label="Reativar">
                          <ActionIcon
                            variant="light"
                            color="green"
                            loading={reactivateMutation.isPending}
                            onClick={() => reactivateMutation.mutate(user.id)}
                          >
                            <IconRotate size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
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

      <UserFormModal
        opened={formOpened}
        user={editingUser}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleFormSubmit}
        onClose={closeForm}
      />

      <ConfirmDialog
        opened={!!deactivatingUser}
        title="Desativar usuario"
        message={`Tem certeza que deseja desativar "${deactivatingUser?.badgeNumber}"? O usuario perdera o acesso ao sistema ate ser reativado.`}
        confirmLabel="Desativar"
        danger
        loading={deactivateMutation.isPending}
        onConfirm={() => deactivatingUser && deactivateMutation.mutate(deactivatingUser.id)}
        onCancel={() => setDeactivatingUser(null)}
      />
    </Stack>
  );
}
