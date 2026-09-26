import React from 'react';
import { X, Map, Sparkles, Check } from 'lucide-react';
import { SAMPLE_MAPS, SampleMap } from '../utils/sampleMaps';

interface SampleMapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMap: (map: SampleMap) => void;
  activeMapId?: string;
}

export const SampleMapsModal: React.FC<SampleMapsModalProps> = ({
  isOpen,
  onClose,
  onSelectMap,
  activeMapId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden text-stone-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-stone-100">Select a Sample Battlemap</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          {SAMPLE_MAPS.map((map) => {
            const isSelected = activeMapId === map.id;
            return (
              <div
                key={map.id}
                onClick={() => {
                  onSelectMap(map);
                  onClose();
                }}
                className={`group cursor-pointer rounded-xl border p-3 bg-stone-950 transition-all hover:border-amber-500/80 hover:bg-stone-900/60 ${
                  isSelected ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-800'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="aspect-[16/10] rounded-lg overflow-hidden bg-stone-900 mb-2.5 border border-stone-800/80 relative">
                  <img
                    src={map.dataUrl}
                    alt={map.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[10px] font-mono text-stone-300">
                    {map.width}×{map.height}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
                    {map.name}
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {map.category}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 line-clamp-2">
                  {map.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/60 text-center text-xs text-stone-500">
          You can also upload any custom battlemap, dungeon, or image at any time.
        </div>
      </div>
    </div>
  );
};
