
import { TranslationProject, ExportFormat } from '../types/translation';
import { dbUtils } from '../utils/database';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportCallbacks {
  onProgress: (progress: number) => void;
}

class ExportService {
  async exportProject(
    project: TranslationProject, 
    languages: string[], 
    format: ExportFormat,
    callbacks: ExportCallbacks
  ) {
    callbacks.onProgress(10);
    
    // Get all translated chunks
    const chunks = await dbUtils.getProjectChunks(project.id!);
    callbacks.onProgress(20);
    
    // Organize translations by language
    const translationsByLanguage = this.organizeTranslations(chunks, languages);
    callbacks.onProgress(40);
    
    // Generate files for each language
    const files = await this.generateFiles(translationsByLanguage, format, project);
    callbacks.onProgress(70);
    
    // Create and download archive
    await this.createDownload(files, project.name, format);
    callbacks.onProgress(100);
  }

  private organizeTranslations(chunks: any[], languages: string[]) {
    const organized: Record<string, string> = {};
    
    languages.forEach(lang => {
      const translatedText = chunks
        .filter(chunk => chunk.translations[lang])
        .sort((a, b) => a.chunkIndex - b.chunkIndex)
        .map(chunk => chunk.translations[lang])
        .join('\n\n');
      
      organized[lang] = translatedText;
    });
    
    return organized;
  }

  private async generateFiles(
    translations: Record<string, string>,
    format: ExportFormat,
    project: TranslationProject
  ): Promise<Record<string, Blob>> {
    const files: Record<string, Blob> = {};
    
    for (const [language, content] of Object.entries(translations)) {
      let fileContent: Blob;
      const fileName = `${project.name}_${language}`;
      
      switch (format.type) {
        case 'txt':
          fileContent = new Blob([content], { type: 'text/plain' });
          files[`${fileName}.txt`] = fileContent;
          break;
          
        case 'html':
          const htmlContent = this.generateHTML(content, project.name, language);
          fileContent = new Blob([htmlContent], { type: 'text/html' });
          files[`${fileName}.html`] = fileContent;
          break;
          
        case 'pdf':
          // This would require a PDF generation library
          // For now, we'll create a text file with PDF extension
          fileContent = new Blob([content], { type: 'application/pdf' });
          files[`${fileName}.pdf`] = fileContent;
          break;
          
        case 'docx':
          // This would require a DOCX generation library
          // For now, we'll create a text file with DOCX extension
          fileContent = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
          files[`${fileName}.docx`] = fileContent;
          break;
          
        case 'epub':
          // This would require EPUB generation
          // For now, we'll create a text file with EPUB extension
          fileContent = new Blob([content], { type: 'application/epub+zip' });
          files[`${fileName}.epub`] = fileContent;
          break;
          
        default:
          fileContent = new Blob([content], { type: 'text/plain' });
          files[`${fileName}.txt`] = fileContent;
      }
    }
    
    return files;
  }

  private generateHTML(content: string, title: string, language: string): string {
    return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${language.toUpperCase()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        .language-badge {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }
        p {
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="language-badge">${language.toUpperCase()}</div>
    <h1>${title}</h1>
    <div>
        ${content.split('\n\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
    </div>
</body>
</html>`;
  }

  private async createDownload(files: Record<string, Blob>, projectName: string, format: ExportFormat) {
    if (Object.keys(files).length === 1) {
      // Single file download
      const [fileName, fileBlob] = Object.entries(files)[0];
      saveAs(fileBlob, fileName);
    } else {
      // Multiple files - create ZIP
      const zip = new JSZip();
      
      Object.entries(files).forEach(([fileName, fileBlob]) => {
        zip.file(fileName, fileBlob);
      });
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `${projectName}_translations.zip`);
    }
  }
}

export const exportService = new ExportService();
