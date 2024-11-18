import type { Book } from "./book";

export interface PaginatedBooks {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    books: Book[];
}