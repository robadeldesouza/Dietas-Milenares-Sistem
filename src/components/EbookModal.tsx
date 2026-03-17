import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Download, Lock, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { Ebook, UserRole } from '../types';

interface EbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebook: Ebook | null;
  userRole?: UserRole;
}

export const EbookModal: React.FC<EbookModalProps> = ({ isOpen, onClose, ebook, userRole }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const renderTaskRef = useRef<any>(null);

  const canDownload = userRole !== 'VISITANTE' && userRole !== 'MEMBRO';

  useEffect(() => {
    if (!isOpen || !ebook?.downloadUrl) return;
    if (ebook.downloadUrl.includes('drive.google.com')) return;

    setLoading(true);
    setError('');
    setPdfDoc(null);
    setCurrentPage(1);
    setTotalPages(0);

    import('pdfjs-dist').then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      pdfjsLib.getDocument(ebook.downloadUrl!).promise
        .then((doc: any) => {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setLoading(false);
        })
        .catch(() => {
          setError('Não foi possível carregar o PDF.');
          setLoading(false);
        });
    });
  }, [isOpen, ebook?.downloadUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    pdfDoc.getPage(currentPage).then((page: any) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const viewport = page.getViewport({ scale: window.devicePixelRatio > 1 ? 1.5 : 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      const task = page.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      task.promise.catch(() => {});
    });
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null);
      setCurrentPage(1);
      setTotalPages(0);
      setError('');
    }
  }, [isOpen]);

  if (!ebook) return null;

  const isGoogleDrive = ebook.downloadUrl?.includes('drive.google.com');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-2xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-black/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/20">
                  <BookOpen className="text-[#D4AF37]" size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold leading-tight">{ebook.title}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Leitor Digital Imperial</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {ebook.downloadUrl && (
                  canDownload ? (
                    <a href={ebook.downloadUrl} target="_blank" rel="noopener noreferrer"
                      className="hidden sm:flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#b5952f] transition-all">
                      <Download size={14} /> BAIXAR PDF
                    </a>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2 bg-gray-800 text-gray-500 px-4 py-2 rounded-lg text-xs font-bold cursor-not-allowed border border-gray-700">
                      <Lock size={14} /> DOWNLOAD BLOQUEADO
                    </div>
                  )
                )}
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {ebook.downloadUrl && ebook.downloadUrl.trim() !== '' ? (
                isGoogleDrive ? (
                  <div className="w-full h-[70vh]">
                    <iframe
                      src={ebook.downloadUrl.replace('/view?usp=sharing', '/preview').replace('/view', '/preview')}
                      className="w-full h-full border-0 block"
                      title="PDF Viewer"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    {loading && (
                      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
                        <Loader size={24} className="animate-spin" />
                        <span className="text-sm">Carregando e-book...</span>
                      </div>
                    )}
                    {error && (
                      <div className="flex items-center justify-center h-64 text-red-400 text-sm">{error}</div>
                    )}
                    {!loading && !error && (
                      <canvas ref={canvasRef} className="w-full" />
                    )}
                    {totalPages > 0 && (
                      <div className="sticky bottom-0 w-full flex items-center justify-center gap-4 py-3 bg-gray-900/95 border-t border-gray-800">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-all">
                          <ChevronLeft size={18} />
                        </button>
                        <span className="text-gray-400 text-sm font-bold">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 hover:bg-gray-700 transition-all">
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="p-6 sm:p-8">
                  <div className="max-w-2xl mx-auto prose prose-invert prose-gold overflow-x-hidden w-full"
                    dangerouslySetInnerHTML={{ __html: ebook.content || '' }} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-800 bg-black/30 flex flex-wrap items-center justify-center sm:justify-between gap-1 text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="text-center">© DIETA MILENAR - TODOS OS DIREITOS RESERVADOS</span>
              <span className="hidden sm:inline">PROPRIEDADE EXCLUSIVA DO IMPÉRIO</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
