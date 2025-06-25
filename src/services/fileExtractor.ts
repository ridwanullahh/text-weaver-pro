
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

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
      const arrayBuffer = await file.arrayBuffer();
      const data = await pdfParse(arrayBuffer);
      
      return {
        text: data.text,
        metadata: {
          title: data.info?.Title || file.name,
          author: data.info?.Author,
          pages: data.numpages,
          wordCount: data.text.split(/\s+/).length
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF. Please ensure the PDF contains selectable text.');
    }
  }

  private async extractFromDocx(file: File): Promise<ExtractedContent> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        text: result.value,
        metadata: {
          title: file.name,
          wordCount: result.value.split(/\s+/).length
        }
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error('Failed to extract text from DOCX file.');
    }
  }

  private async extractFromText(file: File): Promise<ExtractedContent> {
    const text = await file.text();
    return {
      text,
      metadata: {
        title: file.name,
        wordCount: text.split(/\s+/).length
      }
    };
  }

  private async extractFromEpub(file: File): Promise<ExtractedContent> {
    try {
      // For now, return a placeholder - EPUB parsing is complex
      // In production, you'd use a proper EPUB parser
      const text = `EPUB content extraction is being processed for ${file.name}`;
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: text.split(/\s+/).length
        }
      };
    } catch (error) {
      console.error('EPUB extraction error:', error);
      throw new Error('Failed to extract text from EPUB file.');
    }
  }
}

export const fileExtractor = new FileExtractor();
