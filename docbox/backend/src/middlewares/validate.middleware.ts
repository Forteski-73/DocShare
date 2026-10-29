import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type Source = "body" | "query" | "params";

export function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(result.error);
      return;
    }
    // req.query is a getter-only property in Express 5 (no setter), so it must be
    // redefined via defineProperty instead of a plain assignment.
    if (source === "query") {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    } else {
      req[source] = result.data;
    }
    next();
  };
}
