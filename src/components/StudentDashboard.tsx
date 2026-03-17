import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, BookOpen, CheckCircle, Lock, Menu, ChevronLeft, ChevronRight, Clock, Download, MessageCircle, FileText, StickyNote, Award, Users, Eye, Layers, Box, X, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Product, Module, Chapter, UserRole, BonusItem, Category, Ebook, BonusCategory, BonusItem_2 } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { CheckoutModal } from './CheckoutModal';
import { ProductCheckoutModal } from './ProductCheckoutModal';
import { EbookModal } from './EbookModal';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

// Mock content for the reader
const MOCK_CONTENT = `
  <h2>Bem-vindo aos Segredos do Egito</h2>
  <p>Neste módulo, você descobrirá os fundamentos da alimentação que manteve uma civilização inteira forte e saudável por milênios.</p>
  <p>Os antigos egípcios não contavam calorias. Eles nutriam o corpo com o que a terra oferecia de melhor.</p>
  <h3>O que você vai aprender:</h3>
  <ul>
    <li>Os 3 pilares da alimentação faraônica</li>
    <li>Como ativar seu metabolismo natural</li>
    <li>Receitas sagradas para o dia a dia</li>
  </ul>
`;

interface CoursePlayerProps {
  product: Product;
  onBack: () => void;
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ product, onBack }) => {
  const { currentUser } = useData();
  const [activeModuleId, setActiveModuleId] = useState<string>(product.modules[0]?.id || '');
  const [activeChapterId, setActiveChapterId] = useState<string>(product.modules[0]?.chapters[0]?.id || '');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState<string>('');

  // Find current active data
  const activeModule = product.modules.find(m => m.id === activeModuleId);
  const activeChapter = activeModule?.chapters.find(c => c.id === activeChapterId);

  // Mock progress tracking
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);

  const toggleChapterCompletion = (chapterId: string) => {
    setCompletedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const totalChapters = product.modules.reduce((acc, m) => acc + m.chapters.length, 0);
  const progress = Math.round((completedChapters.length / (totalChapters || 1)) * 100);

  const generateCertificate = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Background
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.rect(12, 12, 273, 186);

    // Content
    doc.setTextColor(212, 175, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("CERTIFICADO DE CONCLUSÃO", 148.5, 50, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("Certificamos que", 148.5, 80, { align: "center" });

    doc.setFontSize(30);
    doc.setFont("times", "bold");
    doc.text(currentUser?.name || "Aluno", 148.5, 100, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("concluiu com êxito o treinamento", 148.5, 120, { align: "center" });

    doc.setTextColor(212, 175, 55);
    doc.setFontSize(24);
    doc.text(product.name.toUpperCase(), 148.5, 135, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 148.5, 160, { align: "center" });

    // Signature Line
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.line(98.5, 180, 198.5, 180);
    doc.text("Diretoria Dieta Milenar", 148.5, 185, { align: "center" });

    doc.save("certificado-dieta-milenar.pdf");
  };

  return (
    <div className="flex h-screen bg-black text-gray-300 overflow-hidden pt-16">
      <DashboardHeader title={product.name} icon={<BookOpen className="text-[#D4AF37]" />} />

      {/* Sidebar */}
      <motion.div 
        initial={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        animate={{ width: isSidebarOpen ? 320 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-gray-900 border-r border-gray-800 flex-shrink-0 flex flex-col h-full overflow-hidden absolute lg:relative z-20"
      >
        <div className="p-4 border-b border-gray-800 flex items-center justify-between lg:hidden">
          <h3 className="font-heading font-bold text-[#D4AF37] truncate">Menu</h3>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400">
            <ChevronLeft />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {product.modules.map(module => (
            <div key={module.id}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{module.title}</h4>
              <div className="space-y-1">
                {module.chapters.map(chapter => {
                  const isActive = chapter.id === activeChapterId;
                  const isCompleted = completedChapters.includes(chapter.id);
                  const isLocked = chapter.isLocked;

                  return (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        if (!isLocked) {
                          setActiveChapterId(chapter.id);
                          if (window.innerWidth < 1024) setIsSidebarOpen(false);
                        }
                      }}
                      disabled={isLocked}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${
                        isActive 
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' 
                          : 'hover:bg-gray-800 text-gray-400'
                      } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLocked ? (
                        <Lock size={14} />
                      ) : isCompleted ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : (
                        <div className={`w-3.5 h-3.5 rounded-full border-2 ${isActive ? 'border-[#D4AF37]' : 'border-gray-600'}`} />
                      )}
                      <span className="truncate text-left">{chapter.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center mb-3">
            {completedChapters.length} de {totalChapters} aulas concluídas
          </p>
          
          {progress === 100 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => {
                if (currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE') {
                  toast.error('O download do certificado é exclusivo para membros VIP e superiores.');
                  return;
                }
                generateCertificate();
              }}
              className={`w-full flex items-center justify-center gap-2 border py-2 rounded-lg text-xs font-bold transition-all ${
                (currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE')
                  ? 'bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black'
              }`}
            >
              <Award size={14} />
              {currentUser?.role === 'MEMBRO' || currentUser?.role === 'VISITANTE' ? 'CERTIFICADO BLOQUEADO' : 'BAIXAR CERTIFICADO'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        {/* Top Bar */}
        <div className="h-14 bg-black border-b border-gray-800 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
            >
              <Menu size={20} />
            </button>
            <h2 className="font-bold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{activeChapter?.title}</h2>
          </div>
          <div className="flex items-center gap-2">
             <button 
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-lg transition-colors ${showNotes ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-gray-400 hover:text-white'}`}
              title="Anotações"
            >
              <StickyNote size={20} />
            </button>
            <button 
              onClick={onBack}
              className="text-xs sm:text-sm text-gray-400 hover:text-white whitespace-nowrap"
            >
              Voltar
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-12">
            <div className="max-w-3xl mx-auto pb-20">
              {activeChapter ? (
                <motion.div
                  key={activeChapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="aspect-video bg-gray-900 rounded-xl mb-8 flex flex-col items-center justify-center border border-gray-800 shadow-2xl relative overflow-hidden group">
                    {currentUser?.role === 'VISITANTE' ? (
                      <div className="text-center p-6">
                        <Lock className="text-[#D4AF37] w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-white font-bold mb-2">Vídeo Bloqueado</p>
                        <p className="text-xs text-gray-500 max-w-[200px]">Torne-se um Membro para desbloquear este conteúdo sagrado.</p>
                      </div>
                    ) : (
                      <>
                        <Play className="text-gray-700 w-16 h-16" />
                        <span className="sr-only">Video Placeholder</span>
                      </>
                    )}
                  </div>

                  <div className="prose prose-invert prose-gold max-w-none relative">
                    {currentUser?.role === 'VISITANTE' && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black z-10 flex items-end justify-center pb-10">
                        <div className="bg-gray-900 border border-[#D4AF37]/30 p-6 rounded-2xl text-center shadow-2xl max-w-sm mx-4">
                          <Lock className="text-[#D4AF37] mx-auto mb-3" size={24} />
                          <h4 className="text-white font-bold mb-2">Conteúdo Restrito</h4>
                          <p className="text-sm text-gray-400 mb-4">Visitantes podem navegar pelo painel, mas o acesso completo aos rituais e e-books é exclusivo para membros.</p>
                          <button 
                            onClick={() => window.location.href = '/'}
                            className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded-lg text-sm hover:bg-[#b5952f] transition-colors"
                          >
                            Quero ser Membro
                          </button>
                        </div>
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-heading text-[#D4AF37] mb-6">{activeChapter.title}</h1>
                    <div className={`${currentUser?.role === 'VISITANTE' ? 'blur-sm select-none pointer-events-none' : ''}`} dangerouslySetInnerHTML={{ __html: activeChapter.content || MOCK_CONTENT }} />
                  </div>

                  {/* Navigation & Completion */}
                  <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-8">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors order-2 sm:order-1">
                      <ChevronLeft size={20} />
                      Aula Anterior
                    </button>

                    <button 
                      onClick={() => activeChapter && toggleChapterCompletion(activeChapter.id)}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold transition-all order-1 sm:order-2 ${
                        activeChapter && completedChapters.includes(activeChapter.id)
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-[#D4AF37] text-black hover:bg-[#b5952f]'
                      }`}
                    >
                      {activeChapter && completedChapters.includes(activeChapter.id) ? (
                        <>
                          <CheckCircle size={20} />
                          Concluída
                        </>
                      ) : (
                        'Marcar como Concluída'
                      )}
                    </button>

                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors order-3">
                      Próxima Aula
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500">Selecione uma aula para começar.</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes Sidebar */}
          <AnimatePresence>
            {showNotes && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="bg-gray-900 border-l border-gray-800 flex-shrink-0 flex flex-col h-full overflow-hidden hidden lg:flex"
              >
                <div className="p-4 border-b border-gray-800">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <StickyNote size={18} className="text-[#D4AF37]" />
                    Minhas Anotações
                  </h3>
                </div>
                <div className="flex-1 p-4">
                  <textarea
                    className="w-full h-full bg-black/50 border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37] resize-none"
                    placeholder="Digite suas anotações sobre esta aula aqui..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="p-4 border-t border-gray-800">
                  <button className="w-full bg-[#D4AF37] text-black font-bold py-2 rounded hover:bg-[#b5952f] transition-colors">
                    Salvar Nota
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

type StudentTab = 'library' | 'history' | 'bonuses' | 'support' | 'products';

export const StudentDashboard: React.FC = () => {
  const { products, currentUser, transactions, bonuses, globalSettings, categories, ebooks, bonusCategories, bonusItems, logout } = useData();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<StudentTab>('library');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productToBuy, setProductToBuy] = useState<Product | null>(null);
  const [isProductCheckoutOpen, setIsProductCheckoutOpen] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedBonusCategory, setSelectedBonusCategory] = useState<BonusCategory | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { id: 'library', label: 'Biblioteca', icon: BookOpen },
    { id: 'bonuses', label: 'Bônus', icon: Download },
    { id: 'products', label: 'Produtos', icon: Box },
    { id: 'history', label: 'Histórico', icon: Clock },
    { id: 'support', label: 'Suporte', icon: MessageCircle },
  ] as const;

  // Filter products owned by user (Mock: All products for now)
  const myProducts = products;
  
  // Filter transactions for current user
  const myTransactions = transactions.filter(t => t.userId === currentUser?.id);

  // Filter bonuses for current user role based on hierarchy
  const myBonuses = bonuses.filter(b => {
    if (!b.active) return false;
    
    const roleHierarchy = {
      'VISITANTE': 0,
      'MEMBRO': 1,
      'VIP': 2,
      'REVENDA': 3,
      'ADMIN': 4
    };

    const userLevel = roleHierarchy[currentUser?.role || 'VISITANTE'];
    const targetLevel = roleHierarchy[b.targetAudience as UserRole] || 1;

    return userLevel >= targetLevel;
  });

  // Check if a category is unlocked for the user
  const isCategoryUnlocked = (category: Category) => {
    if (currentUser?.role === 'ADMIN') return true;
    if (category.isMandatory) return true;

    // Logic for 21 days drip:
    // We check the user's creation date or the first transaction date
    const joinDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const requiredDays = category.dripDays || 21;
    return diffDays >= requiredDays;
  };

  const handlePaymentSuccess = () => {
    toast.success('Pagamento realizado com sucesso! O acesso será liberado em instantes.');
    // Here you would update the user's access in the context
    // addTransaction({ ... });
  };

  const renderLibrary = () => {
    if (selectedCategory) {
      const categoryEbooks = ebooks.filter(e => e.categoryId === selectedCategory.id).sort((a, b) => a.order - b.order);

      return (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
              <Layers className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{selectedCategory.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-1">{selectedCategory.description}</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {categoryEbooks.map(ebook => (
                <motion.div 
                  key={ebook.id}
                  whileHover={{ y: -5 }}
                  className="flex-none w-[200px] sm:w-[220px] snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group cursor-pointer"
                  onClick={() => {
                    setSelectedEbook(ebook);
                    setIsEbookModalOpen(true);
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img 
                      src={ebook.coverImage || '/img/capa.png'} 
                      alt={ebook.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                        <BookOpen size={24} />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white mb-1 font-heading line-clamp-1">{ebook.title}</h3>
                    <p className="text-[10px] text-gray-400 line-clamp-2">{ebook.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            {categoryEbooks.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>

          <button 
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mt-6 text-sm"
          >
            <ChevronLeft size={16} /> Voltar para Modalidades
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
            <Layers className="text-[#D4AF37]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Modalidades</h2>
            <p className="text-gray-400 text-sm">Escolha uma modalidade para começar sua jornada.</p>
          </div>
        </div>

        <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.sort((a, b) => a.order - b.order).map(category => {
                const unlocked = isCategoryUnlocked(category);
                return (
                  <motion.div
                    key={category.id}
                    whileHover={unlocked ? { y: -5 } : {}}
                    className={`flex-none w-[200px] sm:w-[220px] snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group transition-all ${unlocked ? 'cursor-pointer hover:border-[#D4AF37]/30' : 'opacity-75 cursor-not-allowed'}`}
                    onClick={() => unlocked && setSelectedCategory(category)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      {category.coverImage ? (
                        <img src={category.coverImage} alt={category.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className={`p-5 rounded-2xl ${unlocked ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-gray-800 text-gray-500'}`}>
                            {unlocked ? <Layers size={40} /> : <Lock size={40} />}
                          </div>
                        </div>
                      )}
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <Lock size={24} className="text-[#D4AF37]" />
                          <span className="text-xs text-gray-300 font-bold text-center px-3">Libera em {category.dripDays || 21} dias</span>
                        </div>
                      )}
                      {unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                            <BookOpen size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className={`text-sm font-bold mb-1 font-heading line-clamp-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{category.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{category.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {categories.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-black/50 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Data</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {myTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Nenhuma compra encontrada.</td>
              </tr>
            ) : (
              myTransactions.map(t => (
                <tr key={t.id} className="text-sm hover:bg-gray-800/50">
                  <td className="p-4 text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-4 text-white font-medium">{t.planName}</td>
                  <td className="p-4 text-[#D4AF37]">R$ {t.amount.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                      t.status === 'approved' ? 'bg-green-900/20 text-green-400' :
                      t.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {t.status === 'approved' ? 'Aprovado' : t.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Check if a bonus category is unlocked for the user
  const isBonusCategoryUnlocked = (category: BonusCategory) => {
    if (currentUser?.role === 'ADMIN') return true;
    if (category.isMandatory) return true;
    const joinDate = currentUser?.createdAt ? new Date(currentUser.createdAt) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const requiredDays = category.dripDays || 0;
    return diffDays >= requiredDays;
  };

  const renderBonuses = () => {
    // Vista interna: itens de uma categoria de bônus selecionada
    if (selectedBonusCategory) {
      const categoryBonusItems = bonusItems
        .filter(bi => bi.bonusCategoryId === selectedBonusCategory.id)
        .sort((a, b) => a.order - b.order);

      return (
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
              <Download className="text-[#D4AF37]" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-heading">{selectedBonusCategory.name}</h2>
              <p className="text-gray-400 text-sm line-clamp-1">{selectedBonusCategory.description}</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {categoryBonusItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 w-full">
                  Nenhum bônus disponível nesta categoria.
                </div>
              ) : (
                categoryBonusItems.map(item => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="flex-none w-[200px] sm:w-[220px] snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group cursor-pointer"
                    onClick={() => {
                      setSelectedEbook({ ...item, categoryId: item.bonusCategoryId } as any);
                      setIsEbookModalOpen(true);
                    }}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={item.coverImage || '/img/capa.png'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                          <BookOpen size={24} />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-white mb-1 font-heading line-clamp-1">{item.title}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            {categoryBonusItems.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>

          <button
            onClick={() => setSelectedBonusCategory(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-colors mt-6 text-sm"
          >
            <ChevronLeft size={16} /> Voltar para Bônus
          </button>
        </div>
      );
    }

    // Vista de categorias de bônus
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#D4AF37]/10 p-3 rounded-xl border border-[#D4AF37]/20">
            <Download className="text-[#D4AF37]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">Bônus</h2>
            <p className="text-gray-400 text-sm">Seus materiais e bônus exclusivos.</p>
          </div>
        </div>

        {bonusCategories.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
            Nenhum bônus disponível no momento.
          </div>
        ) : (
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {bonusCategories.sort((a, b) => a.order - b.order).map(category => {
                const unlocked = isBonusCategoryUnlocked(category);
                return (
                  <motion.div
                    key={category.id}
                    whileHover={unlocked ? { y: -5 } : {}}
                    className={`flex-none w-[200px] sm:w-[220px] snap-start bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-lg group transition-all ${unlocked ? 'cursor-pointer hover:border-[#D4AF37]/30' : 'opacity-75 cursor-not-allowed'}`}
                    onClick={() => unlocked && setSelectedBonusCategory(category)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-black">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className={`p-5 rounded-2xl ${unlocked ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-gray-800 text-gray-500'}`}>
                          {unlocked ? <Download size={40} /> : <Lock size={40} />}
                        </div>
                      </div>
                      {!unlocked && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                          <Lock size={24} className="text-[#D4AF37]" />
                          <span className="text-xs text-gray-300 font-bold text-center px-3">Libera em {category.dripDays || 0} dias</span>
                        </div>
                      )}
                      {unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                            <BookOpen size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className={`text-sm font-bold mb-1 font-heading line-clamp-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>{category.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-2">{category.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {bonusCategories.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-2 opacity-40">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-gray-800" />
                <p className="text-[9px] text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">Deslize para o lado</p>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-gray-800" />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProducts = () => (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Produtos</h2>
        <p className="text-gray-400">Adquira ou acesse seus produtos.</p>
      </div>
      {myProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-900 rounded-xl border border-gray-800">
          Nenhum produto disponível no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {myProducts.map(product => (
            <div key={product.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden group hover:border-[#D4AF37]/30 transition-all flex flex-col">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img src={product.coverImage || '/img/capa.png'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-[#D4AF37] text-black p-3 rounded-full">
                    <Play size={24} />
                  </div>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-white font-bold mb-1">{product.name}</h3>
                <p className="text-gray-400 text-xs line-clamp-2 mb-4">{product.description}</p>
                <div className="mt-auto flex items-center justify-between gap-3">
                  <span className="text-[#D4AF37] font-bold text-sm">
                    R$ {(+product.price).toFixed(2)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedProduct(product); }}
                      className="flex items-center gap-1.5 text-xs bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors font-bold"
                    >
                      <Play size={13} /> Acessar
                    </button>
                    <button
                      onClick={() => { setProductToBuy(product); setIsProductCheckoutOpen(true); }}
                      className="flex items-center gap-1.5 text-xs bg-[#D4AF37] text-black px-3 py-2 rounded-lg hover:bg-[#b5952f] transition-colors font-bold"
                    >
                      <Download size={13} /> Comprar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSupport = () => (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-xl p-8 border border-gray-800 text-center">
      <MessageCircle size={48} className="text-[#D4AF37] mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">Precisa de Ajuda?</h2>
      <p className="text-gray-400 mb-8">Nossa equipe de escribas está pronta para responder suas dúvidas sobre o método ou acesso.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button 
          onClick={() => window.open(`https://wa.me/${globalSettings.supportWhatsapp}`, '_blank')}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
        >
          <MessageCircle size={20} /> Falar no WhatsApp
        </button>
        <button 
          onClick={() => window.location.href = `mailto:${globalSettings.supportEmail}`}
          className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
        >
          <FileText size={20} /> Enviar E-mail
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-16 px-4 pb-12 max-w-7xl mx-auto">
        {/* Fixed Tab Bar Navigation */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-gray-800 flex items-center overflow-hidden">
          {/* Fixed Hamburger Menu */}
          <div className="relative z-50 bg-black py-3 pr-4 flex items-center border-r border-gray-800/50 shadow-[20px_0_25px_-10px_rgba(0,0,0,0.9)]">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-800 rounded-lg text-[#D4AF37] transition-colors flex items-center justify-center"
            >
              <Menu size={24} />
            </button>

            {/* Drawer lateral igual ao admin */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 left-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-[60] flex flex-col shadow-2xl"
                  >
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                      <span className="font-heading font-bold text-[#D4AF37] text-xl">Menu</span>
                      <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                      {/* User Info */}
                      <div className="bg-black/50 p-4 rounded-lg border border-gray-800">
                        <p className="text-white font-bold">{currentUser?.name}</p>
                        <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        <span className="inline-block mt-2 text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                          {currentUser?.role === 'VIP' ? 'MEMBRO VIP' : currentUser?.role}
                        </span>
                      </div>

                      {/* Tabs de navegação */}
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2 px-2">Navegação</p>
                        {menuItems.map(item => (
                          <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                            className={`flex items-center gap-3 w-full p-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                          >
                            <item.icon size={16} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-800">
                      <button
                        onClick={() => { logout(); window.location.href = '/'; }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/30 transition-colors font-bold justify-center"
                      >
                        <LogOut size={18} /> Sair
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Scrollable Tabs - Pass under the fixed hamburger */}
          <div className="flex overflow-x-auto scrollbar-hide gap-4 py-4 px-6 flex-1 whitespace-nowrap snap-x">
            {menuItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all snap-start border flex items-center gap-2 ${
                  activeTab === item.id 
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                    : 'text-gray-400 border-gray-800 hover:border-gray-600 hover:text-white bg-gray-900/50'
                }`}
              >
                <item.icon size={14} className={activeTab === item.id ? 'text-black' : 'text-gray-500'} />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'library' && renderLibrary()}
            {activeTab === 'bonuses' && renderBonuses()}
            {activeTab === 'products' && renderProducts()}
            {activeTab === 'history' && renderHistory()}
            {activeTab === 'support' && renderSupport()}
          </motion.div>
        </AnimatePresence>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        productName={productToBuy?.name || ''}
        price={productToBuy?.price || 0}
        onSuccess={handlePaymentSuccess}
      />

      <ProductCheckoutModal
        isOpen={isProductCheckoutOpen}
        onClose={() => setIsProductCheckoutOpen(false)}
        product={productToBuy}
      />

      <EbookModal
        isOpen={isEbookModalOpen}
        onClose={() => setIsEbookModalOpen(false)}
        ebook={selectedEbook}
        userRole={currentUser?.role}
      />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${globalSettings.supportWhatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        title="Falar com Suporte"
      >
        <MessageCircle size={28} />
      </a>
    </div>
  );
};
