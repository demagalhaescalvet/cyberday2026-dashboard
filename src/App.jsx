import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Resumen from './components/Resumen';
import MixIdeal from './components/MixIdeal';
import BandasCuotas from './components/BandasCuotas';
import Elasticidad from './components/Elasticidad';
import AuditoriaPrecios from './components/AuditoriaPrecios';

const tabs = [
  { id: 'resumen', label: 'Resumen', icon: '📊', sublabel: '2024 vs 2025' },
  { id: 'mix', label: 'Mix Ideal', icon: '🎯', sublabel: 'Target 2026' },
  { id: 'bandas', label: 'Bandas & Cuotas', icon: '💳', sublabel: 'Precios con IVA' },
  { id: 'elasticidad', label: 'Elasticidad', icon: '📈', sublabel: 'Precio-Demanda' },
  { id: 'audit', label: 'Auditoría Precios', icon: '🔍', sublabel: 'Competitividad' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('resumen');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto p-6">
        {activeTab === 'resumen' && <Resumen />}
        {activeTab === 'mix' && <MixIdeal />}
        {activeTab === 'bandas' && <BandasCuotas />}
        {activeTab === 'elasticidad' && <Elasticidad />}
        {activeTab === 'audit' && <AuditoriaPrecios />}
      </main>
    </div>
  );
}
