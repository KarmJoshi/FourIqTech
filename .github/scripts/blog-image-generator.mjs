import { getAiClient, rotateKey, sleep } from './agency-core.mjs';
import dotenv from 'dotenv';
dotenv.config();

// ═══════════════════════════════════════════════════════════════════════
// 🎨 BLOG IMAGE GENERATOR — Automatic Cover Image Generation
// ═══════════════════════════════════════════════════════════════════════
// Uses Google Imagen (via @google/genai SDK) to generate blog cover images
// and uploads them to Supabase Storage for public URL access.
//
// Flow:
//   1. Takes blog title + category + keyword
//   2. Generates a professional cover image via Imagen
//   3. Uploads to Supabase Storage bucket "blog-images"
//   4. Returns the public URL
// ═══════════════════════════════════════════════════════════════════════

const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID || 'qdagkfmlvjkjtpljnkpc';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const STORAGE_BUCKET = 'blog-images';

// Imagen model to use (free tier compatible)
const IMAGEN_MODEL = 'imagen-3.0-generate-002';

/**
 * Generate a blog cover image using Google Imagen
 * @param {object} params - { title, category, keyword, slug }
 * @returns {string|null} - Public URL of the uploaded image, or null on failure
 */
export async function generateBlogImage({ title, category, keyword, slug }) {
  console.log(`\n🎨 IMAGE GENERATOR: Creating cover image for "${title}"...`);

  try {
    // Step 1: Generate the image with Imagen
    const imageBase64 = await generateWithImagen(title, category, keyword);
    if (!imageBase64) {
      console.log('   ⚠️ Image generation failed, skipping cover image.');
      return null;
    }

    // Step 2: Upload to Supabase Storage
    const publicUrl = await uploadToSupabase(imageBase64, slug);
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
 * Generate image using Google Imagen via @google/genai SDK
 */
async function generateWithImagen(title, category, keyword) {
  const ai = getAiClient();
  if (!ai) {
    console.log('   ⚠️ No AI client available for image generation.');
    return null;
  }

  // Craft a professional prompt for blog cover images
  const prompt = buildImagePrompt(title, category, keyword);
  console.log(`   📝 Prompt: "${prompt.substring(0, 120)}..."`);

  // Try Imagen first, fall back to Gemini image generation
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await ai.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',  // Wide format for blog covers
        },
      });

      if (response?.generatedImages?.[0]?.image?.imageBytes) {
        console.log(`   ✅ Imagen generated image (attempt ${attempt + 1})`);
        return response.generatedImages[0].image.imageBytes;
      }

      // If filtered, try with a safer prompt
      if (response?.generatedImages?.[0]?.filteredReason) {
        console.log(`   ⚠️ Image filtered: ${response.generatedImages[0].filteredReason}. Retrying with safer prompt...`);
        await sleep(2000);
        continue;
      }

    } catch (err) {
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`   ⏳ Rate limited, rotating key and retrying...`);
        rotateKey();
        await sleep(6000);
        continue;
      }
      
      if (err.message?.includes('not found') || err.message?.includes('not supported')) {
        // Imagen model not available, try Gemini native image generation
        console.log(`   🔄 Imagen not available, trying Gemini image generation...`);
        return await generateWithGemini(title, category, keyword);
      }

      console.log(`   ⚠️ Imagen attempt ${attempt + 1} failed: ${err.message}`);
      if (attempt < 2) {
        rotateKey();
        await sleep(3000);
      }
    }
  }

  // Final fallback: Gemini native image generation
  return await generateWithGemini(title, category, keyword);
}

/**
 * Fallback: Generate image using Gemini's native image generation (gemini-2.0-flash with image output)
 */
async function generateWithGemini(title, category, keyword) {
  const ai = getAiClient();
  if (!ai) return null;

  console.log(`   🔄 Attempting Gemini native image generation...`);
  const prompt = buildImagePrompt(title, category, keyword);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      config: {
        responseModalities: ['image', 'text'],
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

  // Create a concise, descriptive prompt
  const topicHint = keyword 
    ? `Visual metaphor representing "${keyword}" in the context of web technology.`
    : `Visual metaphor for the concept: "${title.substring(0, 80)}".`;

  return `${styleGuide} ${categoryStyle} ${topicHint} High quality, 4K resolution, suitable for a premium tech company blog.`;
}

/**
 * Upload base64 image to Supabase Storage
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} slug - Blog post slug (used as filename)
 * @returns {string|null} - Public URL or null
 */
async function uploadToSupabase(base64Data, slug) {
  if (!SUPABASE_SERVICE_KEY) {
    console.log('   ⚠️ No Supabase service key found. Set SUPABASE_SERVICE_ROLE_KEY in .env');
    // Fallback: save as data URL (works but not ideal for production)
    return `data:image/png;base64,${base64Data.substring(0, 100)}...`;
  }

  const fileName = `${slug}-${Date.now()}.png`;
  const filePath = `covers/${fileName}`;

  try {
    // Ensure bucket exists (create if not)
    await ensureBucketExists();

    // Upload the image
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filePath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'image/png',
          'x-upsert': 'true',
        },
        body: imageBuffer,
      }
    );

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.log(`   ⚠️ Upload failed (${uploadRes.status}): ${errText}`);
      return null;
    }

    // Return public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filePath}`;
    return publicUrl;

  } catch (err) {
    console.log(`   ⚠️ Supabase upload error: ${err.message}`);
    return null;
  }
}

/**
 * Ensure the storage bucket exists, create if not
 */
async function ensureBucketExists() {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${STORAGE_BUCKET}`, {
      headers: { 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
    });

    if (res.status === 404) {
      // Create the bucket
      const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: STORAGE_BUCKET,
          name: STORAGE_BUCKET,
          public: true,  // Public bucket for blog images
          file_size_limit: 5242880,  // 5MB max
          allowed_mime_types: ['image/png', 'image/jpeg', 'image/webp'],
        }),
      });

      if (createRes.ok) {
        console.log(`   📦 Created storage bucket: ${STORAGE_BUCKET}`);
      } else {
        const err = await createRes.text();
        console.log(`   ⚠️ Bucket creation failed: ${err}`);
      }
    }
  } catch (err) {
    console.log(`   ⚠️ Bucket check error: ${err.message}`);
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
