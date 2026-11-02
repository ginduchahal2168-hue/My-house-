import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  Star, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  X, 
  Loader2, 
  Image as ImageIcon 
} from 'lucide-react';
import { apiUploadPropertyPhoto } from '../services/supabaseClient';

export interface PropertyImageUploadProps {
  images: string[];
  onChange: (updatedImages: string[]) => void;
  maxImages?: number;
  maxFileSizeMB?: number;
  disabled?: boolean;
}

export const PropertyImageUpload: React.FC<PropertyImageUploadProps> = ({
  images,
  onChange,
  maxImages = 15,
  maxFileSizeMB = 8,
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState<number>(0);
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  const validateFile = (file: File): string | null => {
    // 1. File type validation (strictly JPG and PNG)
    const lowerType = (file.type || '').toLowerCase();
    const lowerName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext));
    const hasValidMime = allowedTypes.includes(lowerType);

    if (!hasValidExt || (lowerType && !hasValidMime)) {
      return `"${file.name}" has an invalid file type. Only JPG and PNG images are allowed.`;
    }

    // 2. File size validation
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return `"${file.name}" (${fileSizeMB} MB) exceeds the maximum allowed size of ${maxFileSizeMB} MB.`;
    }

    // 3. Prevent 0-byte corrupt files
    if (file.size === 0) {
      return `"${file.name}" is empty (0 bytes). Please select a valid photo.`;
    }

    return null;
  };

  const processFiles = async (files: File[]) => {
    setErrorMessage(null);

    if (files.length === 0) return;

    // Check maximum limit
    const availableSlots = maxImages - images.length;
    if (availableSlots <= 0) {
      setErrorMessage(`Maximum limit of ${maxImages} images already reached. Please delete an image before adding more.`);
      return;
    }

    if (files.length > availableSlots) {
      setErrorMessage(`You can only add ${availableSlots} more image${availableSlots === 1 ? '' : 's'}. You selected ${files.length}. Maximum limit is ${maxImages}.`);
      return;
    }

    // Validate all files first
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        return;
      }
    }

    // Upload files sequentially with honest progress
    setUploadingCount(files.length);
    const newUploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading ${i + 1} of ${files.length} to Supabase Storage: "${file.name}"...`);
        const url = await apiUploadPropertyPhoto(file);
        newUploadedUrls.push(url);
      }

      onChange([...images, ...newUploadedUrls].slice(0, maxImages));
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload one or more images. Please check your connection.');
    } finally {
      setUploadingCount(0);
      setUploadProgressText(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && images.length < maxImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || images.length >= maxImages) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    const itemToMove = images[index];
    const remaining = images.filter((_, idx) => idx !== index);
    onChange([itemToMove, ...remaining]);
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className="space-y-4">
      {/* Top Header & Counter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Property Photographs
          </label>
          <span className="text-[11px] text-slate-500">
            JPG or PNG only · Max {maxFileSizeMB} MB per file · Up to {maxImages} images
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            isMaxReached 
              ? 'bg-amber-50 text-amber-800 border-amber-200' 
              : 'bg-emerald-50 text-[#167B62] border-emerald-200'
          }`}>
            {images.length} / {maxImages} Uploaded
          </span>
        </div>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      {!isMaxReached ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !uploadingCount && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-[#167B62] bg-emerald-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-[#167B62] bg-slate-50/70 hover:bg-emerald-50/20'
          } ${disabled || uploadingCount > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileInputChange}
            disabled={disabled || uploadingCount > 0}
            className="hidden"
          />

          {uploadingCount > 0 ? (
            <div className="flex flex-col items-center justify-center py-4">
              <Loader2 className="w-10 h-10 text-[#167B62] animate-spin mb-3" />
              <span className="text-xs font-bold text-slate-800">
                {uploadProgressText || 'Uploading photographs to Supabase Storage...'}
              </span>
              <span className="text-[11px] text-slate-500 mt-1">
                Please wait while high-resolution images are processed and securely stored.
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 text-[#167B62] flex items-center justify-center mb-3">
                <Camera className="w-6 h-6 stroke-[2]" />
              </div>

              <div className="text-xs sm:text-sm font-bold text-slate-900">
                Click to browse from gallery or take photo with camera
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Drag and drop your JPG or PNG files here
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
                <Upload className="w-3.5 h-3.5 text-[#167B62]" />
                <span>Select Photos ({maxImages - images.length} remaining)</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-[#167B62] inline mr-1.5" />
          Maximum limit of {maxImages} images reached. To replace an image, delete one below.
        </div>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Uploaded Photos ({images.length})
            </span>
            <span className="text-[11px] text-slate-400">
              First image is the primary cover photo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;

              return (
                <div
                  key={index}
                  className={`group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border-2 transition-all ${
                    isCover ? 'border-[#167B62] shadow-sm' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Property photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10">
                    {isCover ? (
                      <span className="bg-[#167B62] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-white" />
                        Cover
                      </span>
                    ) : (
                      <span className="bg-slate-900/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay Actions */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex justify-end gap-1">
                      {/* Full preview */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(imgUrl);
                        }}
                        className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-transform active:scale-90"
                        title="Zoom Image"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="w-7 h-7 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition-transform active:scale-90"
                          title="Delete Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Set as Cover button */}
                    {!isCover && !disabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsCover(index);
                        }}
                        className="w-full py-1 bg-white/90 hover:bg-white text-slate-900 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>Make Cover</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zoom / Lightbox Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-3xl max-h-[85vh] bg-transparent rounded-2xl overflow-hidden flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
