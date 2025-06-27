
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
  private getGeminiModel(): string {
    // Check if user has configured a specific Gemini model
    const provider = aiProviderService.getProvider();
    if (provider && provider.provider === 'gemini' && provider.model) {
      return provider.model;
    }
    // Default to Gemini 2.5 Flash for extraction
    return 'gemini-2.0-flash-exp'; // Updated to use 2.5 Flash when available
  }

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
      const viewport = page.getViewport({ scale: 2.5 }); // Higher scale for better OCR accuracy
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
      
      // Process pages sequentially to respect rate limits and avoid skipping
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        
        while (attempts < maxAttempts && !success) {
          try {
            const extractedText = await this.extractPageWithGemini(file, pageNum);
            extractedPages.push({
              pageNumber: pageNum,
              text: extractedText,
              confidence: 0.95 // Gemini typically has high confidence
            });
            success = true;
            console.log(`Successfully extracted page ${pageNum}`);
          } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed for page ${pageNum}:`, error);
            
            if (attempts < maxAttempts) {
              // Wait before retry (exponential backoff)
              const waitTime = Math.pow(2, attempts) * 1000;
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
              console.error(`Failed to extract page ${pageNum} after ${maxAttempts} attempts`);
              extractedPages.push({
                pageNumber: pageNum,
                text: `[Page ${pageNum} extraction failed]`,
                confidence: 0.0
              });
            }
          }
        }
        
        // Rate limiting: wait between pages to avoid hitting limits
        if (pageNum < totalPages) {
          console.log('Waiting between pages to respect rate limits...');
          await new Promise(resolve => setTimeout(resolve, 6000)); // 6 seconds for 10 requests/minute limit
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
      
      // Create specialized prompt for accurate text extraction
      const prompt = `
Extract ALL text content from this PDF page image with maximum accuracy. This is CRITICAL for translation purposes.

EXTRACTION REQUIREMENTS:
1. **COMPLETENESS**: Extract every single word, number, symbol, and character visible
2. **ACCURACY**: Preserve exact spelling, capitalization, and punctuation
3. **LANGUAGE SUPPORT**: Handle Arabic, English, and mixed-language content perfectly
4. **STRUCTURE**: Maintain original layout, paragraph breaks, and formatting
5. **SPECIAL CHARACTERS**: Include all diacritics, mathematical symbols, and special marks
6. **RTL TEXT**: Properly handle right-to-left Arabic text direction

FORMATTING PRESERVATION:
- Keep original line breaks and paragraph structure
- Preserve bullet points, numbering, and indentation
- Maintain spacing between sections
- Keep headers and subheadings distinct

OUTPUT INSTRUCTIONS:
- Provide ONLY the extracted text content
- NO explanations, comments, or metadata
- If page appears blank, respond with "[BLANK PAGE]"
- If text is unclear, use [UNCLEAR: best_guess] notation

This text will be used for professional translation - accuracy is paramount.
      `.trim();

      return await this.extractWithGeminiVision(prompt, base64Image);
      
    } catch (error) {
      console.error(`Error extracting page ${pageNumber} with Gemini:`, error);
      throw error;
    }
  }

  private async extractWithGeminiVision(prompt: string, base64Image: string): Promise<string> {
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    const model = this.getGeminiModel();
    
    // Try to get API key from aiProviderService first, fallback to localStorage
    let apiKey = '';
    const provider = aiProviderService.getProvider();
    if (provider && provider.provider === 'gemini') {
      apiKey = provider.apiKey;
    } else {
      // Fallback to check localStorage for Gemini key
      const geminiConfig = localStorage.getItem('gemini_api_key');
      if (geminiConfig) {
        apiKey = geminiConfig;
      }
    }
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please set up your API key in the settings.');
    }
    
    const response = await fetch(`${baseUrl}/${model}:generateContent?key=${apiKey}`, {
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
          temperature: 0.1, // Very low temperature for accurate extraction
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
