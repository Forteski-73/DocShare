import { useEffect, useState } from "react";
import { ActionIcon } from "@mantine/core";
import { IconArrowUp } from "@tabler/icons-react";

const SCROLL_THRESHOLD = 300;

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <ActionIcon
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      radius="xl"
      size="xl"
      variant="filled"
      color="blue"
      aria-label="Voltar ao topo"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 200,
        opacity: hovered ? 1 : 0.6,
        transition: "opacity 150ms ease",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
    >
      <IconArrowUp size={20} />
    </ActionIcon>
  );
}
