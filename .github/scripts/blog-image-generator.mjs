import { getAiClient, rotateKey, sleep } from './agency-core.mjs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 🎨 BLOG IMAGE GENERATOR — Automatic Cover Image Generation
// ═══════════════════════════════════════════════════════════════════════
// Uses Google Imagen 4 (via @google/genai SDK) to generate blog cover images
// and uploads them to ImgBB for permanent public URL access.
//
// Flow:
//   1. Takes blog title + category + keyword
//   2. Generates a professional cover image via Imagen 4
//   3. Uploads to ImgBB (free, permanent hosting)
//   4. Returns the public URL
// ═══════════════════════════════════════════════════════════════════════

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || '';

// Imagen 4 Fast — best balance of speed + quality
const IMAGEN_MODEL = 'imagen-4.0-fast-generate-001';

// Gemini 2.5 Flash Image (Nano Banana) — fallback
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Use paid key for image generation
const PAID_KEY = process.env.GEMINI_PAID_KEY || process.env.GEMINI_FREE_KEY || '';
const imageAiClient = PAID_KEY ? new GoogleGenAI({ apiKey: PAID_KEY }) : null;

/**
 * Generate a blog cover image using Google Imagen 4
 * @param {object} params - { title, category, keyword, slug }
 * @returns {string|null} - Public URL of the uploaded image, or null on failure
 */
export async function generateBlogImage({ title, category, keyword, slug }) {
  console.log(`\n🎨 IMAGE GENERATOR: Creating cover image for "${title}"...`);

  try {
    // Step 1: Generate the image with Imagen 4
    const imageBase64 = await generateWithImagen(title, category, keyword);
    if (!imageBase64) {
      console.log('   ⚠️ Image generation failed, skipping cover image.');
      return null;
    }

    // Step 2: Upload to ImgBB
    const publicUrl = await uploadToImgBB(imageBase64, slug);
    if (!publicUrl) {
      console.log('   ⚠️ Image upload failed, skipping cover image.');
      return null;
    }

    console.log(`   ✅ Cover image generated & uploaded: ${publicUrl}`);
    return publicUrl;

  } catch (err) {
    console.error(`   ❌ Image generation error: ${err.message}`);
    return null;
  }
}

/**
 * Generate image using Google Imagen 4 via @google/genai SDK
 */
async function generateWithImagen(title, category, keyword) {
  const ai = imageAiClient;
  if (!ai) {
    console.log('   ⚠️ No AI client available for image generation (no paid key found).');
    return null;
  }

  const prompt = buildImagePrompt(title, category, keyword);
  console.log(`   📝 Prompt: "${prompt.substring(0, 120)}..."`);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
        },
      });

      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        console.log(`   ✅ Imagen 4 generated image (attempt ${attempt + 1})`);
        return response.generatedImages[0].image.imageBytes;
      }

      if (response?.generatedImages?.[0]?.filteredReason) {
        console.log(`   ⚠️ Image filtered: ${response.generatedImages[0].filteredReason}. Retrying...`);
        await sleep(2000);
        continue;
      }

    } catch (err) {
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⏳ Rate limited, waiting and retrying...`);
        await sleep(6000);
        continue;
      }
      
      if (err.message?.includes('not found') || err.message?.includes('not supported')) {
        console.log(`   🔄 Imagen 4 not available, trying Gemini fallback...`);
        return await generateWithGemini(title, category, keyword);
      }

      console.log(`   ⚠️ Imagen attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < 2) await sleep(3000);
    }
  }

  // Final fallback
  return await generateWithGemini(title, category, keyword);
}

/**
 * Fallback: Generate image using Gemini 2.5 Flash Image (Nano Banana)
 */
async function generateWithGemini(title, category, keyword) {
  const ai = imageAiClient;
  if (!ai) return null;

  console.log(`   🔄 Attempting Gemini 2.5 Flash Image (Nano Banana)...`);
  const prompt = buildImagePrompt(title, category, keyword);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_IMAGE_MODEL,
      contents: prompt,
      config: {
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // Extract image from response parts
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('image/')) {
          console.log(`   ✅ Gemini generated image`);
          return part.inlineData.data;
        }
      }
    }
  } catch (err) {
    console.log(`   ⚠️ Gemini image generation failed: ${err.message}`);
  }

  return null;
}

/**
 * Build a topic-specific image prompt based on blog metadata
 */
function buildImagePrompt(title, category, keyword) {
  // Extract the core concept from the title for a more specific visual
  const topic = keyword || title.substring(0, 60);

  const categoryVisuals = {
    'Engineering': {
      style: 'Isometric 3D illustration',
      palette: 'Deep navy blue, electric cyan, warm amber highlights',
      elements: 'interconnected system components, glowing data pipelines, modular blocks assembling together',
    },
    'Architecture': {
      style: 'Detailed isometric 3D technical illustration',
      palette: 'Dark slate, bright teal, golden accents',
      elements: 'layered system architecture diagram, connected microservices, flowing data between components',
    },
    'Performance': {
      style: 'Dynamic 3D render',
      palette: 'Dark background, neon green speed trails, orange energy bursts',
      elements: 'speedometer at max, rocket launching, lightning fast data streams, performance graphs going up',
    },
    'Design': {
      style: 'Clean modern 3D illustration',
      palette: 'Soft gradients, purple to blue, white accents',
      elements: 'UI components floating in space, design system tokens, color swatches, responsive layouts',
    },
    'Strategy': {
      style: 'Cinematic 3D render',
      palette: 'Deep purple, gold, dark background',
      elements: 'chess board with glowing pieces, strategic roadmap, growth trajectory arrows',
    },
    'SEO': {
      style: 'Vibrant 3D illustration',
      palette: 'Deep blue, bright green growth indicators, white',
      elements: 'search bar with magnifying glass, ranking positions climbing up, web of connected pages, analytics dashboard',
    },
    'Development': {
      style: 'Stylized 3D render',
      palette: 'Dark editor theme colors, syntax highlighting greens and purples, warm amber',
      elements: 'floating code blocks, terminal windows, git branches merging, deployment pipeline',
    },
  };

  const match = Object.entries(categoryVisuals).find(([key]) => 
    category?.toLowerCase().includes(key.toLowerCase())
  );

  const visual = match?.[1] || {
    style: 'Modern 3D illustration',
    palette: 'Dark navy, electric blue, warm gold accents',
    elements: 'abstract technology concept, connected nodes, flowing data',
  };

  return `${visual.style} representing the concept of "${topic}". 
Color palette: ${visual.palette}. 
Scene includes: ${visual.elements}. 
The image should clearly communicate the topic of ${topic} to a viewer. 
Make it visually striking and unique — not generic. 
No text, no words, no letters, no watermarks in the image. 
Professional quality, suitable for a premium tech blog header. 
16:9 wide format, high detail, depth of field, subtle lighting effects.`;
}

/**
 * Upload base64 image to ImgBB
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} slug - Blog post slug (used as image name)
 * @returns {string|null} - Public URL or null
 */
async function uploadToImgBB(base64Data, slug) {
  if (!IMGBB_API_KEY) {
    console.log('   ⚠️ No ImgBB API key found. Set IMGBB_API_KEY in .env');
    return null;
  }

  try {
    const formData = new URLSearchParams();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64Data);
    formData.append('name', slug);

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success && data.data?.url) {
      console.log(`   📤 Uploaded to ImgBB: ${data.data.url}`);
      return data.data.url;
    } else {
      console.log(`   ⚠️ ImgBB upload failed: ${JSON.stringify(data.error || data)}`);
      return null;
    }

  } catch (err) {
    console.log(`   ⚠️ ImgBB upload error: ${err.message}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════
// CLI: Run standalone for testing
// ═══════════════════════════════════════════════════════════════════════
if (process.argv[1]?.includes('blog-image-generator')) {
  const testTitle = process.argv[2] || 'Building Scalable Microservices with Event-Driven Architecture';
  const testCategory = process.argv[3] || 'Engineering';
  const testKeyword = process.argv[4] || 'microservices architecture';
  const testSlug = process.argv[5] || 'test-image-' + Date.now();

  console.log('🎨 Blog Image Generator — Test Mode');
  console.log('═══════════════════════════════════════');
  
  const url = await generateBlogImage({
    title: testTitle,
    category: testCategory,
    keyword: testKeyword,
    slug: testSlug,
  });

  if (url) {
    console.log(`\n✅ SUCCESS: ${url}`);
  } else {
    console.log('\n❌ FAILED: No image generated');
  }

  process.exit(0);
}
