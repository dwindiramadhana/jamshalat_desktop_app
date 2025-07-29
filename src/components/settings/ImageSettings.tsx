import { useState, useCallback, type ChangeEvent } from 'react';
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import type { AppSettings } from '../../hooks/useAppSettings';
import type { UnsplashImage } from '../../types/settings';

interface ImageSettingsProps {
  localSettings: AppSettings;
  setLocalSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isDarkMode: boolean;
}

const ImageSettings: React.FC<ImageSettingsProps> = ({
  localSettings,
  setLocalSettings,
  isDarkMode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || 'BkgEMpfG_ReNpVwJcbgNx30IZXhoFoWwKgwbrPU0hq4';

  const resizeAndCompressImage = useCallback((file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        img.src = '';
        canvas.width = 0;
        canvas.height = 0;
        
        resolve(optimizedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      const objectUrl = URL.createObjectURL(file);
      
      const originalOnload = img.onload;
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (originalOnload) {
          originalOnload.call(img, new Event('load'));
        }
      };
      
      img.src = objectUrl;
    });
  }, []);

  const handleImageUpload = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) return;

    for (const file of imageFiles) {
      try {
        const fileSizeMB = file.size / (1024 * 1024);
        console.log(`Processing image: ${file.name} (${fileSizeMB.toFixed(2)}MB)`);
        
        const optimizedImageUrl = await resizeAndCompressImage(file, 1920, 1080, 0.8);
        
        const newImage: UnsplashImage = {
          url: optimizedImageUrl,
          author: 'You',
          authorUrl: '',
          authorUsername: 'you',
          imageId: `custom-${Date.now()}-${Math.random()}`,
        };

        setLocalSettings(prev => ({
          ...prev,
          background: {
            ...prev.background,
            images: [...prev.background.images, newImage],
          },
        }));
        
        console.log(`Successfully processed and added image: ${file.name}`);
      } catch (error) {
        console.error(`Failed to process image ${file.name}:`, error);
      }
    }
  }, [resizeAndCompressImage, setLocalSettings]);

  const handleFileInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files) {
      handleImageUpload(files);
    }
  }, [handleImageUpload]);

  const handleRemoveImage = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newImages = prev.background.images.filter((_, i) => i !== index);
      const newCurrentIndex = Math.min(prev.background.currentImageIndex, newImages.length - 1);
      
      return {
        ...prev,
        background: {
          ...prev.background,
          images: newImages,
          currentImageIndex: Math.max(0, newCurrentIndex),
        },
      };
    });
  }, [setLocalSettings]);

  const searchUnsplash = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=10&page=${page}&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            'Accept-Version': 'v1',
          },
        }
      );

      const images = response.data.results.map((result: any) => ({
        url: result.urls.regular,
        author: result.user.name,
        authorUrl: result.user.links.html,
        authorUsername: result.user.username,
        imageId: result.id,
      }));

      if (images.length > 0) {
        setLocalSettings(prev => ({
          ...prev,
          background: {
            ...prev.background,
            images: page === 1 ? images : [...prev.background.images, ...images],
            currentImageIndex: page === 1 ? 0 : prev.background.currentImageIndex,
            unsplashQuery: query,
            unsplashAuthor: images[0].author,
            unsplashAuthorUrl: images[0].authorUrl,
            unsplashAuthorUsername: images[0].authorUsername,
          },
        }));
      }
    } catch (error) {
      console.error('Error searching Unsplash:', error);
    } finally {
      setIsLoading(false);
    }
  }, [UNSPLASH_ACCESS_KEY, setLocalSettings]);

  return (
    <div className="space-y-4">
      {localSettings.background.type === 'auto' && (
        <div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Cari Gambar di Unsplash
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-1 rounded-md border-gray-300 sm:text-sm px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                placeholder="Cari gambar..."
                value={localSettings.background.unsplashQuery || ''}
                onChange={(e) => {
                  setLocalSettings(prev => ({
                    ...prev,
                    background: {
                      ...prev.background,
                      unsplashQuery: e.target.value,
                    },
                  }));
                }}
              />
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white disabled:opacity-50 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => {
                  if (localSettings.background.unsplashQuery) {
                    searchUnsplash(localSettings.background.unsplashQuery);
                  }
                }}
                disabled={isLoading || !localSettings.background.unsplashQuery}
              >
                {isLoading ? 'Mencari...' : 'Cari'}
              </button>
            </div>
          </div>
          
          {localSettings.background.images.length > 0 && (
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Gambar Pilihan
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                <div className="grid grid-cols-3 gap-3">
                  {localSettings.background.images.map((image, index) => (
                    <div
                      key={`unsplash-${image.imageId || index}`}
                      className="relative group cursor-move"
                      draggable={true}
                      onMouseDown={() => {
                        setDragStartTime(Date.now());
                      }}
                      onDragStart={(e) => {
                        // Only allow drag if mouse has been down for a bit (to distinguish from click)
                        const now = Date.now();
                        if (dragStartTime && (now - dragStartTime) < 150) {
                          e.preventDefault();
                          return false;
                        }
                        
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedIndex(index);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedIndex !== null && draggedIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only remove drag-over if we're actually leaving the element
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX;
                        const y = e.clientY;
                        
                        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverIndex(null);
                        
                        const sourceDraggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const targetIndex = index;
                        
                        if (sourceDraggedIndex !== targetIndex && !isNaN(sourceDraggedIndex)) {
                          const newImages = [...localSettings.background.images];
                          const draggedImage = newImages[sourceDraggedIndex];
                          newImages.splice(sourceDraggedIndex, 1);
                          newImages.splice(targetIndex, 0, draggedImage);
                          
                          setLocalSettings(prev => ({
                            ...prev,
                            background: {
                              ...prev.background,
                              images: newImages
                            }
                          }));
                        }
                      }}
                    >
                      {/* Drop placeholder - show before this item when dragging over */}
                      {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                        <div className="absolute -left-1 top-0 w-1 h-full bg-blue-500 rounded-full z-20 animate-pulse">
                          <div className="absolute -left-2 -top-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                      
                      <div className={`relative w-full h-24 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        draggedIndex === index
                          ? 'border-blue-400 shadow-lg'
                          : dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}>
                        <img
                          src={image.url}
                          alt={`Background ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Drag & Drop untuk mengubah urutan gambar. Gambar akan berputar secara otomatis dalam urutan ini. Gunakan ikon hapus untuk menghapus gambar dari rotasi.
              </p>
            </div>
          )}
        </div>
      )}

      {localSettings.background.type === 'static' && (
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Upload Gambar
          </label>
          <div 
            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <span>Select photos</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    multiple
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {localSettings.background.images.length > 0 && (
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                Gambar Latar Belakang
              </label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                <div className="grid grid-cols-3 gap-3">
                  {localSettings.background.images.map((image, index) => (
                    <div
                      key={`custom-${image.imageId || index}`}
                      className="relative group cursor-move"
                      draggable={true}
                      onMouseDown={() => {
                        setDragStartTime(Date.now());
                      }}
                      onDragStart={(e) => {
                        // Only allow drag if mouse has been down for a bit (to distinguish from click)
                        const now = Date.now();
                        if (dragStartTime && (now - dragStartTime) < 150) {
                          e.preventDefault();
                          return false;
                        }
                        
                        e.dataTransfer.setData('text/plain', index.toString());
                        e.dataTransfer.effectAllowed = 'move';
                        setDraggedIndex(index);
                        e.currentTarget.style.opacity = '0.5';
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.style.opacity = '1';
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedIndex !== null && draggedIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Only remove drag-over if we're actually leaving the element
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX;
                        const y = e.clientY;
                        
                        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverIndex(null);
                        
                        const sourceDraggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                        const targetIndex = index;
                        
                        if (sourceDraggedIndex !== targetIndex && !isNaN(sourceDraggedIndex)) {
                          const newImages = [...localSettings.background.images];
                          const draggedImage = newImages[sourceDraggedIndex];
                          newImages.splice(sourceDraggedIndex, 1);
                          newImages.splice(targetIndex, 0, draggedImage);
                          
                          setLocalSettings(prev => ({
                            ...prev,
                            background: {
                              ...prev.background,
                              images: newImages
                            }
                          }));
                        }
                      }}
                    >
                      {/* Drop placeholder - show before this item when dragging over */}
                      {dragOverIndex === index && draggedIndex !== null && draggedIndex !== index && (
                        <div className="absolute -left-1 top-0 w-1 h-full bg-blue-500 rounded-full z-20 animate-pulse">
                          <div className="absolute -left-2 -top-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                      
                      <div className={`relative w-full h-24 rounded-md overflow-hidden border-2 transition-all duration-200 ${
                        draggedIndex === index
                          ? 'border-blue-400 shadow-lg'
                          : dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}>
                        <img
                          src={image.url}
                          alt={`Custom background ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <TrashIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Klik gambar untuk mengubah gambar latar belakang. Gunakan ikon hapus untuk menghapus gambar.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageSettings;