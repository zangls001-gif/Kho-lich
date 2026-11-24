import React, { useState } from 'react';
import { Image, Link } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { Block } from '../../../types';

interface ImageBlockProps {
  block: Block;
  date: string;
}

export default function ImageBlock({ block, date }: ImageBlockProps) {
  const { updateBlock } = useAppStore();
  const [imageError, setImageError] = useState(false);

  const imageUrl = block.imageUrl || '';
  const caption = block.imageCaption || '';

  return (
    <div className="w-full space-y-2">
      {/* URL input */}
      <div
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <Link size={14} style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          value={imageUrl}
          onChange={(e) => {
            setImageError(false);
            updateBlock(date, block.id, { imageUrl: e.target.value });
          }}
          className="flex-1 text-xs bg-transparent border-none outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Paste image URL..."
        />
      </div>

      {/* Image preview or placeholder */}
      {imageUrl && !imageError ? (
        <div className="rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={caption || 'Image'}
            className="w-full max-h-[400px] object-contain rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div
          className="w-full h-[150px] rounded-lg flex flex-col items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '2px dashed var(--border)',
          }}
        >
          <Image size={32} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {imageError ? 'Failed to load image' : 'Enter an image URL above'}
          </span>
        </div>
      )}

      {/* Caption */}
      <input
        type="text"
        value={caption}
        onChange={(e) => updateBlock(date, block.id, { imageCaption: e.target.value })}
        className="w-full text-xs text-center bg-transparent border-none outline-none italic"
        style={{ color: 'var(--text-tertiary)' }}
        placeholder="Add a caption..."
      />
    </div>
  );
}
