'use client';

import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_MAX_IMAGE_UPLOAD_BYTES, formatImageUploadLimit } from '@/lib/api/image-upload';
import { optimizedImageUrl } from '@/lib/image-url';
import { cx } from './cx';

export function ImageUploadField({
  label,
  value,
  file,
  onFileChange,
  onChange,
  disabled,
  pending,
  aspect = 'aspect-[5/2]',
  maxBytes = DEFAULT_MAX_IMAGE_UPLOAD_BYTES,
}: {
  label: string;
  value?: string | null;
  file?: File | null;
  onFileChange: (file: File | null) => void;
  onChange: (value: string) => void;
  disabled?: boolean;
  pending?: boolean;
  aspect?: string;
  maxBytes?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const imageSource = previewUrl ?? (value ? optimizedImageUrl(value, { width: 640, height: 360, crop: 'fill' }) : '');
  const hasImage = Boolean(file || value);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const selectFile = (nextFile: File | undefined) => {
    if (!nextFile) {
      return;
    }

    if (!nextFile.type.startsWith('image/')) {
      setError('Select an image file.');
      return;
    }

    if (nextFile.size > maxBytes) {
      setError(`Image must be ${formatImageUploadLimit(maxBytes)} or smaller.`);
      return;
    }

    setError('');
    onFileChange(nextFile);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const removeImage = () => {
    onFileChange(null);
    onChange('');
    setError('');
  };

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted-foreground">{label}</p>
        {hasImage ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-black text-red-600 disabled:opacity-50"
            onClick={removeImage}
            disabled={disabled || pending}
          >
            <X className="size-3.5" />
            Remove
          </button>
        ) : null}
      </div>
      <div
        className={cx(
          'relative overflow-hidden rounded-xl border border-border bg-stone-50',
          aspect,
          disabled && 'opacity-60',
        )}
      >
        {imageSource ? (
          <img
            src={imageSource}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-stone-400">
            <ImageIcon className="size-7" />
          </div>
        )}
        <div className="absolute inset-x-2 bottom-2">
          <button
            type="button"
            className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white/92 px-3 text-xs font-black text-stone-800 shadow-lg backdrop-blur transition hover:bg-white disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || pending}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {pending ? 'Saving...' : hasImage ? 'Replace image' : 'Choose image'}
          </button>
        </div>
      </div>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">Max {formatImageUploadLimit(maxBytes)}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      {error ? <p className="mt-1 text-xs font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
