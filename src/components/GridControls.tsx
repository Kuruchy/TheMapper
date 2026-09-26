import React, { useState } from 'react';
import { 
  Sliders, 
  Grid as GridIcon, 
  Compass, 
  Palette, 
  Hash, 
  Crosshair, 
  Move, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check
} from 'lucide-react';
import { GridSettings, GridType, LineStyle, BlendMode, CoordinateFormat, ImageMetadata } from '../types';

interface GridControlsProps {
  settings: GridSettings;
  onChangeSettings: (updater: (prev: GridSettings) => GridSettings) => void;
  imageMeta: ImageMetadata | null;
  onCenterGrid: () => void;
  onResetGrid: () => void;
}

const PRESET_COLORS = [
  { name: 'Pure White', value: '#ffffff' },
  { name: 'Pitch Black', value: '#0f172a' },
  { name: 'Sepia Parchment', value: '#5c3a21' },
  { name: 'Radiant Amber', value: '#f59e0b' },
  { name: 'Cyber Cyan', value: '#06b6d4' },
  { name: 'Crimson Red', value: '#ef4444' },
  { name: 'Tactical Lime', value: '#10b981' },
  { name: 'Ultraviolet', value: '#8b5cf6' },
];

export const GridControls: React.FC<GridControlsProps> = ({
  settings,
  onChangeSettings,
  imageMeta,
  onCenterGrid,
  onResetGrid,
}) => {
  const [openSection, setOpenSection] = useState<{ [key: string]: boolean }>({
    type: true,
    size: true,
    style: true,
    offset: true,
    coords: false,
    markers: false,
  });

  const toggleSection = (section: string) => {
    setOpenSection((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Helper to calculate cell count
  const getCellCounts = () => {
    if (!imageMeta) return null;
    const w = imageMeta.width;
    const h = imageMeta.height;
    const s = Math.max(8, settings.cellSize);

    if (settings.gridType === 'square') {
      const cols = Math.round(w / s);
      const rows = Math.round(h / s);
      return { cols, rows, total: cols * rows };
    } else if (settings.gridType === 'hex-pointy') {
      const horizStep = Math.sqrt(3) * s;
      const vertStep = 1.5 * s;
      const cols = Math.round(w / horizStep);
      const rows = Math.round(h / vertStep);
      return { cols, rows, total: cols * rows };
    } else {
      const horizStep = 1.5 * s;
      const vertStep = Math.sqrt(3) * s;
      const cols = Math.round(w / horizStep);
      const rows = Math.round(h / vertStep);
      return { cols, rows, total: cols * rows };
    }
  };

  const cellStats = getCellCounts();

  return (
    <aside className="w-80 flex-shrink-0 bg-stone-900/95 border-l border-stone-800 text-stone-200 flex flex-col h-full overflow-hidden select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
            Grid Layer Settings
          </span>
        </div>
        <button
          onClick={onResetGrid}
          className="text-[11px] text-stone-400 hover:text-stone-200 flex items-center gap-1 transition-colors"
          title="Reset all grid parameters to default"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Scrollable Control Stack */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 p-3 space-y-4">
        {/* 1. Grid Type Selector */}
        <div>
          <button
            onClick={() => toggleSection('type')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <GridIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Grid Geometry</span>
            </div>
            {openSection.type ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.type && (
            <div className="mt-2.5 grid grid-cols-3 gap-1.5 p-1 bg-stone-950/60 rounded-lg border border-stone-800/80">
              {/* Pointy Hex */}
              <button
                onClick={() => onChangeSettings((s) => ({ ...s, gridType: 'hex-pointy' }))}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-center transition-all ${
                  settings.gridType === 'hex-pointy'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {/* SVG icon for Pointy Hex */}
                <svg className="w-5 h-5 mb-1 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="12,2 21,7.2 21,16.8 12,22 3,16.8 3,7.2" />
                </svg>
                <span className="text-[11px] leading-tight">Hex</span>
                <span className="text-[9px] opacity-80">Pointed Up</span>
              </button>

              {/* Flat Hex */}
              <button
                onClick={() => onChangeSettings((s) => ({ ...s, gridType: 'hex-flat' }))}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-center transition-all ${
                  settings.gridType === 'hex-flat'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {/* SVG icon for Flat Hex */}
                <svg className="w-5 h-5 mb-1 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <polygon points="2,12 7.2,3 16.8,3 22,12 16.8,21 7.2,21" />
                </svg>
                <span className="text-[11px] leading-tight">Hex</span>
                <span className="text-[9px] opacity-80">Flat Side Up</span>
              </button>

              {/* Square */}
              <button
                onClick={() => onChangeSettings((s) => ({ ...s, gridType: 'square' }))}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-center transition-all ${
                  settings.gridType === 'square'
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60'
                }`}
              >
                {/* SVG icon for Square Grid */}
                <svg className="w-5 h-5 mb-1 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="1" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="12" y1="3" x2="12" y2="21" />
                </svg>
                <span className="text-[11px] leading-tight">Square</span>
                <span className="text-[9px] opacity-80">Standard</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Cell Size & Scale */}
        <div className="pt-3">
          <button
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Cell Size & Scale</span>
            </div>
            {openSection.size ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.size && (
            <div className="mt-2.5 space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">
                    {settings.gridType === 'square' ? 'Cell Width' : 'Hex Radius (R)'}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-amber-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                    <input
                      type="number"
                      min={10}
                      max={400}
                      value={settings.cellSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 10;
                        onChangeSettings((s) => ({ ...s, cellSize: Math.max(8, Math.min(600, val)) }));
                      }}
                      className="w-12 bg-transparent text-right outline-none text-xs"
                    />
                    <span className="text-stone-500 text-[10px]">px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={12}
                  max={240}
                  step={1}
                  value={settings.cellSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    onChangeSettings((s) => ({ ...s, cellSize: val }));
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Quick Size Presets */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-stone-500">Presets:</span>
                {[
                  { label: 'Micro', size: 28 },
                  { label: 'Standard', size: 48 },
                  { label: 'Tactical', size: 75 },
                  { label: 'Large', size: 120 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => onChangeSettings((s) => ({ ...s, cellSize: preset.size }))}
                    className={`px-2 py-1 rounded border transition-colors ${
                      settings.cellSize === preset.size
                        ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
                        : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Grid dimensions indicator */}
              {cellStats && (
                <div className="p-2 rounded bg-stone-950/60 border border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>Grid Coverage:</span>
                  <span className="font-mono text-stone-300">
                    ~{cellStats.cols} × {cellStats.rows} cells ({cellStats.total.toLocaleString()} total)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Line Appearance (Thickness & Opacity) */}
        <div className="pt-3">
          <button
            onClick={() => toggleSection('style')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Line Thickness & Opacity</span>
            </div>
            {openSection.style ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.style && (
            <div className="mt-2.5 space-y-3.5">
              {/* Opacity Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">Grid Opacity</span>
                  <span className="font-mono text-amber-400 text-xs">
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.05}
                  max={1.0}
                  step={0.01}
                  value={settings.opacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeSettings((s) => ({ ...s, opacity: val }));
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Line Thickness Slider */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">Line Thickness</span>
                  <span className="font-mono text-amber-400 text-xs">
                    {settings.lineThickness.toFixed(1)} px
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={12}
                  step={0.5}
                  value={settings.lineThickness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChangeSettings((s) => ({ ...s, lineThickness: val }));
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                />
                <div className="flex gap-1.5 mt-1 text-[10px]">
                  {[
                    { label: 'Hairline (1px)', val: 1 },
                    { label: 'Normal (2px)', val: 2 },
                    { label: 'Bold (3.5px)', val: 3.5 },
                    { label: 'Heavy (6px)', val: 6 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => onChangeSettings((s) => ({ ...s, lineThickness: p.val }))}
                      className={`px-1.5 py-0.5 rounded border text-[10px] ${
                        settings.lineThickness === p.val
                          ? 'border-amber-500/80 bg-amber-500/20 text-amber-300'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      {p.val}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Color & Preset Chips */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-stone-400">Line Color</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span
                      className="w-3.5 h-3.5 rounded border border-stone-600 inline-block shadow-sm"
                      style={{ backgroundColor: settings.lineColor }}
                    />
                    <span className="text-stone-300 uppercase">{settings.lineColor}</span>
                  </div>
                </div>

                {/* Preset color swatches */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => onChangeSettings((s) => ({ ...s, lineColor: color.value }))}
                      title={color.name}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-transform hover:scale-110 ${
                        settings.lineColor.toLowerCase() === color.value.toLowerCase()
                          ? 'border-amber-400 ring-2 ring-amber-400/40'
                          : 'border-stone-700/80'
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {settings.lineColor.toLowerCase() === color.value.toLowerCase() && (
                        <Check
                          className={`w-3.5 h-3.5 ${
                            color.value === '#ffffff' || color.value === '#f59e0b'
                              ? 'text-stone-900'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Color Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.lineColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeSettings((s) => ({ ...s, lineColor: val }));
                    }}
                    className="w-8 h-8 rounded border border-stone-700 bg-transparent cursor-pointer p-0"
                  />
                  <input
                    type="text"
                    value={settings.lineColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      onChangeSettings((s) => ({ ...s, lineColor: val }));
                    }}
                    className="flex-1 bg-stone-950 px-2 py-1 rounded border border-stone-800 text-xs font-mono text-stone-200 outline-none focus:border-amber-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              {/* Line Style (Solid, Dashed, Dotted, Vertex Dots) */}
              <div>
                <span className="text-xs text-stone-400 block mb-1.5 font-medium">Line Pattern</span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-stone-950 rounded border border-stone-800">
                  {[
                    { id: 'solid', label: 'Solid', sub: 'Continuous' },
                    { id: 'dashed', label: 'Dashed', sub: 'Custom Dash' },
                    { id: 'dotted', label: 'Dotted', sub: 'Round Dots' },
                    { id: 'vertex-dots', label: 'Corners', sub: 'Vertex Only' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => onChangeSettings((s) => ({ ...s, lineStyle: style.id as LineStyle }))}
                      className={`py-1.5 px-1 flex flex-col items-center justify-center rounded text-center transition-colors ${
                        settings.lineStyle === style.id
                          ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-xs leading-none">{style.label}</span>
                      <span className="text-[9px] opacity-75 mt-0.5 leading-none">{style.sub}</span>
                    </button>
                  ))}
                </div>

                {/* Sub-controls when 'dashed' is selected */}
                {settings.lineStyle === 'dashed' && (
                  <div className="mt-2.5 p-2.5 bg-stone-950/80 rounded-lg border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300">Dashed Line Fine-Tuning</span>
                      {/* Live visual preview bar of dash */}
                      <div className="w-20 h-4 bg-stone-900 border border-stone-800 rounded flex items-center px-1">
                        <svg className="w-full h-2">
                          <line
                            x1="0"
                            y1="1"
                            x2="100%"
                            y2="1"
                            stroke={settings.lineColor}
                            strokeWidth={Math.min(3, settings.lineThickness)}
                            strokeDasharray={`${settings.dashLength ?? 8},${settings.dashGap ?? 6}`}
                            strokeLinecap={settings.dashCap ?? 'butt'}
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Dash Length Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-stone-400">Dash Length</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {settings.dashLength ?? 8} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={36}
                        step={1}
                        value={settings.dashLength ?? 8}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onChangeSettings((s) => ({ ...s, dashLength: val }));
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-1 mt-1 text-[10px]">
                        {[
                          { label: 'Short', val: 4 },
                          { label: 'Normal', val: 8 },
                          { label: 'Long', val: 14 },
                          { label: 'Wide', val: 22 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            onClick={() => onChangeSettings((s) => ({ ...s, dashLength: p.val }))}
                            className={`flex-1 py-0.5 rounded border text-[10px] text-center ${
                              (settings.dashLength ?? 8) === p.val
                                ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 font-medium'
                                : 'border-stone-800 bg-stone-900 text-stone-400 hover:bg-stone-800'
                            }`}
                          >
                            {p.label} ({p.val}px)
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dash Gap Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-stone-400">Gap Spacing</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {settings.dashGap ?? 6} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={36}
                        step={1}
                        value={settings.dashGap ?? 6}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onChangeSettings((s) => ({ ...s, dashGap: val }));
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-1 mt-1 text-[10px]">
                        {[
                          { label: 'Tight', val: 3 },
                          { label: 'Balanced', val: 6 },
                          { label: 'Spaced', val: 12 },
                          { label: 'Sparse', val: 20 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            onClick={() => onChangeSettings((s) => ({ ...s, dashGap: p.val }))}
                            className={`flex-1 py-0.5 rounded border text-[10px] text-center ${
                              (settings.dashGap ?? 6) === p.val
                                ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 font-medium'
                                : 'border-stone-800 bg-stone-900 text-stone-400 hover:bg-stone-800'
                            }`}
                          >
                            {p.label} ({p.val}px)
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Dash End Caps (Flat vs Round) */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-stone-400">Dash Ends:</span>
                      <div className="flex gap-1 bg-stone-900 p-0.5 rounded border border-stone-800">
                        <button
                          onClick={() => onChangeSettings((s) => ({ ...s, dashCap: 'butt' }))}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            (settings.dashCap ?? 'butt') === 'butt'
                              ? 'bg-amber-500 text-stone-950 font-semibold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Flat (Crisp)
                        </button>
                        <button
                          onClick={() => onChangeSettings((s) => ({ ...s, dashCap: 'round' }))}
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            settings.dashCap === 'round'
                              ? 'bg-amber-500 text-stone-950 font-semibold'
                              : 'text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          Rounded
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-controls when 'dotted' is selected */}
                {settings.lineStyle === 'dotted' && (
                  <div className="mt-2.5 p-2.5 bg-stone-950/80 rounded-lg border border-stone-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-300">Dotted Line Fine-Tuning</span>
                      {/* Live visual preview of dots */}
                      <div className="w-20 h-4 bg-stone-900 border border-stone-800 rounded flex items-center px-1">
                        <svg className="w-full h-2">
                          <line
                            x1="0"
                            y1="1"
                            x2="100%"
                            y2="1"
                            stroke={settings.lineColor}
                            strokeWidth={Math.min(3, settings.lineThickness)}
                            strokeDasharray={`0.001,${settings.dotSpacing ?? 10}`}
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Dot Spacing Slider */}
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-stone-400">Dot Spacing (Center-to-Center)</span>
                        <span className="font-mono text-amber-400 text-xs">
                          {settings.dotSpacing ?? 10} px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={3}
                        max={36}
                        step={1}
                        value={settings.dotSpacing ?? 10}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          onChangeSettings((s) => ({ ...s, dotSpacing: val }));
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                      />
                      <div className="flex gap-1 mt-1 text-[10px]">
                        {[
                          { label: 'Dense', val: 6 },
                          { label: 'Standard', val: 10 },
                          { label: 'Spaced', val: 16 },
                          { label: 'Sparse', val: 24 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            onClick={() => onChangeSettings((s) => ({ ...s, dotSpacing: p.val }))}
                            className={`flex-1 py-0.5 rounded border text-[10px] text-center ${
                              (settings.dotSpacing ?? 10) === p.val
                                ? 'border-amber-500/80 bg-amber-500/20 text-amber-300 font-medium'
                                : 'border-stone-800 bg-stone-900 text-stone-400 hover:bg-stone-800'
                            }`}
                          >
                            {p.label} ({p.val}px)
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] text-stone-400 leading-tight">
                      Dots are rendered as true circular points. Dot diameter equals your line thickness ({settings.lineThickness.toFixed(1)}px).
                    </p>
                  </div>
                )}

                {/* Sub-controls when 'vertex-dots' is selected */}
                {settings.lineStyle === 'vertex-dots' && (
                  <div className="mt-2.5 p-2.5 bg-stone-950/80 rounded-lg border border-stone-800 text-[11px] text-stone-400">
                    <p className="text-amber-300 font-medium mb-1">Tactical Vertex / Corner Dots</p>
                    <p className="leading-relaxed">
                      Dots are drawn exclusively at cell corners and grid intersections for a clean, minimal battlemap overlay. Use the <strong className="text-stone-300">Line Thickness</strong> slider above to adjust dot size.
                    </p>
                  </div>
                )}
              </div>

              {/* Blend Mode */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">Blend Mode</span>
                  <span className="text-[10px] text-stone-500">For light/dark map contrast</span>
                </div>
                <select
                  value={settings.blendMode}
                  onChange={(e) => {
                    const mode = e.target.value as BlendMode;
                    onChangeSettings((s) => ({ ...s, blendMode: mode }));
                  }}
                  className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-amber-500"
                >
                  <option value="source-over">Normal (Standard)</option>
                  <option value="screen">Screen (Best on Dark Maps)</option>
                  <option value="multiply">Multiply (Best on Parchment/Light)</option>
                  <option value="overlay">Overlay (High Contrast)</option>
                  <option value="difference">Difference (Invert Contrast)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 4. Offset & Alignment */}
        <div className="pt-3">
          <button
            onClick={() => toggleSection('offset')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Grid Alignment & Offset</span>
            </div>
            {openSection.offset ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.offset && (
            <div className="mt-2.5 space-y-3">
              <div className="text-[11px] text-stone-400 bg-stone-950/60 p-2 rounded border border-stone-800/80">
                Tip: Switch to the <strong className="text-amber-400 font-medium">Align Grid</strong> tool on the top toolbar to click & drag the grid directly over features!
              </div>

              {/* Offset X */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">Offset X</span>
                  <span className="font-mono text-amber-400 text-xs">{Math.round(settings.offsetX)} px</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onChangeSettings((s) => ({ ...s, offsetX: s.offsetX - 1 }))}
                    className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 rounded text-xs"
                    title="-1px"
                  >
                    -1
                  </button>
                  <input
                    type="range"
                    min={-Math.max(100, settings.cellSize * 2)}
                    max={Math.max(100, settings.cellSize * 2)}
                    step={1}
                    value={settings.offsetX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onChangeSettings((s) => ({ ...s, offsetX: val }));
                    }}
                    className="flex-1 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => onChangeSettings((s) => ({ ...s, offsetX: s.offsetX + 1 }))}
                    className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 rounded text-xs"
                    title="+1px"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Offset Y */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-stone-400">Offset Y</span>
                  <span className="font-mono text-amber-400 text-xs">{Math.round(settings.offsetY)} px</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onChangeSettings((s) => ({ ...s, offsetY: s.offsetY - 1 }))}
                    className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 rounded text-xs"
                    title="-1px"
                  >
                    -1
                  </button>
                  <input
                    type="range"
                    min={-Math.max(100, settings.cellSize * 2)}
                    max={Math.max(100, settings.cellSize * 2)}
                    step={1}
                    value={settings.offsetY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onChangeSettings((s) => ({ ...s, offsetY: val }));
                    }}
                    className="flex-1 accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={() => onChangeSettings((s) => ({ ...s, offsetY: s.offsetY + 1 }))}
                    className="px-2 py-0.5 bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 rounded text-xs"
                    title="+1px"
                  >
                    +1
                  </button>
                </div>
              </div>

              {/* Alignment Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={onCenterGrid}
                  className="px-2.5 py-1.5 rounded bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors"
                >
                  Center On Map
                </button>
                <button
                  onClick={() => onChangeSettings((s) => ({ ...s, offsetX: 0, offsetY: 0 }))}
                  className="px-2.5 py-1.5 rounded bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 text-xs font-medium transition-colors"
                >
                  Zero Offset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Coordinates & Labels */}
        <div className="pt-3">
          <button
            onClick={() => toggleSection('coords')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-amber-400" />
              <span>Coordinates & Labels</span>
            </div>
            {openSection.coords ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.coords && (
            <div className="mt-2.5 space-y-3">
              {/* Show coordinates toggle */}
              <label className="flex items-center justify-between text-xs cursor-pointer p-2 bg-stone-950/60 rounded border border-stone-800/80">
                <span className="text-stone-300 font-medium">Show Cell Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.showCoordinates}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChangeSettings((s) => ({ ...s, showCoordinates: checked }));
                  }}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              {settings.showCoordinates && (
                <>
                  {/* Format Selector */}
                  <div>
                    <span className="text-xs text-stone-400 block mb-1">Format</span>
                    <select
                      value={settings.coordFormat}
                      onChange={(e) => {
                        const fmt = e.target.value as CoordinateFormat;
                        onChangeSettings((s) => ({ ...s, coordFormat: fmt }));
                      }}
                      className="w-full bg-stone-950 border border-stone-800 text-stone-200 text-xs rounded px-2.5 py-1.5 outline-none focus:border-amber-500"
                    >
                      <option value="wargame">Wargame Military (0101, 0102)</option>
                      <option value="alphanumeric">Alphanumeric (A1, B2)</option>
                      <option value="numeric">Row/Col (1,1)</option>
                      <option value="axial">Axial Hex (q:1, r:1)</option>
                    </select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-stone-400">Font Size</span>
                      <span className="font-mono text-amber-400 text-xs">{settings.coordFontSize} px</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={32}
                      step={1}
                      value={settings.coordFontSize}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChangeSettings((s) => ({ ...s, coordFontSize: val }));
                      }}
                      className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Label Color & Opacity */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">Label Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settings.coordColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            onChangeSettings((s) => ({ ...s, coordColor: val }));
                          }}
                          className="w-7 h-7 rounded border border-stone-700 bg-transparent cursor-pointer p-0"
                        />
                        <span className="text-xs font-mono uppercase text-stone-400">
                          {settings.coordColor}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] text-stone-400 block mb-1">
                        Opacity ({Math.round(settings.coordOpacity * 100)}%)
                      </span>
                      <input
                        type="range"
                        min={0.1}
                        max={1.0}
                        step={0.05}
                        value={settings.coordOpacity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          onChangeSettings((s) => ({ ...s, coordOpacity: val }));
                        }}
                        className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer mt-2"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 6. Center Markers & Fill Shading */}
        <div className="pt-3">
          <button
            onClick={() => toggleSection('markers')}
            className="w-full flex items-center justify-between text-xs font-semibold text-stone-300 py-1"
          >
            <div className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              <span>Center Markers & Tint</span>
            </div>
            {openSection.markers ? <ChevronUp className="w-3.5 h-3.5 text-stone-500" /> : <ChevronDown className="w-3.5 h-3.5 text-stone-500" />}
          </button>

          {openSection.markers && (
            <div className="mt-2.5 space-y-3">
              {/* Center Marker Type */}
              <div>
                <span className="text-xs text-stone-400 block mb-1.5">Center Point Marker</span>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-950 rounded border border-stone-800">
                  {[
                    { id: 'none', label: 'None' },
                    { id: 'dot', label: 'Dot' },
                    { id: 'crosshair', label: 'Crosshair' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() =>
                        onChangeSettings((s) => ({
                          ...s,
                          showCenterMarkers: m.id !== 'none',
                          centerMarkerType: m.id as 'none' | 'dot' | 'crosshair',
                        }))
                      }
                      className={`py-1 text-xs rounded transition-colors ${
                        (settings.showCenterMarkers ? settings.centerMarkerType : 'none') === m.id
                          ? 'bg-amber-500 text-stone-950 font-bold'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marker Size */}
              {settings.showCenterMarkers && settings.centerMarkerType !== 'none' && (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-stone-400">Marker Size</span>
                    <span className="font-mono text-amber-400 text-xs">{settings.centerMarkerSize} px</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={16}
                    step={1}
                    value={settings.centerMarkerSize}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      onChangeSettings((s) => ({ ...s, centerMarkerSize: val }));
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Alternating Checker Shading */}
              <label className="flex items-center justify-between text-xs cursor-pointer p-2 bg-stone-950/60 rounded border border-stone-800/80">
                <span className="text-stone-300 font-medium">Alternating Cell Shade</span>
                <input
                  type="checkbox"
                  checked={settings.alternatingShade}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onChangeSettings((s) => ({ ...s, alternatingShade: checked }));
                  }}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
              </label>

              {settings.alternatingShade && (
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-stone-400">Shade Intensity</span>
                    <span className="font-mono text-amber-400 text-xs">
                      {Math.round(settings.alternatingOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.02}
                    max={0.35}
                    step={0.01}
                    value={settings.alternatingOpacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onChangeSettings((s) => ({ ...s, alternatingOpacity: val }));
                    }}
                    className="w-full accent-amber-500 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
