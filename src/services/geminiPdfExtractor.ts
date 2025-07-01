
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
    return 'gemini-2.5-flash';
  }

  private async convertPdfPageToBase64(file: File, pageNumber: number): Promise<string> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Ensure worker is properly configured with multiple fallback options
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerSources = [
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`,
          `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`,
          `//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`
        ];
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
        console.log('Configured PDF.js worker for page conversion:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      }
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Validate PDF file
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file is empty');
      }
      
      // Check PDF header
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      if (pdfHeader !== '%PDF') {
        throw new Error('File does not appear to be a valid PDF');
      }
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      }).promise;
      
      const page = await pdf.getPage(pageNumber);
      
      // Create canvas to render the page with high quality
      const viewport = page.getViewport({ scale: 2.5 }); // Higher scale for better OCR accuracy
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Set high-quality rendering
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Convert canvas to base64 with high quality
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      return dataUrl.split(',')[1];
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
      // Validate file first
      if (file.size === 0) {
        throw new Error('PDF file is empty (0 bytes)');
      }
      
      // First, get the total number of pages
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configure worker with better error handling
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerSources = [
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`,
          `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`,
          `//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`
        ];
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
        console.log('Configured PDF.js worker for Gemini extraction:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      }
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Additional validation
      if (arrayBuffer.byteLength === 0) {
        throw new Error('PDF file arrayBuffer is empty');
      }
      
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true
      }).promise;
      const totalPages = pdf.numPages;
      
      console.log(`Processing ${totalPages} pages with Gemini AI...`);
      
      // Process pages sequentially with proper rate limiting
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        
        let attempts = 0;
        const maxAttempts = 2; // Reduced attempts to avoid timeout
        let success = false;
        
        while (attempts < maxAttempts && !success) {
          try {
            const extractedText = await this.extractPageWithGemini(file, pageNum);
            extractedPages.push({
              pageNumber: pageNum,
              text: extractedText,
              confidence: 0.95
            });
            success = true;
            console.log(`Successfully extracted page ${pageNum} (${extractedText.length} characters)`);
          } catch (error) {
            attempts++;
            console.error(`Attempt ${attempts} failed for page ${pageNum}:`, error);
            
            if (attempts < maxAttempts) {
              const waitTime = 3000; // Shorter wait time
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
        
        // Rate limiting: wait between pages to avoid hitting Gemini limits
        if (pageNum < totalPages) {
          console.log('Waiting between pages to respect rate limits...');
          await new Promise(resolve => setTimeout(resolve, 6000)); // Slightly reduced wait time
        }
      }
      
      // Combine all extracted text
      const fullText = extractedPages
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map(page => page.text)
        .filter(text => text && !text.includes('extraction failed'))
        .join('\n\n');
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Gemini PDF extraction completed in ${processingTime}ms`);
      console.log(`Final extracted text length: ${fullText.length} characters`);
      
      if (fullText.length === 0) {
        throw new Error('No text content was successfully extracted from any page');
      }
      
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
      
      // Create specialized prompt for accurate text extraction across all languages
      const prompt = `
Extract ALL text content from this document page image with maximum accuracy. This is CRITICAL for multilingual translation purposes.

EXTRACTION REQUIREMENTS:
1. **COMPLETENESS**: Extract every single word, number, symbol, and character visible
2. **ACCURACY**: Preserve exact spelling, capitalization, punctuation, and diacritics
3. **MULTILINGUAL SUPPORT**: Handle text in ANY language including:
   - Latin scripts (English, Spanish, French, German, Italian, Portuguese, etc.)
   - Arabic script with all diacritics and vowel marks
   - Chinese characters (Simplified and Traditional)
   - Japanese (Hiragana, Katakana, Kanji)
   - Cyrillic script (Russian, Ukrainian, Bulgarian, etc.)
   - Devanagari (Hindi, Sanskrit, Marathi, etc.)
   - African languages (Yoruba, Swahili, Hausa, etc.)
   - Hebrew, Thai, Korean, Vietnamese, and ALL other writing systems
4. **STRUCTURE**: Maintain original layout, paragraph breaks, and formatting
5. **SPECIAL CHARACTERS**: Include all diacritics, mathematical symbols, and special marks
6. **DIRECTION**: Properly handle right-to-left (RTL) and left-to-right (LTR) text

FORMATTING PRESERVATION:
- Keep original line breaks and paragraph structure
- Preserve bullet points, numbering, and indentation
- Maintain spacing between sections
- Keep headers and subheadings distinct
- Preserve table structures if present

OUTPUT INSTRUCTIONS:
- Provide ONLY the extracted text content
- NO explanations, comments, or metadata
- If page appears blank, respond with "[BLANK PAGE]"
- If text is unclear, use [UNCLEAR: best_guess] notation
- Maintain the original reading order and text flow

This text will be used for professional translation across multiple languages - accuracy is paramount.
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
