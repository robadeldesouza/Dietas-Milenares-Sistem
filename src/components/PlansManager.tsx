import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { PricingPlan } from '../types';
import { Edit, Trash2, Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const PlansManager: React.FC = () => {
  const { plans, addPlan, updatePlan, deletePlan } = useData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<PricingPlan>>({});

  const handleEdit = (plan: PricingPlan) => {
    setEditingId(plan.id);
    setFormData(plan);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: Date.now().toString(),
      name: '',
      price: 0,
      oldPrice: 0,
      period: 'mês',
      features: [],
      isPopular: false,
      active: true
    });
  };

  const handleSave = () => {
    if (isAdding && formData.name) {
      addPlan(formData as PricingPlan);
      toast.success('Plano criado com sucesso!');
    } else if (editingId && formData.name) {
      updatePlan(editingId, formData);
      toast.success('Plano atualizado com sucesso!');
    } else {
      toast.error('Preencha o nome do plano.');
      return;
    }
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gerenciar Planos</h2>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#FFD700] transition-colors"
        >
          <Plus size={18} /> Novo Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Editing/Adding Form Card */}
        {(editingId || isAdding) && (
          <div className="bg-gray-800 border border-[#D4AF37] rounded-xl p-6 shadow-2xl relative order-first md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold text-[#D4AF37] mb-4">
              {isAdding ? 'Novo Plano' : 'Editar Plano'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nome do Plano</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preço Atual (R$)</label>
                  <input 
                    type="number" 
                    value={formData.price || 0} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Preço Antigo (R$)</label>
                  <input 
                    type="number" 
                    value={formData.oldPrice || 0} 
                    onChange={e => setFormData({...formData, oldPrice: Number(e.target.value)})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Período (ex: mês, ano)</label>
                  <input 
                    type="text" 
                    value={formData.period || ''} 
                    onChange={e => setFormData({...formData, period: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none"
                  />
                </div>
                <div className="flex items-center pt-6 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isPopular || false} 
                      onChange={e => setFormData({...formData, isPopular: e.target.checked})}
                      className="rounded bg-gray-900 border-gray-700 text-[#D4AF37] focus:ring-[#D4AF37]"
                    />
                    <span className="text-sm text-gray-300">Destacar (Popular)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.active !== false} 
                      onChange={e => setFormData({...formData, active: e.target.checked})}
                      className="rounded bg-gray-900 border-gray-700 text-green-500 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-300">Ativo</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Benefícios</label>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={e => handleFeatureChange(index, e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded p-1 text-sm text-white focus:border-[#D4AF37] outline-none"
                      />
                      <button onClick={() => removeFeature(index)} className="text-red-400 hover:text-red-300">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addFeature} className="text-xs text-[#D4AF37] mt-2 hover:underline flex items-center gap-1">
                  <Plus size={12} /> Adicionar Benefício
                </button>
              </div>

              <div className="flex gap-2 pt-4">
                <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold flex items-center justify-center gap-2">
                  <Check size={16} /> Salvar
                </button>
                <button onClick={handleCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-bold">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Plans List */}
        {plans.map(plan => (
          <div key={plan.id} className={`bg-gray-900 border ${plan.isPopular ? 'border-[#D4AF37]' : 'border-gray-800'} rounded-xl p-6 relative group ${plan.active === false ? 'opacity-50' : ''}`}>
            {plan.isPopular && (
              <div className="absolute top-2 right-2 text-[#D4AF37] text-xs font-bold border border-[#D4AF37] px-2 py-0.5 rounded-full">
                POPULAR
              </div>
            )}
            {!plan.active && (
              <div className="absolute top-2 left-2 text-red-500 text-xs font-bold border border-red-500 px-2 py-0.5 rounded-full">
                INATIVO
              </div>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="text-2xl font-bold text-[#D4AF37] mb-4">
              R$ {plan.price.toFixed(2)} <span className="text-sm text-gray-500 font-normal">/{plan.period}</span>
            </div>
            
            <ul className="space-y-1 mb-6">
              {plan.features.slice(0, 3).map((f, i) => (
                <li key={i} className="text-xs text-gray-400 truncate">• {f}</li>
              ))}
              {plan.features.length > 3 && (
                <li className="text-xs text-gray-500 italic">+ {plan.features.length - 3} benefícios</li>
              )}
            </ul>

            <div className="flex gap-2 mt-auto">
              <button 
                onClick={() => handleEdit(plan)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded flex items-center justify-center gap-2 text-sm transition-colors"
              >
                <Edit size={14} /> Editar
              </button>
              <button 
                onClick={() => { deletePlan(plan.id); toast.success('Plano excluído!'); }}
                className="bg-red-900/30 hover:bg-red-900/50 text-red-400 py-2 px-3 rounded flex items-center justify-center transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
