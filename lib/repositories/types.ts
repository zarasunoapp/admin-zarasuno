export type ListParams = {
  page?: number;
  perPage?: number;
  q?: string;
  sort?: string;
  dir?: "asc" | "desc";
  from?: string;
  to?: string;
  type?: string;
  status?: string;
  filter?: string;
};

export type ListResult<T> = {
  rows: T[];
  count: number;
  page: number;
  perPage: number;
};

export function range(page: number, perPage: number) {
  const start = (page - 1) * perPage;
  return { start, end: start + perPage - 1 };
}
