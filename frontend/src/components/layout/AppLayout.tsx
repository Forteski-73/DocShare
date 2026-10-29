import { useState } from "react";
import {
  AppShell,
  Avatar,
  Burger,
  Group,
  Image,
  Menu,
  NavLink,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  IconClipboardCheck,
  IconFiles,
  IconFileText,
  IconHistory,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import { useAuth } from "../../hooks/useAuth";
import { ROLE_LABELS } from "../../utils/roleLabels";
import { getContrastTextColor } from "../../utils/contrastColor";
import { getErrorMessage } from "../../services/api";
import * as settingsService from "../../services/settings.service";
import * as authService from "../../services/auth.service";
import { ProfileAvatarModal } from "../users/ProfileAvatarModal";
import { BackToTopButton } from "../ui/BackToTopButton";

export function AppLayout() {
  const [opened, { toggle, close }] = useDisclosure();
  const [avatarModalOpened, setAvatarModalOpened] = useState(false);
  const { user, logout, refresh } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsService.get,
    staleTime: 5 * 60 * 1000,
  });

  const headerTextColor = settings ? getContrastTextColor(settings.headerColor) : undefined;

  const uploadAvatarMutation = useMutation({
    mutationFn: authService.uploadAvatar,
    onSuccess: async () => {
      await refresh();
      notifications.show({ message: "Foto de perfil atualizada", color: "green" });
      setAvatarModalOpened(false);
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  const removeAvatarMutation = useMutation({
    mutationFn: authService.removeAvatar,
    onSuccess: async () => {
      await refresh();
      notifications.show({ message: "Foto de perfil removida", color: "green" });
    },
    onError: (err) => notifications.show({ message: getErrorMessage(err), color: "red" }),
  });

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  function handleNavigate(path: string) {
    navigate(path);
    close();
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header bg={settings?.headerColor}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color={headerTextColor}
            />
            {settings?.logoPath ? (
              <Image
                src={settingsService.logoUrl(settings.logoPath)}
                h={36}
                w="auto"
                fit="contain"
                alt="Logo"
              />
            ) : (
              <Image src="/logo-doc-share.png" alt="DocShare" h={36} w="auto" fit="contain" />
            )}
          </Group>

          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap="xs">
                  <Avatar
                    src={user?.avatarPath ? authService.avatarUrl(user.avatarPath) : null}
                    radius="xl"
                    size="sm"
                    color="blue"
                  >
                    {user?.badgeNumber.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <div>
                    <Text size="sm" c={headerTextColor}>
                      {user?.badgeNumber}
                    </Text>
                    <Text size="xs" c={headerTextColor} opacity={0.75}>
                      {user ? ROLE_LABELS[user.role] : ""}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconUserCircle size={16} />}
                onClick={() => setAvatarModalOpened(true)}
              >
                Foto de perfil
              </Menu.Item>
              <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                Sair
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Produtos"
          leftSection={<IconFiles size={16} />}
          childrenOffset={28}
          defaultOpened={
            location.pathname.startsWith("/produtos") || location.pathname.startsWith("/labels")
          }
        >
          <NavLink
            label="Piso Laminado"
            active={location.pathname.startsWith("/produtos/piso-laminado")}
            onClick={() => handleNavigate("/produtos/piso-laminado")}
          />
          <NavLink
            label="Acessório"
            active={location.pathname.startsWith("/produtos/acessorio")}
            onClick={() => handleNavigate("/produtos/acessorio")}
          />
          <NavLink
            label="Documentos"
            active={location.pathname.startsWith("/produtos/documento")}
            onClick={() => handleNavigate("/produtos/documento")}
          />
        </NavLink>

        <NavLink
          label="Gestão de Qualidade"
          leftSection={<IconClipboardCheck size={16} />}
          childrenOffset={28}
          defaultOpened={location.pathname.startsWith("/qualidade")}
        >
          <NavLink
            label="Formulários"
            active={location.pathname.startsWith("/qualidade/formularios")}
            onClick={() => handleNavigate("/qualidade/formularios")}
          />
          <NavLink
            label="Procedimentos Internos"
            active={location.pathname.startsWith("/qualidade/procedimentos-internos")}
            onClick={() => handleNavigate("/qualidade/procedimentos-internos")}
          />
          {(user?.role === "APPROVER" || user?.role === "ADMIN") && (
            <NavLink
              label="Aprovações Pendentes"
              active={location.pathname === "/qualidade/aprovacoes"}
              onClick={() => handleNavigate("/qualidade/aprovacoes")}
            />
          )}
        </NavLink>

        {user?.role === "ADMIN" && (
          <>
            <NavLink
              label="Documentos"
              leftSection={<IconFileText size={16} />}
              active={location.pathname.startsWith("/admin/documentos")}
              onClick={() => handleNavigate("/admin/documentos")}
            />
            <NavLink
              label="Atividades"
              leftSection={<IconHistory size={16} />}
              active={location.pathname.startsWith("/admin/atividades")}
              onClick={() => handleNavigate("/admin/atividades")}
            />
            <NavLink
              label="Usuários"
              leftSection={<IconUsers size={16} />}
              active={location.pathname.startsWith("/admin/usuarios")}
              onClick={() => handleNavigate("/admin/usuarios")}
            />
            <NavLink
              label="Configurações"
              leftSection={<IconSettings size={16} />}
              active={location.pathname.startsWith("/admin/configuracoes")}
              onClick={() => handleNavigate("/admin/configuracoes")}
            />
          </>
        )}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
        <BackToTopButton />
      </AppShell.Main>

      <ProfileAvatarModal
        opened={avatarModalOpened}
        user={user}
        loading={uploadAvatarMutation.isPending}
        removing={removeAvatarMutation.isPending}
        onSubmit={(file) => uploadAvatarMutation.mutate(file)}
        onRemove={() => removeAvatarMutation.mutate()}
        onClose={() => setAvatarModalOpened(false)}
      />
    </AppShell>
  );
}
