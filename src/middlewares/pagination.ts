import { Request, Response, NextFunction } from "express";

export interface Pagination {
  limit: number;
  offset: number;
  page: number;
  pageSize: number;
}
declare module "express-serve-static-core" {
  interface Request {
    pagination?: Pagination;
  }
}

export function withPagination(defaultPageSize = 10, maxPageSize = 100) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const pageSize = Math.min(
      maxPageSize,
      Math.max(1, parseInt(String(req.query.pageSize || defaultPageSize), 10))
    );
    req.pagination = {
      page,
      pageSize,
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };
    next();
  };
}
