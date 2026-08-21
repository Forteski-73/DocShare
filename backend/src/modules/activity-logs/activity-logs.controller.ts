import type { Request, Response } from "express";
import type { z } from "zod";
import type { listActivityLogsQuerySchema } from "./activity-logs.schemas";
import * as activityLogsService from "./activity-logs.service";

export async function list(req: Request, res: Response) {
  const query = req.query as unknown as z.infer<typeof listActivityLogsQuerySchema>;
  const result = await activityLogsService.list(query);
  res.json(result);
}
