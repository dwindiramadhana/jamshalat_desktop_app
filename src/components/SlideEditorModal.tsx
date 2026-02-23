import { Fragment, useState, useRef, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { CustomSlide, SlideType, OverlayPosition, SlidePriority } from '../types/settings';

interface SlideEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: CustomSlide) => void;
  existingSlide?: CustomSlide | null;
  isDarkMode: boolean;
}

const SlideEditorModal = ({ isOpen, onClose, onSave, existingSlide, isDarkMode }: SlideEditorModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getDefaultSlide = (): CustomSlide => ({
    id: crypto.randomUUID(),
    type: 'poster',
    title: '',
    backgroundType: 'color',
    backgroundColor: '#1e293b',
    showOverlay: false,
    overlayPosition: 'bottom-right',
    overlayContent: {
      showTime: false,
      showNextPrayer: false,
    },
    duration: 10,
    enabled: true,
    priority: 'normal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [formData, setFormData] = useState<CustomSlide>(getDefaultSlide());

  // Reset form when modal opens for new slide or load existing slide
  useEffect(() => {
    if (isOpen) {
      if (existingSlide) {
        setFormData(existingSlide);
      } else {
        setFormData(getDefaultSlide());
      }
    }
  }, [isOpen, existingSlide]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to reduce localStorage usage
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Max dimensions to reduce file size
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = (height * MAX_WIDTH) / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = (width * MAX_HEIGHT) / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with 70% quality for good balance
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

        setFormData(prev => ({
          ...prev,
          backgroundType: 'image',
          backgroundImage: compressedDataUrl,
        }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } p-6 shadow-xl transition-all`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {existingSlide ? 'Edit Slide' : 'Buat Slide Baru'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className={`rounded-full p-1 hover:bg-gray-200 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Basic Info */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Judul Slide *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full rounded-md border-gray-300 px-3 py-2"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Contoh: Pengajian Rutin, Fundraising, dll"
                    />
                  </div>

                  {/* Slide Type */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tipe Slide
                    </label>
                    <select
                      className="w-full rounded-md border-gray-300 px-3 py-2"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as SlideType }))}
                    >
                      <option value="poster">Poster/Gambar</option>
                      <option value="text">Teks</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                  </div>

                  {/* Background Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                      Background
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Tipe Background
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            className={`px-4 py-2 rounded border ${
                              formData.backgroundType === 'color'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 hover:border-indigo-400'
                            }`}
                            onClick={() => setFormData(prev => ({ ...prev, backgroundType: 'color' }))}
                          >
                            Warna
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded border ${
                              formData.backgroundType === 'gradient'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 hover:border-indigo-400'
                            }`}
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              backgroundType: 'gradient',
                              backgroundGradient: prev.backgroundGradient || { from: '#667eea', to: '#764ba2' }
                            }))}
                          >
                            Gradien
                          </button>
                          <button
                            type="button"
                            className={`px-4 py-2 rounded border ${
                              formData.backgroundType === 'image'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 hover:border-indigo-400'
                            }`}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Gambar
                          </button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>

                      {/* Color Picker */}
                      {formData.backgroundType === 'color' && (
                        <div>
                          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Pilih Warna
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              className="h-10 w-20 rounded border"
                              value={formData.backgroundColor || '#1e293b'}
                              onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {formData.backgroundColor}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Gradient Picker */}
                      {formData.backgroundType === 'gradient' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Warna Awal
                            </label>
                            <input
                              type="color"
                              className="h-10 w-full rounded border"
                              value={formData.backgroundGradient?.from || '#667eea'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                backgroundGradient: { ...prev.backgroundGradient!, from: e.target.value }
                              }))}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Warna Akhir
                            </label>
                            <input
                              type="color"
                              className="h-10 w-full rounded border"
                              value={formData.backgroundGradient?.to || '#764ba2'}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                backgroundGradient: { ...prev.backgroundGradient!, to: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      )}

                      {/* Image Preview */}
                      {formData.backgroundType === 'image' && formData.backgroundImage && (
                        <div>
                          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Preview
                          </label>
                          <div className="relative h-40 rounded border overflow-hidden">
                            <img
                              src={formData.backgroundImage}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                              onClick={() => setFormData(prev => ({ ...prev, backgroundImage: undefined, backgroundType: 'color' }))}
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {formData.backgroundType === 'image' && !formData.backgroundImage && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 transition"
                        >
                          <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Klik untuk upload gambar
                          </p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Overlay Settings */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        Overlay (Opsional)
                      </h4>
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formData.showOverlay}
                        onChange={(e) => setFormData(prev => ({ ...prev, showOverlay: e.target.checked }))}
                      />
                    </div>

                    {formData.showOverlay && (
                      <div className="space-y-3">
                        <div>
                          <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Posisi Overlay
                          </label>
                          <select
                            className="w-full rounded-md border-gray-300 px-3 py-2"
                            value={formData.overlayPosition}
                            onChange={(e) => setFormData(prev => ({ ...prev, overlayPosition: e.target.value as OverlayPosition }))}
                          >
                            <option value="top-left">Kiri Atas</option>
                            <option value="top-right">Kanan Atas</option>
                            <option value="bottom-left">Kiri Bawah</option>
                            <option value="bottom-right">Kanan Bawah</option>
                            <option value="center">Tengah</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.overlayContent.showTime || false}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                overlayContent: { ...prev.overlayContent, showTime: e.target.checked }
                              }))}
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Tampilkan jam
                            </span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.overlayContent.showNextPrayer || false}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                overlayContent: { ...prev.overlayContent, showNextPrayer: e.target.checked }
                              }))}
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Tampilkan shalat berikutnya
                            </span>
                          </label>

                          <div>
                            <label className={`block text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Teks Kustom
                            </label>
                            <input
                              type="text"
                              className="w-full rounded-md border-gray-300 px-3 py-2"
                              value={formData.overlayContent.customText || ''}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                overlayContent: { ...prev.overlayContent, customText: e.target.value }
                              }))}
                              placeholder="Contoh: Mari Shalat Berjamaah"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Duration & Priority */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Durasi: {formData.duration} detik
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        className="w-full"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Prioritas
                      </label>
                      <select
                        className="w-full rounded-md border-gray-300 px-3 py-2"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as SlidePriority }))}
                      >
                        <option value="low">Rendah (1x)</option>
                        <option value="normal">Normal (2x)</option>
                        <option value="high">Tinggi (3x)</option>
                      </select>
                    </div>
                  </div>

                  {/* Enable Toggle */}
                  <div className="flex items-center justify-between">
                    <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Aktifkan slide ini
                    </label>
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={formData.enabled}
                      onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {existingSlide ? 'Simpan' : 'Buat Slide'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SlideEditorModal;
