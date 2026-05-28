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
 * Build a professional image prompt based on blog metadata
 */
function buildImagePrompt(title, category, keyword) {
  const styleGuide = `Professional, modern, minimalist tech blog cover image. Dark background with subtle gradient. Abstract geometric shapes or tech-inspired patterns. No text or words in the image. Clean, editorial quality. 16:9 aspect ratio.`;

  const categoryStyles = {
    'Engineering': 'Abstract code patterns, circuit board aesthetics, flowing data streams, deep blue and gold accents.',
    'Architecture': 'Architectural blueprints, structural diagrams, interconnected nodes, clean geometric lines.',
    'Performance': 'Speed lines, optimization graphs, lightning bolts, dynamic motion blur effects.',
    'Design': 'UI wireframes, color palettes, design tools, creative workspace elements.',
    'Strategy': 'Chess pieces, strategic maps, growth charts, compass and navigation elements.',
    'SEO': 'Search magnifying glass, ranking charts, web connections, digital marketing visuals.',
    'Development': 'Code editor aesthetics, terminal windows, development workflow, modern IDE colors.',
  };

  const categoryStyle = Object.entries(categoryStyles).find(([key]) => 
    category?.toLowerCase().includes(key.toLowerCase())
  )?.[1] || 'Abstract technology patterns, modern digital aesthetics, professional and clean.';

  const topicHint = keyword 
    ? `Visual metaphor representing "${keyword}" in the context of web technology.`
    : `Visual metaphor for the concept: "${title.substring(0, 80)}".`;

  return `${styleGuide} ${categoryStyle} ${topicHint} High quality, 4K resolution, suitable for a premium tech company blog.`;
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
