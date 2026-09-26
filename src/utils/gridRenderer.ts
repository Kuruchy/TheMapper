import { GridSettings, CoordinateFormat } from '../types';

export function formatCoordinate(col: number, row: number, format: CoordinateFormat): string {
  if (format === 'none') return '';
  if (format === 'numeric') {
    return `${col},${row}`;
  }
  if (format === 'wargame') {
    // Standard wargaming 4-digit format: CC-RR (e.g. 0101, 0412)
    const c = String(Math.max(0, col)).padStart(2, '0');
    const r = String(Math.max(0, row)).padStart(2, '0');
    return `${c}${r}`;
  }
  if (format === 'axial') {
    return `q:${col}, r:${row}`;
  }
  if (format === 'alphanumeric') {
    // Excel-style letter column (A, B, ... Z, AA, AB) and 1-based row
    let letter = '';
    let temp = Math.max(1, col);
    while (temp > 0) {
      const rem = (temp - 1) % 26;
      letter = String.fromCharCode(65 + rem) + letter;
      temp = Math.floor((temp - 1) / 26);
    }
    return `${letter}${row}`;
  }
  return '';
}

/**
 * Computes hexagon vertices for a given center and radius.
 */
export function getHexVertices(
  cx: number,
  cy: number,
  radius: number,
  type: 'hex-pointy' | 'hex-flat'
): [number, number][] {
  const vertices: [number, number][] = [];
  if (type === 'hex-pointy') {
    // Pointy-topped: points at 90 deg (bottom) and 270 deg (top)
    for (let i = 0; i < 6; i++) {
      const angle = ((60 * i - 30) * Math.PI) / 180;
      vertices.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }
  } else {
    // Flat-topped: points at 0 deg (right) and 180 deg (left), flat horizontal top & bottom
    for (let i = 0; i < 6; i++) {
      const angle = ((60 * i) * Math.PI) / 180;
      vertices.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }
  }
  return vertices;
}

/**
 * Renders the grid layer onto a canvas context.
 * Draws onto an isolated context or layer to avoid overlapping edge opacity doubling.
 */
export function renderGridLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: GridSettings
) {
  if (settings.opacity <= 0) return;

  // We use an offscreen canvas to render grid strokes cleanly at full opacity,
  // then composite onto destination with user's settings.opacity and settings.blendMode.
  // This guarantees overlapping shared hex edges do not darken!
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.save();
  offCtx.lineWidth = settings.lineThickness;
  offCtx.strokeStyle = settings.lineColor;
  offCtx.fillStyle = settings.cellFillColor;

  const dashLength = Math.max(2, settings.dashLength ?? Math.max(6, settings.lineThickness * 3.5));
  const dashGap = Math.max(2, settings.dashGap ?? Math.max(4, settings.lineThickness * 2.5));
  const dotSpacing = Math.max(settings.lineThickness * 1.5, settings.dotSpacing ?? 10);
  const dashCap = settings.dashCap ?? 'butt';

  if (settings.lineStyle === 'dashed') {
    offCtx.lineCap = dashCap;
    offCtx.lineJoin = dashCap === 'round' ? 'round' : 'miter';
    if (dashCap === 'round') {
      // In Canvas 2D with round lineCap, endcaps add lineWidth total length to each dash
      const adjustedDash = Math.max(0.1, dashLength - settings.lineThickness);
      const adjustedGap = dashGap + settings.lineThickness;
      offCtx.setLineDash([adjustedDash, adjustedGap]);
    } else {
      offCtx.setLineDash([dashLength, dashGap]);
    }
  } else if (settings.lineStyle === 'dotted') {
    // 0.001 creates pure, crisp circular dots of diameter lineWidth in Canvas 2D
    offCtx.lineCap = 'round';
    offCtx.lineJoin = 'round';
    offCtx.setLineDash([0.001, dotSpacing]);
  } else {
    // solid or vertex-dots
    offCtx.lineCap = 'round';
    offCtx.lineJoin = 'round';
    offCtx.setLineDash([]);
  }

  const {
    gridType,
    cellSize,
    offsetX,
    offsetY,
    showCoordinates,
    coordFormat,
    coordFontSize,
    coordColor,
    coordOpacity,
    coordStartCol,
    coordStartRow,
    showCenterMarkers,
    centerMarkerType,
    centerMarkerSize,
    centerMarkerColor,
    cellFillOpacity,
    alternatingShade,
    alternatingOpacity,
  } = settings;

  if (gridType === 'square') {
    const s = Math.max(8, cellSize);
    const startX = ((offsetX % s) - s);
    const startY = ((offsetY % s) - s);

    // Calculate column & row index for base offset
    const baseCol = Math.floor((startX - offsetX) / s) + coordStartCol;
    const baseRow = Math.floor((startY - offsetY) / s) + coordStartRow;

    const colsCount = Math.ceil((width - startX) / s) + 2;
    const rowsCount = Math.ceil((height - startY) / s) + 2;

    // Optional fill / alternating shade
    if (cellFillOpacity > 0 || alternatingShade) {
      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const x = startX + c * s;
          const y = startY + r * s;
          const isAlt = (c + r) % 2 === 1;

          if (isAlt && alternatingShade) {
            offCtx.fillStyle = settings.cellFillColor;
            offCtx.globalAlpha = alternatingOpacity;
            offCtx.fillRect(x, y, s, s);
            offCtx.globalAlpha = 1;
          } else if (cellFillOpacity > 0) {
            offCtx.fillStyle = settings.cellFillColor;
            offCtx.globalAlpha = cellFillOpacity;
            offCtx.fillRect(x, y, s, s);
            offCtx.globalAlpha = 1;
          }
        }
      }
    }

    // Draw square grid lines or intersection dots
    if (settings.lineStyle === 'vertex-dots') {
      offCtx.fillStyle = settings.lineColor;
      const dotRadius = Math.max(1.5, settings.lineThickness * 1.25);
      offCtx.beginPath();
      for (let c = 0; c <= colsCount; c++) {
        const x = startX + c * s;
        for (let r = 0; r <= rowsCount; r++) {
          const y = startY + r * s;
          if (x >= -dotRadius && x <= width + dotRadius && y >= -dotRadius && y <= height + dotRadius) {
            offCtx.moveTo(x + dotRadius, y);
            offCtx.arc(x, y, dotRadius, 0, Math.PI * 2);
          }
        }
      }
      offCtx.fill();
    } else {
      offCtx.beginPath();
      for (let c = 0; c <= colsCount; c++) {
        const x = Math.round(startX + c * s) + (settings.lineThickness % 2 === 1 ? 0.5 : 0);
        offCtx.moveTo(x, 0);
        offCtx.lineTo(x, height);
      }
      for (let r = 0; r <= rowsCount; r++) {
        const y = Math.round(startY + r * s) + (settings.lineThickness % 2 === 1 ? 0.5 : 0);
        offCtx.moveTo(0, y);
        offCtx.lineTo(width, y);
      }
      offCtx.stroke();
    }

    // Coordinates and center markers
    if (showCoordinates || (showCenterMarkers && centerMarkerType !== 'none')) {
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.font = `600 ${Math.max(8, coordFontSize)}px ui-sans-serif, system-ui, -apple-system, sans-serif`;

      for (let r = 0; r < rowsCount; r++) {
        for (let c = 0; c < colsCount; c++) {
          const cx = startX + (c + 0.5) * s;
          const cy = startY + (r + 0.5) * s;

          if (cx < -s || cx > width + s || cy < -s || cy > height + s) continue;

          // Center marker
          if (showCenterMarkers && centerMarkerType !== 'none') {
            offCtx.fillStyle = centerMarkerColor;
            if (centerMarkerType === 'dot') {
              offCtx.beginPath();
              offCtx.arc(cx, cy, centerMarkerSize / 2, 0, Math.PI * 2);
              offCtx.fill();
            } else if (centerMarkerType === 'crosshair') {
              offCtx.strokeStyle = centerMarkerColor;
              offCtx.lineWidth = Math.max(1, settings.lineThickness);
              const arm = centerMarkerSize;
              offCtx.beginPath();
              offCtx.moveTo(cx - arm, cy);
              offCtx.lineTo(cx + arm, cy);
              offCtx.moveTo(cx, cy - arm);
              offCtx.lineTo(cx, cy + arm);
              offCtx.stroke();
            }
          }

          // Coordinate label
          if (showCoordinates && coordFormat !== 'none') {
            const colIdx = baseCol + c;
            const rowIdx = baseRow + r;
            const label = formatCoordinate(colIdx, rowIdx, coordFormat);
            if (label) {
              offCtx.fillStyle = coordColor;
              offCtx.globalAlpha = coordOpacity;
              const textY = showCenterMarkers ? cy - s * 0.28 : cy;
              offCtx.fillText(label, cx, textY);
              offCtx.globalAlpha = 1;
            }
          }
        }
      }
    }
  } else if (gridType === 'hex-pointy') {
    // Pointy-topped hexagon (pointed up)
    const R = Math.max(6, cellSize);
    const horizStep = Math.sqrt(3) * R;
    const vertStep = 1.5 * R;

    const minCol = Math.floor((0 - offsetX - R * 2) / horizStep) - 2;
    const maxCol = Math.ceil((width - offsetX + R * 2) / horizStep) + 2;
    const minRow = Math.floor((0 - offsetY - R * 2) / vertStep) - 2;
    const maxRow = Math.ceil((height - offsetY + R * 2) / vertStep) + 2;

    // First pass: Cell fills / alternating shades
    if (cellFillOpacity > 0 || alternatingShade) {
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const rowOffset = (Math.abs(r) % 2 === 1) ? horizStep / 2 : 0;
          const cx = c * horizStep + rowOffset + offsetX;
          const cy = r * vertStep + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const isAlt = (Math.abs(c) + Math.abs(r)) % 2 === 1;
          const alpha = isAlt && alternatingShade ? alternatingOpacity : cellFillOpacity;

          if (alpha > 0) {
            const verts = getHexVertices(cx, cy, R, 'hex-pointy');
            offCtx.beginPath();
            offCtx.moveTo(verts[0][0], verts[0][1]);
            for (let i = 1; i < 6; i++) {
              offCtx.lineTo(verts[i][0], verts[i][1]);
            }
            offCtx.closePath();
            offCtx.fillStyle = settings.cellFillColor;
            offCtx.globalAlpha = alpha;
            offCtx.fill();
            offCtx.globalAlpha = 1;
          }
        }
      }
    }

    // Second pass: Draw hex outlines or vertex dots
    if (settings.lineStyle === 'vertex-dots') {
      const seenVerts = new Set<string>();
      const uniqueVerts: [number, number][] = [];

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const rowOffset = (Math.abs(r) % 2 === 1) ? horizStep / 2 : 0;
          const cx = c * horizStep + rowOffset + offsetX;
          const cy = r * vertStep + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const verts = getHexVertices(cx, cy, R, 'hex-pointy');
          for (let i = 0; i < 6; i++) {
            const [vx, vy] = verts[i];
            if (vx < -R || vx > width + R || vy < -R || vy > height + R) continue;
            const k = `${Math.round(vx * 4)},${Math.round(vy * 4)}`;
            if (!seenVerts.has(k)) {
              seenVerts.add(k);
              uniqueVerts.push([vx, vy]);
            }
          }
        }
      }

      offCtx.fillStyle = settings.lineColor;
      const dotRadius = Math.max(1.5, settings.lineThickness * 1.25);
      offCtx.beginPath();
      for (let i = 0; i < uniqueVerts.length; i++) {
        const [vx, vy] = uniqueVerts[i];
        offCtx.moveTo(vx + dotRadius, vy);
        offCtx.arc(vx, vy, dotRadius, 0, Math.PI * 2);
      }
      offCtx.fill();
    } else {
      // Deduplicate shared hex edges so dashed and dotted lines don't collide or overlap in reverse
      const seenEdges = new Set<string>();
      const uniqueEdges: [number, number, number, number][] = [];

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const rowOffset = (Math.abs(r) % 2 === 1) ? horizStep / 2 : 0;
          const cx = c * horizStep + rowOffset + offsetX;
          const cy = r * vertStep + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const verts = getHexVertices(cx, cy, R, 'hex-pointy');
          for (let i = 0; i < 6; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % 6];

            const k1 = `${Math.round(p1[0] * 4)},${Math.round(p1[1] * 4)}`;
            const k2 = `${Math.round(p2[0] * 4)},${Math.round(p2[1] * 4)}`;
            const edgeKey = k1 < k2 ? `${k1}_${k2}` : `${k2}_${k1}`;

            if (!seenEdges.has(edgeKey)) {
              seenEdges.add(edgeKey);
              if (p1[0] < p2[0] || (p1[0] === p2[0] && p1[1] <= p2[1])) {
                uniqueEdges.push([p1[0], p1[1], p2[0], p2[1]]);
              } else {
                uniqueEdges.push([p2[0], p2[1], p1[0], p1[1]]);
              }
            }
          }
        }
      }

      offCtx.beginPath();
      for (let i = 0; i < uniqueEdges.length; i++) {
        const [x1, y1, x2, y2] = uniqueEdges[i];
        offCtx.moveTo(x1, y1);
        offCtx.lineTo(x2, y2);
      }
      offCtx.stroke();
    }

    // Third pass: Coordinates & Center markers
    if (showCoordinates || (showCenterMarkers && centerMarkerType !== 'none')) {
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.font = `600 ${Math.max(8, coordFontSize)}px ui-sans-serif, system-ui, -apple-system, sans-serif`;

      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const rowOffset = (Math.abs(r) % 2 === 1) ? horizStep / 2 : 0;
          const cx = c * horizStep + rowOffset + offsetX;
          const cy = r * vertStep + offsetY;

          if (cx < -R || cx > width + R || cy < -R || cy > height + R) continue;

          if (showCenterMarkers && centerMarkerType !== 'none') {
            offCtx.fillStyle = centerMarkerColor;
            if (centerMarkerType === 'dot') {
              offCtx.beginPath();
              offCtx.arc(cx, cy, centerMarkerSize / 2, 0, Math.PI * 2);
              offCtx.fill();
            } else if (centerMarkerType === 'crosshair') {
              offCtx.strokeStyle = centerMarkerColor;
              offCtx.lineWidth = Math.max(1, settings.lineThickness);
              const arm = centerMarkerSize;
              offCtx.beginPath();
              offCtx.moveTo(cx - arm, cy);
              offCtx.lineTo(cx + arm, cy);
              offCtx.moveTo(cx, cy - arm);
              offCtx.lineTo(cx, cy + arm);
              offCtx.stroke();
            }
          }

          if (showCoordinates && coordFormat !== 'none') {
            const colIdx = coordStartCol + c;
            const rowIdx = coordStartRow + r;
            const label = formatCoordinate(colIdx, rowIdx, coordFormat);
            if (label) {
              offCtx.fillStyle = coordColor;
              offCtx.globalAlpha = coordOpacity;
              const textY = showCenterMarkers ? cy - R * 0.35 : cy;
              offCtx.fillText(label, cx, textY);
              offCtx.globalAlpha = 1;
            }
          }
        }
      }
    }
  } else if (gridType === 'hex-flat') {
    // Flat-topped hexagon (flat side up)
    const R = Math.max(6, cellSize);
    const horizStep = 1.5 * R;
    const vertStep = Math.sqrt(3) * R;

    const minCol = Math.floor((0 - offsetX - R * 2) / horizStep) - 2;
    const maxCol = Math.ceil((width - offsetX + R * 2) / horizStep) + 2;
    const minRow = Math.floor((0 - offsetY - R * 2) / vertStep) - 2;
    const maxRow = Math.ceil((height - offsetY + R * 2) / vertStep) + 2;

    // First pass: Cell fills / alternating shades
    if (cellFillOpacity > 0 || alternatingShade) {
      for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
          const colOffset = (Math.abs(c) % 2 === 1) ? vertStep / 2 : 0;
          const cx = c * horizStep + offsetX;
          const cy = r * vertStep + colOffset + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const isAlt = (Math.abs(c) + Math.abs(r)) % 2 === 1;
          const alpha = isAlt && alternatingShade ? alternatingOpacity : cellFillOpacity;

          if (alpha > 0) {
            const verts = getHexVertices(cx, cy, R, 'hex-flat');
            offCtx.beginPath();
            offCtx.moveTo(verts[0][0], verts[0][1]);
            for (let i = 1; i < 6; i++) {
              offCtx.lineTo(verts[i][0], verts[i][1]);
            }
            offCtx.closePath();
            offCtx.fillStyle = settings.cellFillColor;
            offCtx.globalAlpha = alpha;
            offCtx.fill();
            offCtx.globalAlpha = 1;
          }
        }
      }
    }

    // Second pass: Draw hex outlines or vertex dots
    if (settings.lineStyle === 'vertex-dots') {
      const seenVerts = new Set<string>();
      const uniqueVerts: [number, number][] = [];

      for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
          const colOffset = (Math.abs(c) % 2 === 1) ? vertStep / 2 : 0;
          const cx = c * horizStep + offsetX;
          const cy = r * vertStep + colOffset + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const verts = getHexVertices(cx, cy, R, 'hex-flat');
          for (let i = 0; i < 6; i++) {
            const [vx, vy] = verts[i];
            if (vx < -R || vx > width + R || vy < -R || vy > height + R) continue;
            const k = `${Math.round(vx * 4)},${Math.round(vy * 4)}`;
            if (!seenVerts.has(k)) {
              seenVerts.add(k);
              uniqueVerts.push([vx, vy]);
            }
          }
        }
      }

      offCtx.fillStyle = settings.lineColor;
      const dotRadius = Math.max(1.5, settings.lineThickness * 1.25);
      offCtx.beginPath();
      for (let i = 0; i < uniqueVerts.length; i++) {
        const [vx, vy] = uniqueVerts[i];
        offCtx.moveTo(vx + dotRadius, vy);
        offCtx.arc(vx, vy, dotRadius, 0, Math.PI * 2);
      }
      offCtx.fill();
    } else {
      const seenEdges = new Set<string>();
      const uniqueEdges: [number, number, number, number][] = [];

      for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
          const colOffset = (Math.abs(c) % 2 === 1) ? vertStep / 2 : 0;
          const cx = c * horizStep + offsetX;
          const cy = r * vertStep + colOffset + offsetY;

          if (cx < -R * 2 || cx > width + R * 2 || cy < -R * 2 || cy > height + R * 2) continue;

          const verts = getHexVertices(cx, cy, R, 'hex-flat');
          for (let i = 0; i < 6; i++) {
            const p1 = verts[i];
            const p2 = verts[(i + 1) % 6];

            const k1 = `${Math.round(p1[0] * 4)},${Math.round(p1[1] * 4)}`;
            const k2 = `${Math.round(p2[0] * 4)},${Math.round(p2[1] * 4)}`;
            const edgeKey = k1 < k2 ? `${k1}_${k2}` : `${k2}_${k1}`;

            if (!seenEdges.has(edgeKey)) {
              seenEdges.add(edgeKey);
              if (p1[0] < p2[0] || (p1[0] === p2[0] && p1[1] <= p2[1])) {
                uniqueEdges.push([p1[0], p1[1], p2[0], p2[1]]);
              } else {
                uniqueEdges.push([p2[0], p2[1], p1[0], p1[1]]);
              }
            }
          }
        }
      }

      offCtx.beginPath();
      for (let i = 0; i < uniqueEdges.length; i++) {
        const [x1, y1, x2, y2] = uniqueEdges[i];
        offCtx.moveTo(x1, y1);
        offCtx.lineTo(x2, y2);
      }
      offCtx.stroke();
    }

    // Third pass: Coordinates & Center markers
    if (showCoordinates || (showCenterMarkers && centerMarkerType !== 'none')) {
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.font = `600 ${Math.max(8, coordFontSize)}px ui-sans-serif, system-ui, -apple-system, sans-serif`;

      for (let c = minCol; c <= maxCol; c++) {
        for (let r = minRow; r <= maxRow; r++) {
          const colOffset = (Math.abs(c) % 2 === 1) ? vertStep / 2 : 0;
          const cx = c * horizStep + offsetX;
          const cy = r * vertStep + colOffset + offsetY;

          if (cx < -R || cx > width + R || cy < -R || cy > height + R) continue;

          if (showCenterMarkers && centerMarkerType !== 'none') {
            offCtx.fillStyle = centerMarkerColor;
            if (centerMarkerType === 'dot') {
              offCtx.beginPath();
              offCtx.arc(cx, cy, centerMarkerSize / 2, 0, Math.PI * 2);
              offCtx.fill();
            } else if (centerMarkerType === 'crosshair') {
              offCtx.strokeStyle = centerMarkerColor;
              offCtx.lineWidth = Math.max(1, settings.lineThickness);
              const arm = centerMarkerSize;
              offCtx.beginPath();
              offCtx.moveTo(cx - arm, cy);
              offCtx.lineTo(cx + arm, cy);
              offCtx.moveTo(cx, cy - arm);
              offCtx.lineTo(cx, cy + arm);
              offCtx.stroke();
            }
          }

          if (showCoordinates && coordFormat !== 'none') {
            const colIdx = coordStartCol + c;
            const rowIdx = coordStartRow + r;
            const label = formatCoordinate(colIdx, rowIdx, coordFormat);
            if (label) {
              offCtx.fillStyle = coordColor;
              offCtx.globalAlpha = coordOpacity;
              const textY = showCenterMarkers ? cy - R * 0.35 : cy;
              offCtx.fillText(label, cx, textY);
              offCtx.globalAlpha = 1;
            }
          }
        }
      }
    }
  }

  offCtx.restore();

  // Composite the clean offscreen grid onto the main context with desired opacity and blend mode
  ctx.save();
  ctx.globalAlpha = settings.opacity;
  ctx.globalCompositeOperation = settings.blendMode;
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
}

/**
 * Merges the base image and grid layer at 100% full native resolution and exports as Blob.
 */
export async function exportMergedImage(
  image: HTMLImageElement,
  settings: GridSettings,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality = 0.92,
  scale = 1
): Promise<Blob> {
  const exportWidth = Math.round(image.naturalWidth * scale);
  const exportHeight = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = exportWidth;
  canvas.height = exportHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create export canvas context');

  // Draw base image
  ctx.drawImage(image, 0, 0, exportWidth, exportHeight);

  // Scaled settings for export if scale != 1
  const scaledSettings: GridSettings = {
    ...settings,
    cellSize: settings.cellSize * scale,
    lineThickness: settings.lineThickness * scale,
    dashLength: (settings.dashLength ?? 8) * scale,
    dashGap: (settings.dashGap ?? 6) * scale,
    dotSpacing: (settings.dotSpacing ?? 10) * scale,
    offsetX: settings.offsetX * scale,
    offsetY: settings.offsetY * scale,
    coordFontSize: settings.coordFontSize * scale,
    centerMarkerSize: settings.centerMarkerSize * scale,
  };

  renderGridLayer(ctx, exportWidth, exportHeight, scaledSettings);

  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to generate image blob'));
      },
      mimeType,
      quality
    );
  });
}
