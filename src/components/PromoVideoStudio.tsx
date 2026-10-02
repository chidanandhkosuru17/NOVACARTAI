import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  Sparkles,
  Download,
  Play,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Monitor,
  Smartphone,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const PromoVideoStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [prompt, setPrompt] = useState(
    'Animate this quick-commerce product into a dynamic, appetizing promotional video with smooth lighting shifts and cinematic commercial camera movement'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Curated sample quick-commerce product images
  const sampleItems = [
    {
      title: 'Artisan Bakery Bread',
      prompt: 'Animate this artisan loaf with warm bakery sunlight, rising steam, and appetizing slow-motion camera pan',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Fresh Farm Produce Basket',
      prompt: 'Cinematic commercial animation of fresh crisp vegetables with glistening water droplets and energetic delivery vibes',
      url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80',
    },
    {
      title: 'Cold Brew & Dairy',
      prompt: 'Dynamic close-up commercial animation with swirling condensed milk and rich cold brew coffee motion',
      url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    },
  ];

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof sampleItems[0]) => {
    setPrompt(sample.prompt);
    try {
      const response = await fetch(sample.url);
      const blob = await response.blob();
      setMimeType(blob.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(blob);
    } catch {
      setSelectedImage(sample.url);
    }
  };

  // Step 1: Request Video Generation
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setVideoUrl(null);
    setStatusMessage('Connecting to Veo video generation engine (veo-3.1-fast-generate-preview)...');

    try {
      const res = await fetch('/api/gemini/veo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          mimeType,
          prompt,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to start Veo generation');
      }

      setOperationName(data.operationName);
      setStatusMessage('Video synthesis initiated. Analyzing image structure & lighting...');
    } catch (err: any) {
      console.error('Error starting Veo generation:', err);
      setErrorMessage(err.message || 'Error initiating video generation.');
      setIsGenerating(false);
    }
  };

  // Step 2: Poll operation status
  useEffect(() => {
    if (!operationName || !isGenerating) return;

    const progressMessages = [
      'Synthesizing frame-by-frame temporal motion with Veo...',
      'Refining dynamic lighting, reflections and shadows...',
      'Applying quick-commerce high-fidelity video enhancements...',
      'Finalizing MP4 encoding and bitrate optimization...',
    ];

    let messageIdx = 0;
    const messageInterval = setInterval(() => {
      messageIdx = (messageIdx + 1) % progressMessages.length;
      setStatusMessage(progressMessages[messageIdx]);
    }, 8000);

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/gemini/veo-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName }),
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error.message || 'Veo generation encountered an error.');
        }

        if (data.done && data.videoUri) {
          clearInterval(pollInterval);
          clearInterval(messageInterval);
          setStatusMessage('Video generation completed! Downloading stream...');

          // Fetch video via server proxy
          const downloadRes = await fetch('/api/gemini/veo-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ videoUri: data.videoUri }),
          });

          if (!downloadRes.ok) {
            throw new Error('Failed to retrieve finalized video file.');
          }

          const videoBlob = await downloadRes.blob();
          const videoObjectUrl = URL.createObjectURL(videoBlob);
          setVideoUrl(videoObjectUrl);
          setIsGenerating(false);
          setOperationName(null);
          setStatusMessage('');
        }
      } catch (pollErr: any) {
        console.error('Polling error:', pollErr);
        setErrorMessage(pollErr.message || 'Polling error occurred.');
        clearInterval(pollInterval);
        clearInterval(messageInterval);
        setIsGenerating(false);
      }
    }, 10000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(messageInterval);
    };
  }, [operationName, isGenerating]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-2xl border border-purple-500/30">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-purple-500/20 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold text-purple-300 backdrop-blur-md">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>VEO VIDEO GENERATIONS (VEO-3.1-FAST-GENERATE-PREVIEW)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Store Promo & Video Studio
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Upload local retailer product photography and generate high-impact quick-commerce promotional videos.
              Supports both <strong>16:9 Landscape</strong> (Web Banners) and <strong>9:16 Portrait</strong> (Instagram Reels / Stories / TikTok ads).
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
            <Video className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300 font-medium">Veo 3.1 Fast Video Engine</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Setup */}
        <div className="lg:col-span-6 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              1. Choose or Upload Product Photo
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Upload your own local Kirana item or select a sample product
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Box / Image Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-3xl p-6 text-center cursor-pointer transition bg-slate-950/60 group relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]"
            >
              {selectedImage ? (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Selected Product"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                    Click to change photo
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to upload product image
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Supports PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Curated Sample Thumbnails */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Or pick a quick-commerce sample:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {sampleItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSample(item)}
                    className="p-2 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 transition text-left space-y-1.5"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-16 object-cover rounded-xl"
                    />
                    <p className="text-[10px] font-bold text-slate-200 truncate">
                      {item.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratio Selector (Mandatory 16:9 or 9:16) */}
          <div>
            <h3 className="text-sm font-bold text-white mb-2">
              2. Select Video Aspect Ratio
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                  aspectRatio === '16:9'
                    ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs font-bold">16:9 Landscape</p>
                  <p className="text-[10px] text-slate-400">Desktop & Banner Ads</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-3.5 rounded-2xl border text-left transition flex items-center space-x-3 ${
                  aspectRatio === '9:16'
                    ? 'bg-purple-950/40 border-purple-500 text-white ring-1 ring-purple-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs font-bold">9:16 Portrait</p>
                  <p className="text-[10px] text-slate-400">Reels, Stories, Shorts</p>
                </div>
              </button>
            </div>
          </div>

          {/* Creative Prompt Input */}
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              3. Animation Instructions / Prompt
            </h3>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how the product should be animated..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Generate CTA Button */}
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 hover:from-purple-500 hover:to-teal-400 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                <span>Generating Video with Veo...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Animate with Veo (veo-3.1-fast-generate-preview)</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Video Output & Live Status */}
        <div className="lg:col-span-6 bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">
                  Generated Video Preview
                </h3>
              </div>
              <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Aspect: {aspectRatio}
              </span>
            </div>

            {/* Loading / Generating State Card */}
            {isGenerating && (
              <div className="p-8 rounded-3xl bg-slate-950/80 border border-purple-500/30 text-center space-y-4 my-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Generating Promo Video
                  </h4>
                  <p className="text-xs text-purple-300 mt-1 max-w-sm mx-auto animate-fade">
                    {statusMessage || 'Processing frame transitions with Veo model...'}
                  </p>
                </div>
                <p className="text-[10px] text-slate-500">
                  Note: High-fidelity Veo video generation takes 30–90 seconds. Please keep this tab open.
                </p>
              </div>
            )}

            {/* Video Player Output */}
            {videoUrl && !isGenerating && (
              <div className="space-y-4 my-2">
                <div
                  className={`rounded-2xl overflow-hidden bg-black mx-auto shadow-2xl border border-slate-800 ${
                    aspectRatio === '9:16' ? 'max-w-[280px]' : 'w-full'
                  }`}
                >
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full h-auto rounded-2xl"
                  />
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-xs text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                    Video generated successfully in {aspectRatio}!
                  </span>
                  <a
                    href={videoUrl}
                    download={`NOVA_CART_Promo_${aspectRatio.replace(':', '_')}.mp4`}
                    className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download MP4
                  </a>
                </div>
              </div>
            )}

            {!videoUrl && !isGenerating && (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/60 rounded-3xl border border-slate-800 my-8 space-y-2">
                <Film className="w-8 h-8 mx-auto text-slate-700" />
                <p>No video generated yet.</p>
                <p className="text-[11px] text-slate-600">
                  Upload an image and click "Animate with Veo" to produce an ad ready for social campaigns.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: veo-3.1-fast-generate-preview</span>
            <span className="text-purple-400 font-mono font-bold">Marketing Retention Creative Studio</span>
          </div>
        </div>
      </div>
    </div>
  );
};
