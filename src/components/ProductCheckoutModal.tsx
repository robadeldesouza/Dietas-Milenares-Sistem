import React, { useState } from 'react';
import { X, Copy, ExternalLink, QrCode, Link2, CheckCircle } from 'lucide-react';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface ProductCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductCheckoutModal: React.FC<ProductCheckoutModalProps> = ({ isOpen, onClose, product }) => {
  const [tab, setTab] = useState<'pix' | 'link'>('link');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product) return null;

  const hasLink = !!product.paymentLink;
  const hasPix = !!product.pixKey;

  const handleCopyPix = () => {
    if (!product.pixKey) return;
    navigator.clipboard.writeText(product.pixKey).then(() => {
      setCopied(true);
      toast.success('Chave Pix copiada!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const pixKeyTypeLabel: Record<string, string> = {
    cpf: 'CPF',
    email: 'E-mail',
    phone: 'Telefone',
    random: 'Chave Aleatória',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/50">
          <div>
            <h2 className="text-lg font-bold text-white">Finalizar Compra</h2>
            <p className="text-xs text-gray-400 mt-0.5">{product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Preço */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#D4AF37]">R$ {(+product.price).toFixed(2)}</span>
            {product.offerPrice && product.offerPrice < product.price && (
              <span className="text-sm text-gray-500 line-through">R$ {product.offerPrice.toFixed(2)}</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        {hasLink && hasPix && (
          <div className="px-6 flex gap-2 mb-4">
            <button
              onClick={() => setTab('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all border ${tab === 'link' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              <Link2 size={15} /> Link de Pagamento
            </button>
            <button
              onClick={() => setTab('pix')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all border ${tab === 'pix' ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500'}`}
            >
              <QrCode size={15} /> Pix
            </button>
          </div>
        )}

        <div className="px-6 pb-6 space-y-4">
          {/* Link de pagamento */}
          {(tab === 'link' || !hasPix) && hasLink && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Clique no botão abaixo para ir à página de pagamento:</p>
              <a
                href={product.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#b5952f] transition-colors text-sm"
              >
                <ExternalLink size={17} /> Ir para o Pagamento
              </a>
            </div>
          )}

          {/* Pix */}
          {(tab === 'pix' || !hasLink) && hasPix && (
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Copie a chave Pix abaixo e realize o pagamento no seu banco:</p>
              <div className="bg-black rounded-xl border border-gray-700 p-4 space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                  {pixKeyTypeLabel[product.pixKeyType || 'random']}
                </p>
                <p className="text-white font-mono text-sm break-all">{product.pixKey}</p>
              </div>
              <button
                onClick={handleCopyPix}
                className={`w-full flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition-colors text-sm border ${copied ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-[#D4AF37] text-black border-[#D4AF37] hover:bg-[#b5952f]'}`}
              >
                {copied ? <><CheckCircle size={17} /> Copiado!</> : <><Copy size={17} /> Copiar Chave Pix</>}
              </button>
              <p className="text-[10px] text-gray-500 text-center">
                Após o pagamento, entre em contato com o suporte para liberar o acesso.
              </p>
            </div>
          )}

          {/* Nenhum método configurado */}
          {!hasLink && !hasPix && (
            <div className="text-center py-6 text-gray-500 text-sm">
              Nenhuma forma de pagamento configurada para este produto.<br />
              Entre em contato com o suporte.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
