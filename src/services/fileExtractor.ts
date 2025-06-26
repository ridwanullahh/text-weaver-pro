
interface ExtractedContent {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
  };
}

class FileExtractor {
  async extractFromFile(file: File): Promise<ExtractedContent> {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return await this.extractFromPDF(file);
      case 'docx':
        return await this.extractFromDocx(file);
      case 'txt':
        return await this.extractFromText(file);
      case 'epub':
        return await this.extractFromEpub(file);
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
  }

  private getFileType(file: File): string {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (file.type === 'text/plain') return 'txt';
    if (file.name.endsWith('.epub')) return 'epub';
    return 'unknown';
  }

  private async extractFromPDF(file: File): Promise<ExtractedContent> {
    try {
      const pdfParse = await import('pdf-parse');
      const arrayBuffer = await file.arrayBuffer();
      // Convert ArrayBuffer to Buffer for pdf-parse
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse.default(buffer);
      
      return {
        text: data.text,
        metadata: {
          title: data.info?.Title || file.name,
          author: data.info?.Author,
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).filter(word => word.length > 0).length
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the PDF contains selectable text.');
    }
  }

  private async extractFromDocx(file: File): Promise<ExtractedContent> {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        text: result.value,
        metadata: {
          title: file.name,
          wordCount: result.value.split(/\s+/).filter(word => word.length > 0).length
        }
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX file. Please try converting to PDF format.');
    }
  }

  private async extractFromText(file: File): Promise<ExtractedContent> {
    try {
      const text = await file.text();
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length
        }
      };
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to read text file.');
    }
  }

  private async extractFromEpub(file: File): Promise<ExtractedContent> {
    try {
      // For production, we would implement proper EPUB parsing
      // For now, provide a helpful message
      const text = `EPUB file "${file.name}" uploaded successfully. EPUB extraction will be implemented in the next update. Please convert to PDF format for immediate translation.`;
      
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length
        }
      };
    } catch (error) {
      console.error('EPUB extraction error:', error);
      throw new Error('EPUB format not yet supported. Please convert to PDF format.');
    }
  }
}

export const fileExtractor = new FileExtractor();
