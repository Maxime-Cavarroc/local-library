import { Book } from "../book";

export interface GetEpubsQuery {
    page?: number;
    limit?: number;
    sort?: 'fileName' | 'title' | 'author' | 'date' | 'publisher' | 'language';
    order?: 'asc' | 'desc';
    search?: string;
}

export interface PaginatedBooks {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    books: Book[];
}