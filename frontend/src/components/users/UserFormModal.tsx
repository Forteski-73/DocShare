import { useEffect } from "react";
import { Button, Modal, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Role, User } from "../../types";
import { ROLE_LABELS } from "../../utils/roleLabels";

export type UserFormValues = { badgeNumber: string; email: string; role: Role };

type UserFormModalProps = {
  opened: boolean;
  user?: User | null;
  loading?: boolean;
  onSubmit: (values: UserFormValues) => void;
  onClose: () => void;
};

const CREATE_ROLE_OPTIONS: Role[] = ["EDITOR", "READER", "APPROVER"];
const EDIT_ROLE_OPTIONS: Role[] = ["ADMIN", "EDITOR", "READER", "APPROVER"];

export function UserFormModal({ opened, user, loading, onSubmit, onClose }: UserFormModalProps) {
  const isEdit = !!user;
  const roleOptions = isEdit ? EDIT_ROLE_OPTIONS : CREATE_ROLE_OPTIONS;

  const form = useForm<UserFormValues>({
    initialValues: { badgeNumber: "", email: "", role: "READER" },
    validate: {
      badgeNumber: (value) => (value.trim().length === 0 ? "Informe o cracha" : null),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "E-mail invalido"),
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({
        badgeNumber: user?.badgeNumber ?? "",
        email: user?.email ?? "",
        role: user?.role ?? "READER",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user]);

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Editar Usuário" : "Novo usuario"} centered>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput label="Cracha" data-autofocus {...form.getInputProps("badgeNumber")} />
          <TextInput label="E-mail" {...form.getInputProps("email")} />
          <Select
            label="Perfil"
            data={roleOptions.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
            allowDeselect={false}
            {...form.getInputProps("role")}
          />
          <Button type="submit" loading={loading} fullWidth>
            {isEdit ? "Salvar" : "Criar e enviar convite"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
