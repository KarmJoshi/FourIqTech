import pkgPrisma from '@prisma/client';
const { PrismaClient } = pkgPrisma;
import pkgPg from 'pg';
const { Pool } = pkgPg;
import { PrismaPg } from '@prisma/adapter-pg';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function generateBrandedGraphic(id) {
  console.log(`🎨 Starting Premium Autonomous Production for Post: ${id}`);
  
  try {
    const post = await prisma.socialPost.findUnique({ where: { id } });
    if (!post) throw new Error("Post not found in DB.");

    const qData = post.quizData || {};
    const slides = qData.slides || qData.quizData?.slides || [];
    const theme = qData.visualTheme || "CYBER_DARK";

    if (slides.length === 0) {
       slides.push({ heading: "Marketing Update", body: post.caption?.substring(0, 100) });
    }

    const outputFolder = path.join(process.cwd(), 'public/social');
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

    // 1. GENERATE THE 3D ASSET VIA IMAGEN 3 (Using your existing Gemini API Key)
    console.log("🤖 Generating 3D Clay Asset via Google Imagen 3...");
    const rawKeys = process.env.VITE_GEMINI_API_KEYS || process.env.VITE_GEMINI_PRO_API_KEY || "";
    const apiKey = rawKeys.split(",").map(k => k.trim())[0];
    
    // We ask Imagen for a solid black background. We will use CSS mix-blend-mode: screen to make it transparent!
    const aiPrompt = `A high quality, cute 3d clay style illustration of a concept related to '${post.topicPillar}', modern corporate memphis 3D style, vibrant lighting, solid pitch black '#000000' background, no text.`;
    
    let assetUrl = "";
    try {
      // UPGRADED TO IMAGEN 4.0 (2026)
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: aiPrompt }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
          })
      });
      const data = await res.json();
      if (data.predictions && data.predictions.length > 0) {
          assetUrl = `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
          console.log("✅ Imagen 3 3D Asset Generated & Baked.");
      } else {
          console.log("⚠️ Imagen API returned no predictions:", JSON.stringify(data));
      }
    } catch (e) {
      console.log("⚠️ Imagen API Error:", e.message);
    }

    // 2. RENDER THE PREMIUM UI IN PUPPETEER
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });

    let generatedUrls = [];

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const isLast = i === slides.length - 1;
        
        let html = "";
        
        if (theme === "MINIMAL_WHITE") {
          // Layout: Clean, full-bleed typography, no borders, serif fonts
          html = `
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Outfit:wght@900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 100px; width: 1080px; height: 1080px; background: #fff; color: #000; font-family: 'Libre Baskerville', serif; display: flex; flex-direction: column; box-sizing: border-box; }
              .num { font-family: 'Outfit'; font-size: 120px; color: #f1f5f9; position: absolute; top: 0; right: 80px; z-index: -1; }
              h1 { font-size: 90px; line-height: 1.1; margin-top: 100px; font-weight: 700; border-left: 15px solid #000; padding-left: 50px; }
              p { font-size: 45px; line-height: 1.5; color: #475569; margin-top: 50px; padding-left: 65px; }
              .asset { position: absolute; bottom: 50px; right: 50px; width: 450px; mix-blend-mode: multiply; opacity: 0.8; }
              footer { margin-top: auto; font-family: 'Outfit'; font-size: 24px; letter-spacing: 5px; text-transform: uppercase; border-top: 1px solid #e2e8f0; padding-top: 40px; }
            </style>
          </head>
          <body>
            <div class="num">0${i+1}</div>
            <h1>${slide.heading}</h1>
            <p>${slide.body}</p>
            ${assetUrl ? `<img src="${assetUrl}" class="asset" />` : ''}
            <footer>FOURIQTECH // SOLUTIONS</footer>
          </body>
          </html>`;
        } else if (theme === "CODE_EDITOR") {
          // Layout: Simulated IDE window with sidebar and line numbers
          html = `
          <html>
          <head>
            <style>
              body { margin: 0; padding: 0; width: 1080px; height: 1080px; background: #0d1117; color: #c9d1d9; font-family: 'Courier New', monospace; display: flex; }
              .sidebar { width: 80px; background: #161b22; border-right: 1px solid #30363d; display: flex; flex-direction: column; align-items: center; padding-top: 40px; gap: 30px; }
              .icon { width: 30px; height: 30px; border-radius: 50%; background: #30363d; }
              .main { flex: 1; padding: 80px; position: relative; }
              .top-bar { position: absolute; top: 0; left: 0; right: 0; height: 50px; background: #161b22; display: flex; align-items: center; padding: 0 40px; font-size: 18px; color: #8b949e; }
              .lines { position: absolute; top: 130px; left: 30px; font-size: 28px; line-height: 1.6; color: #30363d; text-align: right; width: 40px; }
              .content { margin-top: 50px; padding-left: 30px; }
              h1 { font-size: 65px; color: #79c0ff; margin-bottom: 40px; }
              p { font-size: 38px; line-height: 1.6; color: #d2a8ff; }
              .asset { position: absolute; bottom: 80px; right: 80px; width: 400px; mix-blend-mode: screen; filter: hue-rotate(200deg); }
            </style>
          </head>
          <body>
            <div class="sidebar">
              <div class="icon"></div><div class="icon"></div><div class="icon"></div>
            </div>
            <div class="main">
              <div class="top-bar">src / engineering / slide_0${i+1}.tsx</div>
              <div class="lines">01<br>02<br>03<br>04<br>05<br>06<br>07<br>08<br>09</div>
              <div class="content">
                <h1>export const Hook = () => {</h1>
                <p>&nbsp;&nbsp;"${slide.heading}"</p>
                <p>&nbsp;&nbsp;return "${slide.body.substring(0, 100)}..."</p>
                <h1>}</h1>
              </div>
              ${assetUrl ? `<img src="${assetUrl}" class="asset" />` : ''}
            </div>
          </body>
          </html>`;
        } else if (theme === "STREET_VIRAL") {
          // Layout: Skewed, huge text, chaotic, high-energy
          html = `
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; width: 1080px; height: 1080px; background: #ffff00; color: #000; font-family: 'Outfit', sans-serif; overflow: hidden; display: flex; flex-direction: column; justify-content: center; align-items: center; }
              .stripes { position: absolute; top: 0; left: 0; right: 0; height: 150px; background: repeating-linear-gradient(45deg, #000, #000 20px, #ffff00 20px, #ffff00 40px); }
              .stripes-bot { position: absolute; bottom: 0; left: 0; right: 0; height: 150px; background: repeating-linear-gradient(45deg, #000, #000 20px, #ffff00 20px, #ffff00 40px); }
              .box { background: #000; color: #fff; padding: 40px 80px; transform: rotate(-3deg) skewX(-10deg); margin-bottom: 40px; box-shadow: 20px 20px 0 #333; }
              h1 { font-size: 110px; margin: 0; text-transform: uppercase; letter-spacing: -5px; }
              p { font-size: 45px; max-width: 800px; text-align: center; font-weight: 900; line-height: 1.1; margin-top: 40px; text-transform: uppercase; }
              .asset { position: absolute; top: 40%; right: 50px; width: 500px; mix-blend-mode: multiply; transform: rotate(15deg); }
            </style>
          </head>
          <body>
            <div class="stripes"></div>
            <div class="box"><h1>0${i+1} // ${slide.heading.substring(0, 15)}</h1></div>
            <p>${slide.body}</p>
            ${assetUrl ? `<img src="${assetUrl}" class="asset" />` : ''}
            <div class="stripes-bot"></div>
          </body>
          </html>`;
        } else {
          // Standard Professional Card (CYBER_DARK)
          html = `
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; padding: 0; width: 1080px; height: 1080px; background: #1c1c1f; font-family: 'Outfit', sans-serif; color: #f8fafc; overflow: hidden; position: relative; }
              .line-v { position: absolute; left: 100px; top: 0; bottom: 0; width: 1px; background: rgba(139,92,246,0.2); }
              .line-h { position: absolute; top: 120px; left: 0; right: 0; height: 1px; background: rgba(139,92,246,0.2); }
              .pagination { position: absolute; top: 90px; left: 50%; transform: translateX(-50%); background: #1c1c1f; padding: 0 30px; color: #8b5cf6; font-size: 28px; font-weight: 700; z-index: 10; }
              .card { position: absolute; top: 150px; bottom: 150px; left: 150px; right: 150px; background: #28282c; border-radius: 40px; padding: 70px; display: flex; flex-direction: column; z-index: 5; box-shadow: 0 40px 60px rgba(0,0,0,0.5); }
              .badge { background: #8b5cf6; padding: 10px 30px; border-radius: 20px; font-size: 50px; font-weight: 900; margin-bottom: 40px; width: max-content; }
              h1 { font-size: 60px; font-weight: 900; line-height: 1.1; margin: 0 0 30px 0; text-transform: uppercase; }
              p { font-size: 38px; color: #cbd5e1; line-height: 1.5; }
              .asset { position: absolute; bottom: -50px; right: -50px; width: 550px; mix-blend-mode: screen; z-index: 20; }
              .handle { position: absolute; bottom: 60px; left: 50%; transform: translateX(-50%); background: #8b5cf6; padding: 12px 40px; border-radius: 10px; font-weight: 700; }
            </style>
          </head>
          <body>
            <div class="line-v"></div><div class="line-h"></div>
            <div class="pagination">0${i+1} / 0${slides.length}</div>
            <div class="card">
              <div class="badge">0${i+1}</div>
              <h1>${slide.heading}</h1>
              <p>${slide.body}</p>
            </div>
            ${assetUrl ? `<img src="${assetUrl}" class="asset" />` : ''}
            <div class="handle">@FOURIQTECH</div>
          </body>
          </html>`;
        }

        await page.setContent(html);
        await page.waitForNetworkIdle();

        const filename = `post_${id}_${i+1}.jpg`;
        const outputPath = path.join(outputFolder, filename);
        await page.screenshot({ path: outputPath, type: 'jpeg', quality: 95 });
        
        generatedUrls.push(`/social/${filename}`);
        console.log(`📸 Rendered ${theme} Slide ${i+1}/${slides.length}`);
    }

    await browser.close();

    const imageUrl = generatedUrls.join(',');
    await prisma.socialPost.update({
      where: { id },
      data: { 
        imageUrl,
        status: "staged"
      }
    });

    console.log(`✅ Carousel Graphic successfully painted: ${imageUrl}`);

  } catch (err) {
    console.error("❌ Visual generation failed:", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

const args = process.argv.slice(2);
if (args[0]) {
  generateBrandedGraphic(args[0]).then(() => process.exit(0));
} else {
  console.log("Empty postId. Usage: node social-visualizer.mjs <id>");
}
