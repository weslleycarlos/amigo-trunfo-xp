import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, ChevronRight, ArrowLeft, Download, Share2, Eye } from 'lucide-react';
import { generateCardStats } from '../services/geminiService';
import { HoloCard } from './HoloCard';
import { ImageCropper } from './ImageCropper';
import { FormData, CardStats, MARITAL_STATUS_OPTIONS, Rarity } from '../types';
import { toPng } from 'html-to-image';

type PlaygroundStep = 'form' | 'card' | 'admin';

export const CardPlayground: React.FC = () => {
    const [step, setStep] = useState<PlaygroundStep>('form');
    const [loading, setLoading] = useState(false);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [showAdminPrompt, setShowAdminPrompt] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    // Status bar animation state
    const [cpuUsage, setCpuUsage] = useState(2);
    const [memUsage, setMemUsage] = useState(64);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        image: null,
        age: 30,
        maritalStatus: MARITAL_STATUS_OPTIONS[0],
        profession: ''
    });

    const [rarity, setRarity] = useState<Rarity>('common');

    const [cardStats, setCardStats] = useState<CardStats>({
        attributes: [
            { label: "???", value: 0, icon: 'skull' },
            { label: "???", value: 0, icon: 'skull' },
            { label: "???", value: 0, icon: 'skull' },
            { label: "???", value: 0, icon: 'skull' },
            { label: "???", value: 0, icon: 'skull' }
        ],
        specialAbility: 'Aguardando dados...'
    });

    // Status bar animation
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(Math.floor(Math.random() * 15) + 1);
            if (Math.random() > 0.7) {
                setMemUsage(prev => {
                    const change = Math.floor(Math.random() * 5) - 2;
                    return Math.max(60, Math.min(70, prev + change));
                });
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setTempImage(event.target.result as string);
                    setShowCropper(true);
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleCropComplete = (croppedImg: string) => {
        setFormData(prev => ({ ...prev, image: croppedImg }));
        setShowCropper(false);
        setTempImage(null);
    };

    const rollRarity = (): Rarity => {
        const r = Math.random();
        if (r >= 0.99) return 'secret_rare';
        if (r >= 0.95) return 'ultra_rare';
        if (r >= 0.85) return 'rare';
        if (r >= 0.60) return 'uncommon';
        return 'common';
    };

    const generateCard = async () => {
        if (!formData.name || !formData.profession) {
            alert("Preencha todos os campos obrigatórios, parça!");
            return;
        }

        setLoading(true);
        try {
            const rolledRarity = rollRarity();
            setRarity(rolledRarity);

            const stats = await generateCardStats(
                formData.age,
                formData.profession,
                formData.maritalStatus,
                formData.name
            );

            if (['rare', 'ultra_rare', 'secret_rare'].includes(rolledRarity)) {
                stats.attributes = stats.attributes.map(attr => ({
                    ...attr,
                    value: Math.min(100, attr.value + 20)
                }));
            }

            setCardStats(stats);
            setStep('card');
        } catch (error) {
            alert("Erro ao conectar com a Matrix. Tente de novo.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        const element = document.getElementById('holo-card-playground');
        if (!element) return;

        const innerCard = element.firstElementChild as HTMLElement;
        if (!innerCard) return;

        const originalTransform = innerCard.style.transform;
        innerCard.style.transform = 'none';

        try {
            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 3,
                cacheBust: true,
            });

            const link = document.createElement('a');
            link.download = `amigo-trunfo-${formData.name.replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Erro ao salvar imagem:", err);
            alert("Erro ao salvar imagem. Tente printar a tela, é mais roots.");
        } finally {
            innerCard.style.transform = originalTransform;
        }
    };

    const handleShareStories = async () => {
        const element = document.getElementById('holo-card-playground');
        if (!element) return;

        const innerCard = element.firstElementChild as HTMLElement;
        if (!innerCard) return;

        const originalTransform = innerCard.style.transform;
        innerCard.style.transform = 'none';

        try {
            const cardDataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: 2,
                cacheBust: true,
            });

            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1920;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1080, 1920);

            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            for (let i = 0; i < 1920; i += 4) {
                ctx.fillRect(0, i, 1080, 1);
            }

            const cardImg = new Image();
            cardImg.src = cardDataUrl;
            await new Promise((resolve) => { cardImg.onload = resolve; });

            const scale = 2.2;
            const cardWidth = 320 * scale;
            const cardHeight = 480 * scale;
            const cardX = (1080 - cardWidth) / 2;
            const cardY = (1920 - cardHeight) / 2 - 50;

            ctx.drawImage(cardImg, cardX, cardY, cardWidth, cardHeight);

            ctx.font = 'bold 48px Oxanium, sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText('AMIGO TRUNFO', 540, 120);

            ctx.font = '24px Oxanium, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.fillText('Geração XP', 540, 160);

            const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
            const file = new File([blob], `amigo-trunfo-story-${formData.name.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Minha carta Amigo Trunfo',
                        text: 'Confira minha carta do Amigo Trunfo! 🎴'
                    });
                } catch {
                    const link = document.createElement('a');
                    link.download = file.name;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } else {
                const link = document.createElement('a');
                link.download = `amigo-trunfo-story-${formData.name.replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (err) {
            console.error("Erro ao gerar stories:", err);
            alert("Erro ao gerar imagem para stories.");
        } finally {
            innerCard.style.transform = originalTransform;
        }
    };

    const handleAdminLogin = () => {
        if (adminPassword === 'trunfo2024') {
            setShowAdminPrompt(false);
            setStep('admin');
        } else {
            alert('Senha incorreta!');
        }
    };

    const mockFormData: FormData = {
        name: 'Preview Card',
        image: 'https://i.pravatar.cc/300',
        age: 25,
        maritalStatus: 'Solteiro(a)',
        profession: 'Developer'
    };

    const mockStats: CardStats = {
        attributes: [
            { label: "Cafeína", value: 95, icon: 'zap' },
            { label: "Debug", value: 80, icon: 'laptop' },
            { label: "Carisma", value: 70, icon: 'smile' },
            { label: "Criatividade", value: 85, icon: 'brain' },
            { label: "Procrastinação", value: 60, icon: 'ghost' }
        ],
        specialAbility: 'Compila na primeira tentativa'
    };

    return (
        <div className="min-h-[600px] bg-[#2D4566] bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] p-4 rounded-lg relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-500 rounded-full blur-[120px] opacity-20"></div>
            </div>

            <div className="relative z-10">
                {/* Main Window Container */}
                <div className="bg-[#ECE9D8] rounded-lg shadow-2xl border-2 border-[#0054E3] overflow-hidden">
                    {/* Title Bar */}
                    <div className="bg-gradient-to-r from-[#0058EE] via-[#2F82FF] to-[#0054E3] px-3 py-2 flex justify-between items-center shadow-md">
                        <div className="flex items-center gap-2">
                            <img src="https://cdn-icons-png.flaticon.com/128/888/888865.png" alt="icon" className="w-5 h-5 drop-shadow" />
                            <h1 className="text-white font-bold text-shadow-sm font-digital tracking-wide">
                                Amigo Trunfo: Modo Diversão <span className="text-xs font-normal opacity-80 ml-2">v1999.exe</span>
                            </h1>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setShowAdminPrompt(true)}
                                className="w-5 h-5 bg-yellow-400 border border-yellow-600 rounded shadow-inner flex items-center justify-center text-yellow-800 text-xs cursor-pointer hover:bg-yellow-300"
                            >
                                ⚙
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 bg-[#ECE9D8]">
                        {step === 'form' && (
                            <div className="animate-fade-in flex flex-col md:flex-row gap-8">
                                {/* Left Column: Form */}
                                <div className="flex-1 space-y-4">
                                    <div className="bg-white p-4 border-2 border-[#ACA899] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded">
                                        <h2 className="font-digital font-bold text-[#0054E3] mb-4 flex items-center gap-2 border-b border-[#ACA899] pb-1">
                                            <RefreshCw size={16} /> Configuração do Perfil
                                        </h2>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 font-bold">Nick / Nome (máx. 12)</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    maxLength={12}
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-[#7F9DB9] px-2 py-1 focus:outline-none focus:border-[#E59700] text-sm text-black"
                                                    placeholder="Ex: Pedrinho"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1 font-bold">Idade (Lvl)</label>
                                                    <input
                                                        type="number"
                                                        name="age"
                                                        value={formData.age}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-[#7F9DB9] px-2 py-1 focus:outline-none focus:border-[#E59700] text-sm text-black"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1 font-bold">Estado Civil</label>
                                                    <select
                                                        name="maritalStatus"
                                                        value={formData.maritalStatus}
                                                        onChange={handleInputChange}
                                                        className="w-full border border-[#7F9DB9] px-2 py-1 focus:outline-none focus:border-[#E59700] text-sm bg-white text-black"
                                                    >
                                                        {MARITAL_STATUS_OPTIONS.map(opt => (
                                                            <option key={opt} value={opt}>{opt}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-gray-600 mb-1 font-bold">Profissão / Hobby Principal</label>
                                                <input
                                                    type="text"
                                                    name="profession"
                                                    maxLength={20}
                                                    value={formData.profession}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-[#7F9DB9] px-2 py-1 focus:outline-none focus:border-[#E59700] text-sm text-black"
                                                    placeholder="Ex: Designer Sobrevivente"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 border-2 border-[#ACA899] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)] rounded flex flex-col items-center justify-center min-h-[160px]">
                                        {formData.image ? (
                                            <div className="relative group">
                                                <img src={formData.image} alt="Preview" className="w-32 h-40 object-cover border-2 border-gray-300 shadow-md" />
                                                <button
                                                    onClick={() => setFormData(p => ({ ...p, image: null }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center gap-2 group">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400 group-hover:border-[#0054E3] transition-colors">
                                                    <Camera className="text-gray-400 group-hover:text-[#0054E3]" />
                                                </div>
                                                <span className="text-xs text-[#0054E3] underline group-hover:text-[#E59700]">Carregar Foto (JPG/PNG)</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Right Column: Action */}
                                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600 max-w-xs">
                                        <p className="font-bold mb-1">ℹ️ Modo Diversão</p>
                                        <p>Crie cartas para zoar os amigos! Essas cartas não são salvas no banco de dados.</p>
                                    </div>

                                    <button
                                        onClick={generateCard}
                                        disabled={loading || !formData.image}
                                        className={`
                      relative overflow-hidden px-8 py-3 rounded-md font-pixel text-xs font-bold text-white shadow-lg transition-all
                      ${loading || !formData.image ? 'bg-gray-400 cursor-not-allowed grayscale' : 'bg-gradient-to-b from-[#3A9E2D] to-[#2B7A1F] hover:brightness-110 active:scale-95 border-2 border-[#1E5716]'}
                    `}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <RefreshCw className="animate-spin" size={14} /> Processando...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                GERAR TRUNFO <ChevronRight size={14} />
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'card' && (
                            <div className="animate-fade-in flex flex-col items-center">
                                <div className="mb-6 scale-100 md:scale-110 transition-transform">
                                    <div id="holo-card-playground">
                                        <HoloCard data={formData} stats={cardStats} rarity={rarity} />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mt-4 justify-center">
                                    <button
                                        onClick={() => setStep('form')}
                                        className="px-4 py-2 bg-gray-200 border border-gray-400 rounded shadow hover:bg-gray-300 text-gray-700 font-digital font-bold text-sm flex items-center gap-2"
                                    >
                                        <ArrowLeft size={16} /> Voltar
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-4 py-2 bg-[#0054E3] border border-[#003692] rounded shadow hover:bg-[#0064FF] text-white font-digital font-bold text-sm flex items-center gap-2 active:translate-y-0.5"
                                    >
                                        <Download size={16} /> Salvar Imagem
                                    </button>
                                    <button
                                        onClick={handleShareStories}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 border border-purple-700 rounded shadow hover:brightness-110 text-white font-digital font-bold text-sm flex items-center gap-2 active:translate-y-0.5"
                                    >
                                        <Share2 size={16} /> Stories
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'admin' && (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-digital font-bold text-gray-800 flex items-center gap-2">
                                        <Eye size={20} /> Admin Preview - Todas as Raridades
                                    </h2>
                                    <button
                                        onClick={() => setStep('form')}
                                        className="px-3 py-1 bg-gray-200 border border-gray-400 rounded shadow hover:bg-gray-300 text-gray-700 font-digital text-sm flex items-center gap-2"
                                    >
                                        <ArrowLeft size={14} /> Voltar
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
                                    {(['common', 'uncommon', 'rare', 'ultra_rare', 'secret_rare', 'founder'] as Rarity[]).map((r) => (
                                        <div key={r} className="flex flex-col items-center">
                                            <span className="text-xs font-pixel mb-2 text-gray-600 uppercase">{r.replace('_', ' ')}</span>
                                            <div className="transform scale-75 origin-top">
                                                <HoloCard data={mockFormData} stats={mockStats} rarity={r} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Bar */}
                    <div className="bg-[#ECE9D8] border-t border-[#ACA899] px-2 py-0.5 flex justify-between items-center text-[10px] text-gray-600 font-sans shadow-inner">
                        <div className="flex items-center gap-2">
                            <span>Pronto</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-3 bg-white border border-gray-400 relative shadow-inner">
                                <div
                                    className="h-full bg-[#0054E3] transition-all duration-500"
                                    style={{ width: `${cpuUsage * 3}%` }}
                                />
                            </div>
                            <span>Memória: {memUsage}MB / CPU: {cpuUsage}%</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/50 text-[10px] mt-4 font-pixel">
                    © 1999-2024 Amigo Trunfo Corp. All rights reserved.
                </p>
            </div>

            {/* Admin Password Modal */}
            {showAdminPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#ECE9D8] p-1 rounded-lg shadow-2xl border-2 border-[#0054E3] w-full max-w-sm">
                        <div className="bg-gradient-to-r from-[#0058EE] via-[#2F82FF] to-[#0054E3] px-2 py-1 flex justify-between items-center rounded-t mb-1">
                            <span className="text-white font-bold text-sm font-sans drop-shadow-md">🔒 Admin Access</span>
                            <button
                                onClick={() => setShowAdminPrompt(false)}
                                className="bg-[#D84631] hover:bg-[#E85641] text-white w-5 h-5 flex items-center justify-center rounded border border-white text-xs shadow-inner"
                            >
                                X
                            </button>
                        </div>
                        <div className="p-4 bg-white border-2 border-[#ACA899]">
                            <p className="text-sm text-gray-600 mb-3">Digite a senha de admin:</p>
                            <input
                                type="password"
                                value={adminPassword}
                                onChange={(e) => setAdminPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                                className="w-full border border-[#7F9DB9] px-2 py-2 mb-3 focus:outline-none focus:border-[#E59700] text-sm text-black"
                                placeholder="Senha..."
                                autoFocus
                            />
                            <button
                                onClick={handleAdminLogin}
                                className="w-full px-4 py-2 bg-[#0054E3] border border-[#003692] rounded shadow hover:bg-[#0064FF] text-white font-digital font-bold text-sm"
                            >
                                Entrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Cropper */}
            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onCancel={() => { setShowCropper(false); setTempImage(null); }}
                    onCropComplete={handleCropComplete}
                />
            )}
        </div>
    );
};
