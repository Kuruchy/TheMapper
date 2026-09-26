import React, { useState } from 'react';
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GridSettings, ImageMetadata } from '../types';
import { exportMergedImage } from '../utils/gridRenderer';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseImage: HTMLImageElement | null;
  imageMeta: ImageMetadata | null;
  gridSettings: GridSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  baseImage,
  imageMeta,
  gridSettings,
}) => {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !baseImage || !imageMeta) return null;

  const targetWidth = Math.round(imageMeta.width * scale);
  const targetHeight = Math.round(imageMeta.height * scale);

  const getCleanFilename = () => {
    const baseName = imageMeta.name.replace(/\.[^/.]+$/, '');
    return `${baseName}-grid.${format}`;
  };

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      setErrorMsg(null);
      const blob = await exportMergedImage(baseImage, gridSettings, format, quality, scale);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getCleanFilename();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMsg(err.message || 'Export failed');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      setIsExporting(true);
      setErrorMsg(null);
      // Clipboard API supports image/png natively
      const blob = await exportMergedImage(baseImage, gridSettings, 'png', 1, scale);
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob,
        }),
      ]);
      setCopied(true);
      setIsExporting(false);
      setTimeout(() => setCopied(false), 2500);
    } catch (err: any) {
      setIsExporting(false);
      setErrorMsg('Clipboard copy failed. Your browser may require manual download.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-stone-200">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-stone-100">Export Gridded Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Resolution & Info Card */}
          <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-stone-400 block">Export Dimensions</span>
              <span className="text-base font-mono font-bold text-stone-100">
                {targetWidth} × {targetHeight} px
              </span>
              <span className="text-[11px] text-stone-500 block">
                {((targetWidth * targetHeight) / 1_000_000).toFixed(2)} Megapixels ·{' '}
                {gridSettings.gridType === 'hex-pointy'
                  ? 'Hex (Pointed)'
                  : gridSettings.gridType === 'hex-flat'
                  ? 'Hex (Flat)'
                  : 'Square'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">File Output</span>
              <span className="text-xs font-mono text-amber-400 font-medium">
                {getCleanFilename()}
              </span>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <span className="text-xs text-stone-400 block mb-1.5">File Format</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'png', label: 'PNG', desc: 'Lossless & Crisp' },
                { id: 'jpeg', label: 'JPEG', desc: 'Smaller File' },
                { id: 'webp', label: 'WebP', desc: 'Modern & Compact' },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id as any)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    format === fmt.id
                      ? 'border-amber-500 bg-amber-500/10 text-stone-100 ring-1 ring-amber-500/50'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">{fmt.label}</div>
                  <div className="text-[10px] text-stone-500">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (for JPEG / WebP) */}
          {format !== 'png' && (
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-stone-400">Compression Quality</span>
                <span className="font-mono text-amber-400 text-xs">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={1.0}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {/* Output Scale Resolution */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-stone-400">Resolution Multiplier</span>
              <span className="font-mono text-stone-300 text-xs">{scale}x Native</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Original (1x)', val: 1 },
                { label: 'Large (1.5x)', val: 1.5 },
                { label: 'Super-Sample (2x)', val: 2 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setScale(s.val)}
                  className={`py-1.5 text-xs rounded border transition-colors ${
                    scale === s.val
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold'
                      : 'border-stone-800 bg-stone-950 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyToClipboard}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied PNG to Clipboard!' : 'Copy to Clipboard'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Image...' : 'Download Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
