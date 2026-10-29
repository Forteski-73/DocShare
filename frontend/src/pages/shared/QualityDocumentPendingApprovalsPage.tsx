import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Anchor, Loader, Stack, Table, Text, Title } from "@mantine/core";
import * as qualityDocumentsService from "../../services/qualityDocuments.service";
import { formatDate } from "../../utils/formatDate";
import { qualityDocumentTypeDisplayName } from "../../utils/qualityDocumentType";

export function QualityDocumentPendingApprovalsPage() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ["quality-documents", "pending-approvals"],
    queryFn: qualityDocumentsService.listPendingForApprover,
  });

  return (
    <Stack>
      <Title order={2}>Aprovações Pendentes</Title>

      {isLoading || !documents ? (
        <Loader />
      ) : documents.length === 0 ? (
        <Text c="dimmed">Nenhum documento aguardando sua aprovação.</Text>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Título</Table.Th>
              <Table.Th>Categoria</Table.Th>
              <Table.Th>Solicitado por</Table.Th>
              <Table.Th>Data</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {documents.map((document) => (
              <Table.Tr key={document.id}>
                <Table.Td>
                  <Anchor component={Link} to={`/qualidade/aprovacoes/${document.id}`} size="sm">
                    {document.title}
                  </Anchor>
                </Table.Td>
                <Table.Td>{qualityDocumentTypeDisplayName(document.type)}</Table.Td>
                <Table.Td>{document.uploadedBy.badgeNumber}</Table.Td>
                <Table.Td>{formatDate(document.createdAt)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Stack>
  );
}
