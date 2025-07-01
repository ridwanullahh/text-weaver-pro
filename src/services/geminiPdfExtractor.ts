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

interface ExtractionSettings {
  ignoreHeaders: boolean;
  ignoreFooters: boolean;
  ignorePageNumbers: boolean;
  ignoreFootnotes: boolean;
  maintainFormatting: boolean;
  separatePages: boolean;
}

class GeminiPdfExtractor {
  private extractionSettings: ExtractionSettings = {
    ignoreHeaders: true,
    ignoreFooters: true,
    ignorePageNumbers: true,
    ignoreFootnotes: false,
    maintainFormatting: true,
    separatePages: true
  };

  setExtractionSettings(settings: ExtractionSettings) {
    this.extractionSettings = settings;
  }

  private getGeminiModel(): string {
    const provider = aiProviderService.getProvider();
    if (provider && provider.provider === 'gemini' && provider.model) {
      return provider.model;
    }
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

  async extractWithGemini(file: File, onProgress?: (page: number, total: number, stage: string) => void): Promise<GeminiPdfExtractionResult> {
    const startTime = Date.now();
    const extractedPages: ExtractedPageContent[] = [];
    
    console.log('Starting enhanced Gemini-powered PDF extraction...');
    
    try {
      if (file.size === 0) {
        throw new Error('PDF file is empty (0 bytes)');
      }
      
      const pdfjsLib = await import('pdfjs-dist');
      
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const workerSources = [
          `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`,
          `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`,
          `//cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`
        ];
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSources[0];
        console.log('Configured PDF.js worker for enhanced Gemini extraction');
      }
      
      const arrayBuffer = await file.arrayBuffer();
      
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
      
      console.log(`Processing ${totalPages} pages with enhanced AI extraction...`);
      onProgress?.(0, totalPages, 'analyzing');
      
      // Process pages sequentially with enhanced progress tracking
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`Processing page ${pageNum}/${totalPages}...`);
        onProgress?.(pageNum, totalPages, 'extracting');
        
        let attempts = 0;
        const maxAttempts = 2;
        let success = false;
        
        while (attempts < maxAttempts && !success) {
          try {
            const extractedText = await this.extractPageWithEnhancedGemini(file, pageNum);
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
              const waitTime = 3000;
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
        
        if (pageNum < totalPages) {
          console.log('Waiting between pages to respect rate limits...');
          await new Promise(resolve => setTimeout(resolve, 6000));
        }
      }
      
      onProgress?.(totalPages, totalPages, 'processing');
      
      // Combine all extracted text with intelligent page separation
      const fullText = extractedPages
        .sort((a, b) => a.pageNumber - b.pageNumber)
        .map(page => {
          if (page.text && !page.text.includes('extraction failed')) {
            return this.extractionSettings.separatePages 
              ? `--- Page ${page.pageNumber} ---\n${page.text}\n`
              : page.text;
          }
          return '';
        })
        .filter(text => text.length > 0)
        .join('\n\n');
      
      const processingTime = Date.now() - startTime;
      
      console.log(`Enhanced Gemini PDF extraction completed in ${processingTime}ms`);
      console.log(`Final extracted text length: ${fullText.length} characters`);
      
      if (fullText.length === 0) {
        throw new Error('No text content was successfully extracted from any page');
      }
      
      onProgress?.(totalPages, totalPages, 'completed');
      
      return {
        text: fullText,
        pages: extractedPages,
        metadata: {
          totalPages,
          extractionMethod: 'enhanced-gemini-vision',
          processingTime
        }
      };
      
    } catch (error) {
      console.error('Enhanced Gemini PDF extraction failed:', error);
      throw new Error(`Enhanced Gemini PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractPageWithEnhancedGemini(file: File, pageNumber: number): Promise<string> {
    try {
      const base64Image = await this.convertPdfPageToBase64(file, pageNumber);
      const prompt = this.createEnhancedExtractionPrompt();
      return await this.extractWithGeminiVision(prompt, base64Image);
    } catch (error) {
      console.error(`Error extracting page ${pageNumber} with enhanced Gemini:`, error);
      throw error;
    }
  }

  private createEnhancedExtractionPrompt(): string {
    const filterInstructions = [];
    
    if (this.extractionSettings.ignoreHeaders) {
      filterInstructions.push('- IGNORE page headers (typically at the top of pages)');
    }
    if (this.extractionSettings.ignoreFooters) {
      filterInstructions.push('- IGNORE page footers (typically at the bottom of pages)');
    }
    if (this.extractionSettings.ignorePageNumbers) {
      filterInstructions.push('- IGNORE page numbers (usually isolated numbers)');
    }
    if (this.extractionSettings.ignoreFootnotes) {
      filterInstructions.push('- IGNORE footnotes and reference numbers');
    }

    const formatInstructions = this.extractionSettings.maintainFormatting
      ? 'PRESERVE original formatting, paragraph breaks, and text structure'
      : 'Extract as plain text without special formatting';

    return `
You are a professional document content extractor with expertise in multilingual text recognition. Your task is to extract ONLY the main content from this document page with maximum accuracy and intelligence.

CRITICAL EXTRACTION REQUIREMENTS:
1. **CONTENT FOCUS**: Extract only the main document content - the actual text that readers need
2. **INTELLIGENT FILTERING**: ${filterInstructions.length > 0 ? filterInstructions.join('\n') : 'Extract all visible content'}
3. **ACCURACY**: Preserve exact spelling, capitalization, punctuation, and diacritics
4. **MULTILINGUAL SUPPORT**: Handle text in ANY language with full Unicode support
5. **FORMATTING**: ${formatInstructions}

WHAT TO EXTRACT:
✓ Main body text and paragraphs
✓ Headings and subheadings (part of content)
✓ Important quotes and highlighted text
✓ Lists and bullet points (part of content)
✓ Table content (if it's main content)
✓ Captions for images/charts (if relevant to content)

WHAT TO IGNORE:
${filterInstructions.length > 0 ? filterInstructions.join('\n') : '(No specific filtering requested)'}
✗ Watermarks and background text
✗ Publisher information (unless it's main content)
✗ Copyright notices (unless it's main content)
✗ Page margins and decorative elements

INTELLIGENT PROCESSING:
- Distinguish between main content and peripheral elements
- Maintain logical reading flow and paragraph structure
- Handle multi-column layouts intelligently
- Preserve the document's natural text hierarchy
- Ensure content flows naturally without interruption from filtered elements

OUTPUT REQUIREMENTS:
- Provide ONLY the extracted main content
- NO explanations, comments, or metadata
- If page appears to contain no main content, respond with "[NO MAIN CONTENT]"
- If text is unclear in specific areas, use [UNCLEAR: best_guess] notation
- Maintain clean, readable text flow

This extraction is for professional translation purposes - accuracy and content focus are paramount.
    `.trim();
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
