import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Generous limit for image upload payloads for Veo generation
app.use(express.json({ limit: '50mb' }));

// Initialize GoogleGenAI SDK strictly with User-Agent header for telemetry
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY environment variable is not set.');
  }
  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// 1. Google Maps Grounding Endpoint (gemini-3.5-flash with googleMaps tool)
app.post('/api/gemini/maps', async (req, res) => {
  try {
    const { query, latitude, longitude } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const ai = getGenAI();
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (latitude && longitude) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config,
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text,
      groundingChunks,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/maps:', err);
    return res.status(500).json({
      error: err.message || 'Failed to fetch Maps Grounded data',
    });
  }
});

// 2. Google Search Grounding Endpoint (gemini-3.5-flash with googleSearch tool)
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingChunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return res.json({
      text,
      groundingChunks,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/search:', err);
    return res.status(500).json({
      error: err.message || 'Failed to fetch Search Grounded data',
    });
  }
});

// 3. Animate Images into Video (veo-3.1-fast-generate-preview with aspect ratio 16:9 or 9:16)
app.post('/api/gemini/veo-generate', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt, aspectRatio } = req.body;
    const ai = getGenAI();

    const selectedAspect = aspectRatio === '9:16' ? '9:16' : '16:9';
    const cleanPrompt =
      prompt || 'Cinematic video animation of this product with dynamic lighting, smooth motion, and professional advertising flair';

    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: cleanPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: selectedAspect,
      },
    };

    if (imageBase64) {
      const pureBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      payload.image = {
        imageBytes: pureBase64,
        mimeType: mimeType || 'image/jpeg',
      };
    }

    const operation = await ai.models.generateVideos(payload);
    return res.json({
      operationName: operation.name,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/veo-generate:', err);
    return res.status(500).json({
      error: err.message || 'Failed to initiate video generation with Veo',
    });
  }
});

// 4. Veo Video Status Polling Endpoint
app.post('/api/gemini/veo-status', async (req, res) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName is required' });
    }

    const ai = getGenAI();
    const updated = await ai.operations.getVideosOperation({
      operation: { name: operationName } as any,
    });

    const isDone = !!updated.done;
    const videoUri = updated.response?.generatedVideos?.[0]?.video?.uri;

    return res.json({
      done: isDone,
      videoUri: videoUri || null,
      error: updated.error || null,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/veo-status:', err);
    return res.status(500).json({
      error: err.message || 'Failed to check video operation status',
    });
  }
});

// 5. Veo Video Download Proxy (Securely stream with API key header)
app.post('/api/gemini/veo-download', async (req, res) => {
  try {
    const { videoUri } = req.body;
    if (!videoUri) {
      return res.status(400).json({ error: 'videoUri is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const videoRes = await fetch(videoUri, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });

    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video stream: ${videoRes.statusText}`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    const arrayBuffer = await videoRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Error in /api/gemini/veo-download:', err);
    return res.status(500).json({
      error: err.message || 'Failed to stream video',
    });
  }
});

// Start Full-Stack Server with Vite Middleware in Development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode: Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NOVA CART Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
