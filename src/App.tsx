import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { GridControls } from './components/GridControls';
import { CanvasViewport } from './components/CanvasViewport';
import { ExportModal } from './components/ExportModal';
import { SampleMapsModal } from './components/SampleMapsModal';
import { 
  GridSettings, 
  DEFAULT_GRID_SETTINGS, 
  ImageMetadata, 
  ActiveTool 
} from './types';
import { SAMPLE_MAPS, SampleMap } from './utils/sampleMaps';

export default function App() {
  const [imageMeta, setImageMeta] = useState<ImageMetadata | null>(null);
  const [baseImage, setBaseImage] = useState<HTMLImageElement | null>(null);
  const [gridSettings, setGridSettings] = useState<GridSettings>(DEFAULT_GRID_SETTINGS);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<ActiveTool>('pan');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 40, y: 40 });
  const [activeSampleMapId, setActiveSampleMapId] = useState<string | undefined>('wilderness');

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSampleMapsOpen, setIsSampleMapsOpen] = useState(false);

  // Helper to load an image from URL / DataURL
  const loadImageFromSource = useCallback((url: string, name: string, fileSizeBytes?: number) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setBaseImage(img);
      setImageMeta({
        name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        fileSizeBytes,
        url,
      });

      // Fit map within initial viewport nicely
      const availableW = window.innerWidth - 320 - 80;
      const availableH = window.innerHeight - 56 - 80;
      const scaleW = availableW / img.naturalWidth;
      const scaleH = availableH / img.naturalHeight;
      const fitZoom = Math.min(1.2, Math.max(0.15, Math.min(scaleW, scaleH)));
      setZoomLevel(fitZoom);

      const centerX = Math.max(20, (availableW - img.naturalWidth * fitZoom) / 2 + 40);
      const centerY = Math.max(20, (availableH - img.naturalHeight * fitZoom) / 2 + 40);
      setPanOffset({ x: centerX, y: centerY });
    };
    img.src = url;
  }, []);

  // Initialize with Wilderness sample map on first load
  useEffect(() => {
    const initialMap = SAMPLE_MAPS[0];
    loadImageFromSource(initialMap.dataUrl, initialMap.name + '.svg');
  }, [loadImageFromSource]);

  // Handle uploaded user image file
  const handleImageFileSelected = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setActiveSampleMapId(undefined);
        loadImageFromSource(result, file.name, file.size);
      }
    };
    reader.readAsDataURL(file);
  }, [loadImageFromSource]);

  // Handle choosing a sample map
  const handleSelectSampleMap = (map: SampleMap) => {
    setActiveSampleMapId(map.id);
    loadImageFromSource(map.dataUrl, map.name + '.svg');
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setZoomLevel((z) => Math.min(8.0, z * 1.25));
  };

  const handleZoomOut = () => {
    setZoomLevel((z) => Math.max(0.08, z * 0.8));
  };

  const handleZoomFit = () => {
    if (!imageMeta) return;
    const availableW = window.innerWidth - 320 - 60;
    const availableH = window.innerHeight - 56 - 60;
    const scaleW = availableW / imageMeta.width;
    const scaleH = availableH / imageMeta.height;
    const fit = Math.min(1.0, Math.min(scaleW, scaleH));
    setZoomLevel(fit);
    setPanOffset({
      x: Math.max(20, (availableW - imageMeta.width * fit) / 2 + 30),
      y: Math.max(20, (availableH - imageMeta.height * fit) / 2 + 30),
    });
  };

  const handleZoom100 = () => {
    if (!imageMeta) return;
    setZoomLevel(1);
  };

  const handleResetView = () => {
    handleZoomFit();
  };

  // Interactive Grid Alignment drag offset update
  const handleUpdateGridOffset = (dx: number, dy: number) => {
    setGridSettings((prev) => {
      const newX = prev.offsetX + dx;
      const newY = prev.offsetY + dy;
      return {
        ...prev,
        offsetX: newX,
        offsetY: newY,
      };
    });
  };

  // Center Grid on Image
  const handleCenterGrid = () => {
    if (!imageMeta) return;
    const s = gridSettings.cellSize;
    if (gridSettings.gridType === 'square') {
      const ox = (imageMeta.width % s) / 2;
      const oy = (imageMeta.height % s) / 2;
      setGridSettings((prev) => ({ ...prev, offsetX: ox, offsetY: oy }));
    } else if (gridSettings.gridType === 'hex-pointy') {
      const horizStep = Math.sqrt(3) * s;
      const vertStep = 1.5 * s;
      const ox = (imageMeta.width % horizStep) / 2;
      const oy = (imageMeta.height % vertStep) / 2;
      setGridSettings((prev) => ({ ...prev, offsetX: ox, offsetY: oy }));
    } else {
      const horizStep = 1.5 * s;
      const vertStep = Math.sqrt(3) * s;
      const ox = (imageMeta.width % horizStep) / 2;
      const oy = (imageMeta.height % vertStep) / 2;
      setGridSettings((prev) => ({ ...prev, offsetX: ox, offsetY: oy }));
    }
  };

  const handleResetGrid = () => {
    setGridSettings(DEFAULT_GRID_SETTINGS);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 font-sans text-stone-100 antialiased select-none">
      {/* Top Header */}
      <Header
        imageMeta={imageMeta}
        gridSettings={gridSettings}
        isGridVisible={isGridVisible}
        onToggleGridVisibility={() => setIsGridVisible((v) => !v)}
        onOpenExportModal={() => setIsExportOpen(true)}
        onOpenSampleMaps={() => setIsSampleMapsOpen(true)}
        onImageSelected={handleImageFileSelected}
        zoomLevel={zoomLevel}
      />

      {/* Main Workspace: Interactive Viewport + Grid Controls Sidebar */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Floating Top Floating Toolbar */}
        <Toolbar
          activeTool={activeTool}
          onChangeTool={setActiveTool}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onZoom100={handleZoom100}
          onResetView={handleResetView}
        />

        {/* Canvas Viewport */}
        <CanvasViewport
          imageMeta={imageMeta}
          baseImage={baseImage}
          gridSettings={gridSettings}
          isGridVisible={isGridVisible}
          activeTool={activeTool}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          onUpdateZoom={setZoomLevel}
          onUpdatePan={setPanOffset}
          onUpdateGridOffset={handleUpdateGridOffset}
          onImageSelected={handleImageFileSelected}
          onOpenSampleMaps={() => setIsSampleMapsOpen(true)}
        />

        {/* Right Sidebar: Grid Customization & Layer Settings */}
        <GridControls
          settings={gridSettings}
          onChangeSettings={setGridSettings}
          imageMeta={imageMeta}
          onCenterGrid={handleCenterGrid}
          onResetGrid={handleResetGrid}
        />
      </main>

      {/* Export Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        baseImage={baseImage}
        imageMeta={imageMeta}
        gridSettings={gridSettings}
      />

      {/* Sample Maps Modal */}
      <SampleMapsModal
        isOpen={isSampleMapsOpen}
        onClose={() => setIsSampleMapsOpen(false)}
        onSelectMap={handleSelectSampleMap}
        activeMapId={activeSampleMapId}
      />
    </div>
  );
}
