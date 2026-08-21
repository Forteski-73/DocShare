import type { Request, Response } from "express";
import * as categoriesService from "./categories.service";

function paramId(req: Request): string {
  return req.params.id as string;
}

export async function list(req: Request, res: Response) {
  const labelId = req.query.labelId as string;
  const categories = await categoriesService.list(labelId);
  res.json({ categories });
}

export async function getById(req: Request, res: Response) {
  const category = await categoriesService.getById(paramId(req));
  res.json({ category });
}

export async function create(req: Request, res: Response) {
  const category = await categoriesService.create(req.body, req.user!.id);
  res.status(201).json({ category });
}

export async function update(req: Request, res: Response) {
  const category = await categoriesService.update(paramId(req), req.body, req.user!.id);
  res.json({ category });
}

export async function remove(req: Request, res: Response) {
  await categoriesService.remove(paramId(req), req.user!.id);
  res.status(204).send();
}
