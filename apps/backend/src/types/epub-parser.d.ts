declare module 'epub-parser' {
    export interface EPUBMetadata {
        title?: string;
        author?: string;
        language?: string;
        cover?: { path: string };
        [key: string]: any; // For additional fields
    }

    export interface EPUB {
        metadata: EPUBMetadata;
        // Add any other properties or methods you need
    }

    export function open(filePath: string): Promise<EPUB>;
    // Add other exported functions if needed
}