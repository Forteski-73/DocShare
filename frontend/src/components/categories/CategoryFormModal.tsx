import { useEffect } from "react";
import { Button, Modal, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Category } from "../../types";

export type CategoryFormValues = { name: string; description: string };

type CategoryFormModalProps = {
  opened: boolean;
  category?: Category | null;
  loading?: boolean;
  onSubmit: (values: CategoryFormValues) => void;
  onClose: () => void;
};

export function CategoryFormModal({
  opened,
  category,
  loading,
  onSubmit,
  onClose,
}: CategoryFormModalProps) {
  const form = useForm<CategoryFormValues>({
    initialValues: { name: "", description: "" },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Informe o nome" : null),
    },
  });

  useEffect(() => {
    if (opened) {
      form.setValues({ name: category?.name ?? "", description: category?.description ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, category]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={category ? "Editar categoria" : "Nova categoria"}
      centered
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Nome"
            placeholder="Ex: Manuais Tecnicos"
            data-autofocus
            {...form.getInputProps("name")}
          />
          <Textarea label="Descricao" placeholder="Opcional" {...form.getInputProps("description")} />
          <Button type="submit" loading={loading} fullWidth>
            {category ? "Salvar" : "Criar"}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
