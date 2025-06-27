
import { aiProviderService } from './aiProviderService';

interface ExtractedPageContent {
  pageNumber: number;
  text: string;
  confidence: number;
}

interface GeminiPdfExtractionResult {
  text: string;
  pages: ExtractedPageContent[];
  metadata: {
    totalPages: number;
    extractionMethod: string;
    processingTime: number;
  };
}

class GeminiPdfExtractor {
  private async convertPdfPageToBase64(file: File, pageNumber: number): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNumber);
      
      // Create canvas to render the page
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to base64
      return canvas.toDataURL('image/png').split(',')[1];
    } catch (error) {
      console.error(`Error converting PDF page ${pageNumber} to image:`, error);
      throw error;
    }
  }

  async extractWithGemini(file: File): Promise<GeminiPdfExtractionResult> {
    const startTime = Date.now();
    const extractedPages: ExtractedPageContent[] = [];
    
    console.log('Starting Gemini-powered PDF extraction...');
    
    try {
      // First, get the total number of pages
      const pdfjsLib = await import('pdfjs-dist');
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      console.log(`Processing ${totalPages} pages with Gemini AI...`);
      
      // Process pages in batches to respect rate limits
      const batchSize = 3; // Process 3 pages at a time
      const batches = Math.ceil(totalPages / batchSize);
      
      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const startPage = batchIndex * batchSize + 1;
        const endPage = Math.min((batchIndex + 1) * batchSize, totalPages);
        
        console.log(`Processing batch ${batchIndex + 1}/${batches}: pages ${startPage}-${endPage}`);
        
        // Process pages in current batch
        const batchPromises = [];
        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
          batchPromises.push(this.extractPageWithGemini(file, pageNum));
        }
        
        // Wait for batch completion
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Collect successful extractions
        batchResults.forEach((result, index) => {
          const pageNum = startPage + index;
          if (result.status === 'fulfilled') {
            extractedPages.push({
              pageNumber: pageNum,
              text: result.value,
              confidence: 0.95 // Gemini typically has high confidence
            });
          } else {
            console.error(`Failed to extract page ${pageNum}:`, result.reason);
            extractedPages.push({
              pageNumber: pageNum,
              text: `[Page ${pageNum} extraction failed]`,
              confidence: 0.0
            });
          }
        });
        
        // Rate limiting: wait between batches
        if (batchIndex < batches - 1) {
          console.log('Waiting between batches to respect rate limits...');
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        }
      }
      
      // Combine all extracted text
      const fullText = extractedPages
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map(page => page.text)
        .join('\n\n');
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Gemini PDF extraction completed in ${processingTime}ms`);
      
      return {
        text: fullText,
        pages: extractedPages,
        metadata: {
          totalPages,
          extractionMethod: 'gemini-vision',
          processingTime
        }
      };
      
    } catch (error) {
      console.error('Gemini PDF extraction failed:', error);
      throw new Error(`Gemini PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractPageWithGemini(file: File, pageNumber: number): Promise<string> {
    try {
      // Convert PDF page to base64 image
      const base64Image = await this.convertPdfPageToBase64(file, pageNumber);
      
      // Create prompt for Gemini
      const prompt = `
Please extract all text content from this PDF page image. Follow these guidelines:

1. ACCURACY: Extract text exactly as it appears, preserving:
   - Original spelling and capitalization
   - Numbers, dates, and special characters
   - Mathematical formulas and symbols
   - Arabic text, diacritics, and RTL formatting

2. STRUCTURE: Maintain document structure:
   - Preserve paragraph breaks and line spacing
   - Keep bullet points and numbering
   - Maintain table layouts where possible
   - Preserve headings and subheadings hierarchy

3. FORMATTING: Include formatting markers:
   - **bold text**
   - *italic text*
   - Preserve indentation with spaces
   - Keep footnotes and references

4. LANGUAGE: Handle multiple languages:
   - Preserve Arabic, Hebrew, and other RTL scripts
   - Maintain mixed language documents
   - Keep transliterations accurate

5. OUTPUT: Provide ONLY the extracted text content, no explanations or commentary.

If the page appears to be blank or unreadable, respond with "[BLANK PAGE]".
If text is partially obscured or unclear, use [UNCLEAR: approximate_text] notation.
      `.trim();

      // Check if provider is configured
      const provider = aiProviderService.getProvider();
      if (!provider) {
        throw new Error('AI provider not configured');
      }

      // For Gemini, we need to use the vision model
      if (provider.provider === 'gemini') {
        return await this.extractWithGeminiVision(prompt, base64Image);
      } else {
        // For other providers, fall back to regular extraction
        throw new Error('Gemini-based PDF extraction requires Gemini AI provider');
      }
      
    } catch (error) {
      console.error(`Error extracting page ${pageNumber} with Gemini:`, error);
      throw error;
    }
  }

  private async extractWithGeminiVision(prompt: string, base64Image: string): Promise<string> {
    const provider = aiProviderService.getProvider()!;
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    const model = 'gemini-2.0-flash-exp';
    
    const response = await fetch(`${baseUrl}/${model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: 'image/png',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1, // Low temperature for accurate text extraction
          topK: 10,
          topP: 0.8,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini Vision API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const extractedText = data.candidates[0]?.content.parts[0]?.text?.trim() || '';
    
    if (!extractedText || extractedText === '[BLANK PAGE]') {
      return '';
    }
    
    return extractedText;
  }

  // Method to compare extraction quality
  async compareExtractionMethods(file: File): Promise<{
    traditional: string;
    gemini: GeminiPdfExtractionResult;
    recommendation: string;
  }> {
    try {
      // Get traditional extraction
      const { fileExtractor } = await import('./fileExtractor');
      const traditionalResult = await fileExtractor.extractFromFile(file);
      
      // Get Gemini extraction
      const geminiResult = await this.extractWithGemini(file);
      
      // Simple quality comparison
      const traditionalWordCount = traditionalResult.text.split(/\s+/).length;
      const geminiWordCount = geminiResult.text.split(/\s+/).length;
      
      const recommendation = geminiWordCount > traditionalWordCount * 1.2 
        ? 'gemini' 
        : traditionalWordCount > geminiWordCount * 1.2 
        ? 'traditional' 
        : 'similar';
      
      return {
        traditional: traditionalResult.text,
        gemini: geminiResult,
        recommendation
      };
      
    } catch (error) {
      console.error('Error comparing extraction methods:', error);
      throw error;
    }
  }
}

export const geminiPdfExtractor = new GeminiPdfExtractor();
