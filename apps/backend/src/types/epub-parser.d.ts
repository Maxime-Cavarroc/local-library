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
      [key: string]: any; // For other parsed properties
    }
  
    export function EPUBParser(filePath: string): Promise<EPUB>;
  }