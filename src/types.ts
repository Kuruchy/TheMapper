export type GridType = 'hex-pointy' | 'hex-flat' | 'square';

export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'vertex-dots';

export type CoordinateFormat = 'none' | 'alphanumeric' | 'numeric' | 'wargame' | 'axial';

export type BlendMode = 'source-over' | 'multiply' | 'screen' | 'overlay' | 'difference';

export type ActiveTool = 'pan' | 'align-grid' | 'split-compare';

export interface GridSettings {
  gridType: GridType;
  cellSize: number; // Hex radius R (or square width) in pixels
  lineThickness: number; // in pixels (e.g., 1, 1.5, 2, 4)
  opacity: number; // 0 to 1
  lineColor: string; // hex color #ffffff
  lineStyle: LineStyle;
  
  // Advanced pattern controls for dashed & dotted styles
  dashLength: number; // in pixels (e.g., 8)
  dashGap: number; // in pixels (e.g., 6)
  dotSpacing: number; // spacing between dots in pixels (e.g., 10)
  dashCap: 'butt' | 'round'; // sharp flat dash ends vs rounded ends
  
  blendMode: BlendMode;
  offsetX: number; // horizontal grid offset in pixels
  offsetY: number; // vertical grid offset in pixels
  
  // Coordinates & Labels
  showCoordinates: boolean;
  coordFormat: CoordinateFormat;
  coordFontSize: number;
  coordColor: string;
  coordOpacity: number;
  coordStartCol: number; // starting index (e.g. 1)
  coordStartRow: number;
  
  // Markers & Fill
  showCenterMarkers: boolean;
  centerMarkerType: 'dot' | 'crosshair' | 'none';
  centerMarkerSize: number;
  centerMarkerColor: string;
  
  cellFillColor: string;
  cellFillOpacity: number;
  alternatingShade: boolean;
  alternatingOpacity: number;
}

export interface ImageMetadata {
  name: string;
  width: number;
  height: number;
  aspectRatio: number;
  fileSizeBytes?: number;
  type?: string;
  url: string;
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number; // 0.1 to 1.0 (for jpeg/webp)
  scale: number; // 1 = 100% native resolution, 2 = 2x super-sample, 0.5 = 50%
  filename: string;
}

export const DEFAULT_GRID_SETTINGS: GridSettings = {
  gridType: 'hex-pointy',
  cellSize: 48,
  lineThickness: 2,
  opacity: 0.85,
  lineColor: '#ffffff',
  lineStyle: 'solid',
  dashLength: 8,
  dashGap: 6,
  dotSpacing: 10,
  dashCap: 'butt',
  blendMode: 'source-over',
  offsetX: 0,
  offsetY: 0,
  showCoordinates: false,
  coordFormat: 'wargame',
  coordFontSize: 11,
  coordColor: '#ffffff',
  coordOpacity: 0.7,
  coordStartCol: 1,
  coordStartRow: 1,
  showCenterMarkers: false,
  centerMarkerType: 'dot',
  centerMarkerSize: 4,
  centerMarkerColor: '#ffffff',
  cellFillColor: '#000000',
  cellFillOpacity: 0,
  alternatingShade: false,
  alternatingOpacity: 0.08,
};
