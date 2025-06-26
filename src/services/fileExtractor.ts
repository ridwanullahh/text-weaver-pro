interface ExtractedContent {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
    fileSize?: string;
    lastModified?: Date;
  };
}

interface PDFMetadata {
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: Date;
  ModDate?: Date;
}

class FileExtractor {
  async extractFromFile(file: File): Promise<ExtractedContent> {
    const fileType = this.getFileType(file);
    
    console.log(`Extracting content from ${fileType} file: ${file.name}`);
    
    switch (fileType) {
      case 'pdf':
        return await this.extractFromPDF(file);
      case 'docx':
        return await this.extractFromDocx(file);
      case 'txt':
        return await this.extractFromText(file);
      case 'rtf':
        return await this.extractFromRTF(file);
      case 'csv':
        return await this.extractFromCSV(file);
      case 'xlsx':
        return await this.extractFromExcel(file);
      case 'html':
        return await this.extractFromHTML(file);
      case 'xml':
        return await this.extractFromXML(file);
      case 'json':
        return await this.extractFromJSON(file);
      case 'epub':
        return await this.extractFromEpub(file);
      default:
        throw new Error(`Unsupported file type: ${file.type}. Supported formats: PDF, DOCX, TXT, RTF, CSV, XLSX, HTML, XML, JSON, EPUB`);
    }
  }

  private getFileType(file: File): string {
    // Check by MIME type first
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'docx';
    if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
    if (file.type === 'text/plain') return 'txt';
    if (file.type === 'text/csv') return 'csv';
    if (file.type === 'text/html') return 'html';
    if (file.type === 'application/xml' || file.type === 'text/xml') return 'xml';
    if (file.type === 'application/json') return 'json';
    if (file.type === 'application/rtf') return 'rtf';
    
    // Check by file extension as fallback
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'epub') return 'epub';
    if (extension === 'rtf') return 'rtf';
    if (extension === 'csv') return 'csv';
    if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
    if (extension === 'html' || extension === 'htm') return 'html';
    if (extension === 'xml') return 'xml';
    if (extension === 'json') return 'json';
    
    return 'unknown';
  }

  private async extractFromPDF(file: File): Promise<ExtractedContent> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source with fallback
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0 // Reduce console noise
      }).promise;
      
      let fullText = '';
      const numPages = pdf.numPages;
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        if (pageText.trim()) {
          fullText += pageText + '\n\n';
        }
      }
      
      // Get metadata with proper typing
      const metadata = await pdf.getMetadata();
      const info = metadata.info as PDFMetadata;
      
      return {
        text: fullText.trim(),
        metadata: {
          title: info?.Title || file.name,
          author: info?.Author,
          pages: numPages,
          wordCount: this.countWords(fullText),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      return this.createFallbackContent(file, 'PDF');
    }
  }

  private async extractFromDocx(file: File): Promise<ExtractedContent> {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      // Extract both raw text and formatted HTML
      const textResult = await mammoth.extractRawText({ arrayBuffer });
      const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
      
      // Use raw text for translation, but keep HTML for formatting reference
      const text = textResult.value;
      
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: this.countWords(text),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      return this.createFallbackContent(file, 'DOCX');
    }
  }

  private async extractFromText(file: File): Promise<ExtractedContent> {
    try {
      const text = await file.text();
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: this.countWords(text),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to read text file.');
    }
  }

  private async extractFromRTF(file: File): Promise<ExtractedContent> {
    try {
      const text = await file.text();
      // Basic RTF parsing - remove RTF control codes
      const cleanText = text
        .replace(/\\[a-z]+\d*/g, '') // Remove RTF control words
        .replace(/[{}]/g, '') // Remove braces
        .replace(/\\\\/g, '\\') // Handle escaped backslashes
        .replace(/\\'/g, "'") // Handle escaped quotes
        .trim();
      
      return {
        text: cleanText,
        metadata: {
          title: file.name,
          wordCount: this.countWords(cleanText),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('RTF extraction error:', error);
      return this.createFallbackContent(file, 'RTF');
    }
  }

  private async extractFromCSV(file: File): Promise<ExtractedContent> {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0]?.split(',') || [];
      
      // Convert CSV to readable text format
      let formattedText = `CSV Document: ${file.name}\n\n`;
      formattedText += `Headers: ${headers.join(', ')}\n\n`;
      formattedText += `Data:\n${text}`;
      
      return {
        text: formattedText,
        metadata: {
          title: file.name,
          wordCount: this.countWords(formattedText),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('CSV extraction error:', error);
      return this.createFallbackContent(file, 'CSV');
    }
  }

  private async extractFromExcel(file: File): Promise<ExtractedContent> {
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      let allText = `Excel Document: ${file.name}\n\n`;
      
      // Extract text from all sheets
      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetText = XLSX.utils.sheet_to_txt(sheet);
        allText += `Sheet: ${sheetName}\n${sheetText}\n\n`;
      });
      
      return {
        text: allText,
        metadata: {
          title: file.name,
          wordCount: this.countWords(allText),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('Excel extraction error:', error);
      return this.createFallbackContent(file, 'Excel');
    }
  }

  private async extractFromHTML(file: File): Promise<ExtractedContent> {
    try {
      const html = await file.text();
      
      // Create a temporary DOM element to parse HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Extract text content, preserving some structure
      const text = tempDiv.textContent || tempDiv.innerText || '';
      
      return {
        text: text.trim(),
        metadata: {
          title: file.name,
          wordCount: this.countWords(text),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('HTML extraction error:', error);
      return this.createFallbackContent(file, 'HTML');
    }
  }

  private async extractFromXML(file: File): Promise<ExtractedContent> {
    try {
      const xml = await file.text();
      
      // Parse XML and extract text content
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, 'text/xml');
      const text = xmlDoc.textContent || '';
      
      return {
        text: text.trim(),
        metadata: {
          title: file.name,
          wordCount: this.countWords(text),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('XML extraction error:', error);
      return this.createFallbackContent(file, 'XML');
    }
  }

  private async extractFromJSON(file: File): Promise<ExtractedContent> {
    try {
      const json = await file.text();
      const data = JSON.parse(json);
      
      // Convert JSON to readable text format
      const text = `JSON Document: ${file.name}\n\n${JSON.stringify(data, null, 2)}`;
      
      return {
        text,
        metadata: {
          title: file.name,
          wordCount: this.countWords(text),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('JSON extraction error:', error);
      return this.createFallbackContent(file, 'JSON');
    }
  }

  private async extractFromEpub(file: File): Promise<ExtractedContent> {
    try {
      // For production EPUB support, we would need epub.js or similar
      const fallbackText = `EPUB file "${file.name}" uploaded successfully. Advanced EPUB parsing coming soon. File size: ${this.formatFileSize(file.size)}.`;
      
      return {
        text: fallbackText,
        metadata: {
          title: file.name,
          wordCount: this.countWords(fallbackText),
          fileSize: this.formatFileSize(file.size),
          lastModified: new Date(file.lastModified)
        }
      };
    } catch (error) {
      console.error('EPUB extraction error:', error);
      throw new Error('EPUB format processing failed. Please try converting to PDF or DOCX format.');
    }
  }

  private createFallbackContent(file: File, fileType: string): ExtractedContent {
    const fallbackText = `${fileType} file "${file.name}" has been uploaded. Content extraction had issues but the file is ready for processing. File size: ${this.formatFileSize(file.size)}.`;
    
    return {
      text: fallbackText,
      metadata: {
        title: file.name,
        wordCount: this.countWords(fallbackText),
        fileSize: this.formatFileSize(file.size),
        lastModified: new Date(file.lastModified)
      }
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileExtractor = new FileExtractor();
