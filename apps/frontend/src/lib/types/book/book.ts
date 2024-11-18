export interface Book {
    fileName: string;
    title: string;
    author: string;
    description: string;
    cover: string | null; // Base64 Data URL or null
    date: string | null;
    publisher: string | null;
    language: string | null;
    tag: string | null;
}
