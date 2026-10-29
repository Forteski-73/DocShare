import { api } from "./api";
import type { ActivityLog, PaginatedResult } from "../types";

export type ListActivityLogsParams = {
  page?: number;
  pageSize?: number;
};

export async function list(params: ListActivityLogsParams) {
  const { data } = await api.get<PaginatedResult<ActivityLog>>("/activity-logs", { params });
  return data;
}
