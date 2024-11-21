export interface BookProgressRequest {
    /**
     * Unique identifier for the book (e.g., file name)
     */
    book: string;

    /**
     * Reading progress as a percentage between 0 and 1
     */
    progress: number;
}
