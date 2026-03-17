import React, { useState } from 'react';
import { Lock, Key, ChevronDown, Search, Users, Check } from 'lucide-react';

interface TestePageProps {
  onBack: () => void;
}

const MOCK_USERS = [
  { id: '1', name: 'Adorei da Silva', email: 'and@gmail.com', role: 'VISITANTE', status: 'active' },
  { id: '2', name: 'Admin Faraó', email: 'admin@dietasmilenares.com', role: 'ADMIN', status: 'active' },
  { id: '3', name: 'Maria VIP', email: 'maria@email.com', role: 'VIP', status: 'active' },
  { id: '4', name: 'João Membro', email: 'joao@email.com', role: 'MEMBRO', status: 'active' },
];

const ROLES = ['VISITANTE', 'MEMBRO', 'VIP', 'REVENDA', 'ADMIN'];
const roleLabel = (role: string) => ({ VISITANTE: 'Visitante', MEMBRO: 'Membro', VIP: 'Membro VIP', REVENDA: 'Revenda', ADMIN: 'Administrador' }[role] || role);
const roleBadgeColor = (role: string) => ({ VISITANTE: 'bg-gray-700 text-gray-300', MEMBRO: 'bg-blue-900/50 text-blue-300', VIP: 'bg-yellow-900/50 text-yellow-300', REVENDA: 'bg-purple-900/50 text-purple-300', ADMIN: 'bg-red-900/50 text-red-300' }[role] || 'bg-gray-700 text-gray-300');

const SearchBar = () => (
  <div className="relative w-full sm:w-auto">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
    <input className="bg-black border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white w-full sm:w-56" placeholder="Buscar usuário..." />
  </div>
);

const RoleSelect = ({ role }: { role: string }) => (
  <select defaultValue={role} className="bg-black border border-gray-700 rounded px-2 py-1 text-xs text-white">
    {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
  </select>
);

const Actions = () => (
  <div className="flex gap-2">
    <button className="text-red-400 hover:text-red-300"><Lock size={14} /></button>
    <button className="text-blue-400 hover:text-blue-300"><Key size={14} /></button>
  </div>
);

const Avatar = ({ name, size = 8 }: { name: string; size?: number }) => (
  <div className={`w-${size} h-${size} rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold text-xs flex-shrink-0`}>
    {name.charAt(0)}
  </div>
);

// Template 1: Tabela clássica com scroll
const Template1 = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
    <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Gestão de Usuários</h2>
      <SearchBar />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[500px]">
        <thead className="bg-black/50 text-gray-500 text-xs uppercase">
          <tr><th className="p-3">Nome</th><th className="p-3">Email</th><th className="p-3">Função</th><th className="p-3">Ações</th></tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {MOCK_USERS.map(u => (
            <tr key={u.id} className="hover:bg-gray-800/50 text-sm">
              <td className="p-3 text-white font-bold">{u.name}</td>
              <td className="p-3 text-gray-400 text-xs">{u.email}</td>
              <td className="p-3"><RoleSelect role={u.role} /></td>
              <td className="p-3"><Actions /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Template 2: Cards em grid 2 colunas
const Template2 = () => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Gestão de Usuários</h2>
      <SearchBar />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {MOCK_USERS.map(u => (
        <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Avatar name={u.name} size={9} />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{u.name}</p>
              <p className="text-gray-500 text-xs truncate">{u.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1"><RoleSelect role={u.role} /></div>
            <Actions />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Template 3: Lista com badges coloridos
const Template3 = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
    <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Usuários</h2>
      <SearchBar />
    </div>
    <div className="divide-y divide-gray-800">
      {MOCK_USERS.map(u => (
        <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar name={u.name} />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{u.name}</p>
              <p className="text-gray-500 text-xs truncate">{u.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${roleBadgeColor(u.role)}`}>{roleLabel(u.role)}</span>
            <RoleSelect role={u.role} />
            <Actions />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Template 4: Accordion expansível
const Template4 = () => {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-3">
        <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Usuários</h2>
        <SearchBar />
      </div>
      {MOCK_USERS.map(u => (
        <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === u.id ? null : u.id)} className="w-full flex items-center justify-between p-3 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar name={u.name} />
              <div className="text-left">
                <p className="text-white font-bold text-sm">{u.name}</p>
                <p className="text-gray-500 text-xs">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase hidden sm:inline ${roleBadgeColor(u.role)}`}>{roleLabel(u.role)}</span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${open === u.id ? 'rotate-180' : ''}`} />
            </div>
          </button>
          {open === u.id && (
            <div className="px-4 pb-4 border-t border-gray-800 pt-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase mb-1 block">Função</label>
                <RoleSelect role={u.role} />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 text-xs bg-red-900/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900/30"><Lock size={13} /> Banir</button>
                <button className="flex items-center gap-1.5 text-xs bg-blue-900/20 text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-900/30"><Key size={13} /> Senha</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Template 5: Duas colunas compactas
const Template5 = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
    <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Usuários</h2>
      <SearchBar />
    </div>
    <div className="divide-y divide-gray-800">
      {MOCK_USERS.map(u => (
        <div key={u.id} className="p-3 grid grid-cols-2 gap-2 items-center">
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{u.name}</p>
            <div className="mt-1"><RoleSelect role={u.role} /></div>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-xs truncate">{u.email}</p>
            <div className="flex justify-end gap-2 mt-1"><Actions /></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Template 6: Cards com avatar centralizado
const Template6 = () => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Usuários</h2>
      <SearchBar />
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {MOCK_USERS.map(u => (
        <div key={u.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-lg">{u.name.charAt(0)}</div>
          <p className="text-white font-bold text-xs leading-tight">{u.name}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${roleBadgeColor(u.role)}`}>{roleLabel(u.role)}</span>
          <RoleSelect role={u.role} />
          <Actions />
        </div>
      ))}
    </div>
  </div>
);

// Template 7: Lista mobile-first com borda lateral
const Template7 = () => (
  <div className="space-y-3">
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Usuários</h2>
      <SearchBar />
    </div>
    {MOCK_USERS.map(u => (
      <div key={u.id} className="bg-gray-900 rounded-xl border border-gray-800 flex overflow-hidden">
        <div className="w-1 bg-[#D4AF37] flex-shrink-0" />
        <div className="flex-1 p-3 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar name={u.name} />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">{u.name}</p>
              <p className="text-gray-500 text-xs truncate">{u.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <RoleSelect role={u.role} />
            <button className="p-1.5 bg-red-900/20 text-red-400 rounded-lg"><Lock size={13} /></button>
            <button className="p-1.5 bg-blue-900/20 text-blue-400 rounded-lg"><Key size={13} /></button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Template 8: Tabela com avatar integrado
const Template8 = () => (
  <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
    <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <div>
        <h2 className="text-white font-bold flex items-center gap-2"><Users size={18} className="text-[#D4AF37]" /> Gestão de Usuários</h2>
        <p className="text-gray-500 text-xs mt-0.5">{MOCK_USERS.length} usuários cadastrados</p>
      </div>
      <SearchBar />
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[420px]">
        <thead>
          <tr className="bg-black/30 text-gray-500 text-[11px] uppercase">
            <th className="p-3">Usuário</th><th className="p-3">Função</th><th className="p-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {MOCK_USERS.map(u => (
            <tr key={u.id} className="hover:bg-gray-800/30">
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <Avatar name={u.name} />
                  <div className="min-w-0">
                    <p className="text-white font-bold text-xs truncate">{u.name}</p>
                    <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-3"><RoleSelect role={u.role} /></td>
              <td className="p-3">
                <div className="flex gap-2 justify-end">
                  <button className="p-1.5 bg-red-900/20 text-red-400 rounded"><Lock size={12} /></button>
                  <button className="p-1.5 bg-blue-900/20 text-blue-400 rounded"><Key size={12} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Template 9: Lista minimalista com hover reveal
const Template9 = () => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
      <h2 className="text-white font-bold text-lg">Usuários</h2>
      <SearchBar />
    </div>
    <div className="space-y-1">
      {MOCK_USERS.map(u => (
        <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-900 transition-colors group">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-[#D4AF37] font-bold text-xs flex-shrink-0">{u.name.charAt(0)}</div>
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-0">
            <p className="text-white font-bold text-sm truncate">{u.name}</p>
            <p className="text-gray-600 text-xs truncate">{u.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden group-hover:flex items-center gap-2">
              <RoleSelect role={u.role} />
              <button className="text-red-400"><Lock size={13} /></button>
              <button className="text-blue-400"><Key size={13} /></button>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase group-hover:hidden ${roleBadgeColor(u.role)}`}>{roleLabel(u.role)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Template 10: Split lista + detalhe
const Template10 = () => {
  const [sel, setSel] = useState(MOCK_USERS[0]);
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="sm:w-52 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex-shrink-0">
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input className="bg-black border border-gray-700 rounded-lg pl-7 pr-2 py-1.5 text-xs text-white w-full" placeholder="Buscar..." />
          </div>
        </div>
        {MOCK_USERS.map(u => (
          <button key={u.id} onClick={() => setSel(u)} className={`w-full flex items-center gap-2 p-3 text-left hover:bg-gray-800/50 border-b border-gray-800/50 ${sel.id === u.id ? 'bg-[#D4AF37]/10 border-l-2 border-l-[#D4AF37]' : ''}`}>
            <Avatar name={u.name} />
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">{u.name}</p>
              <p className="text-gray-500 text-[10px] truncate">{u.email}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex-1 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-black text-xl">{sel.name.charAt(0)}</div>
          <div>
            <p className="text-white font-bold">{sel.name}</p>
            <p className="text-gray-500 text-xs">{sel.email}</p>
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase mb-1 block">Função</label>
          <select key={sel.id} defaultValue={sel.role} className="bg-black border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full">
            {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </div>
        <div className="flex gap-2 mt-auto">
          <button className="flex-1 flex items-center justify-center gap-2 text-xs bg-red-900/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-900/30 font-bold"><Lock size={13} /> Banir</button>
          <button className="flex-1 flex items-center justify-center gap-2 text-xs bg-blue-900/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-900/30 font-bold"><Key size={13} /> Resetar Senha</button>
        </div>
      </div>
    </div>
  );
};

const TEMPLATES = [
  { id: 1, label: 'Tabela Clássica', component: <Template1 /> },
  { id: 2, label: 'Cards em Grid', component: <Template2 /> },
  { id: 3, label: 'Lista com Badges', component: <Template3 /> },
  { id: 4, label: 'Accordion', component: <Template4 /> },
  { id: 5, label: 'Duas Colunas Compactas', component: <Template5 /> },
  { id: 6, label: 'Cards com Avatar Central', component: <Template6 /> },
  { id: 7, label: 'Lista Mobile-First', component: <Template7 /> },
  { id: 8, label: 'Tabela com Avatar', component: <Template8 /> },
  { id: 9, label: 'Minimalista Dark', component: <Template9 /> },
  { id: 10, label: 'Split Lista + Detalhe', component: <Template10 /> },
];

export const TestePage: React.FC<TestePageProps> = ({ onBack }) => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white mb-1">
            Template <span className="text-[#D4AF37]">Preview</span>
          </h1>
          <p className="text-gray-500 text-sm">10 layouts para a tela de usuários. Clique em "Usar este" para marcar o preferido.</p>
        </div>

        <div className="space-y-6">
          {TEMPLATES.map(t => (
            <div key={t.id} className={`rounded-2xl border-2 transition-all ${selected === t.id ? 'border-[#D4AF37]' : 'border-gray-800'}`}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37] font-black text-sm">#{t.id}</span>
                  <span className="text-white font-bold text-sm">{t.label}</span>
                </div>
                <button
                  onClick={() => setSelected(selected === t.id ? null : t.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${selected === t.id ? 'bg-[#D4AF37] text-black' : 'bg-gray-800 text-gray-300 hover:text-white'}`}
                >
                  {selected === t.id ? <><Check size={12} /> Selecionado</> : 'Usar este'}
                </button>
              </div>
              <div className="p-4">
                {t.component}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl text-center">
            <p className="text-[#D4AF37] font-bold">Template #{selected} — {TEMPLATES.find(t => t.id === selected)?.label} selecionado.</p>
            <p className="text-gray-500 text-xs mt-1">Me diga o número e implemento na página de usuários.</p>
          </div>
        )}
      </div>
    </div>
  );
};
