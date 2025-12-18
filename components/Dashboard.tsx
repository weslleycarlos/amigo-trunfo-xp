import React, { useState, useEffect } from 'react';
import { User, Package, Swords, Trophy, LogOut, Star, Sparkles, Wand2, Download, Share2, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getLevelFromXp, getLevelProgress, getXpToNextLevel } from '../lib/levelSystem';
import { HoloCard } from './HoloCard';
import { CardPlayground } from './CardPlayground';
import { PackOpening } from './PackOpening';
import { BattleScreen } from './BattleScreen';
import { toPng } from 'html-to-image';
import type { FormData, CardStats, Rarity } from '../types';

interface DashboardProps {
    userId: string;
    userEmail: string;
    onSignOut: () => void;
}

interface UserProfile {
    username: string;
    xp: number;
    level: string;
    packs_available: number;
}

interface AvatarCard {
    id: string;
    name: string;
    image_url: string;
    profession: string;
    category: string;
    rarity: Rarity;
    attr_0: number;
    attr_1: number;
    attr_2: number;
    attr_3: number;
    attr_4: number;
    special_ability: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, userEmail, onSignOut }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [avatarCard, setAvatarCard] = useState<AvatarCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'home' | 'collection' | 'battle' | 'create'>('home');
    const [showPackOpening, setShowPackOpening] = useState(false);
    const [showBattle, setShowBattle] = useState(false);
    const [userCards, setUserCards] = useState<AvatarCard[]>([]);

    useEffect(() => {
        loadUserData();
    }, [userId]);

    const loadUserData = async () => {
        try {
            // Load profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('username, xp, level, packs_available')
                .eq('id', userId)
                .single();

            if (profileData) {
                setProfile(profileData);
            }

            // Load avatar card
            const { data: userCardData } = await supabase
                .from('user_cards')
                .select('card_id')
                .eq('user_id', userId)
                .eq('is_avatar', true)
                .single();

            if (userCardData) {
                const { data: cardData } = await supabase
                    .from('cards')
                    .select('*')
                    .eq('id', userCardData.card_id)
                    .single();

                if (cardData) {
                    setAvatarCard(cardData);
                }
            }

            // Load all user cards (collection)
            const { data: allUserCards } = await supabase
                .from('user_cards')
                .select('card_id, is_avatar')
                .eq('user_id', userId);

            if (allUserCards && allUserCards.length > 0) {
                const cardIds = allUserCards.map(uc => uc.card_id);
                const { data: allCards } = await supabase
                    .from('cards')
                    .select('*')
                    .in('id', cardIds);

                if (allCards) {
                    setUserCards(allCards);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Convert DB card to component format
    const getFormData = (): FormData => ({
        name: avatarCard?.name || '',
        image: avatarCard?.image_url || null,
        imageUrl: avatarCard?.image_url || '',
        age: 25,
        maritalStatus: 'Solteiro(a)',
        profession: avatarCard?.profession || ''
    });

    const getStats = (): CardStats => ({
        attributes: [
            { label: 'Energia', value: avatarCard?.attr_0 || 50, icon: 'zap' },
            { label: 'Estilo', value: avatarCard?.attr_1 || 50, icon: 'smile' },
            { label: 'Audácia', value: avatarCard?.attr_2 || 50, icon: 'rocket' },
            { label: 'Social', value: avatarCard?.attr_3 || 50, icon: 'heart' },
            { label: 'Skill', value: avatarCard?.attr_4 || 50, icon: 'laptop' }
        ],
        specialAbility: avatarCard?.special_ability || 'Nenhuma'
    });

    const handleDownload = async () => {
        const element = document.getElementById('avatar-card');
        if (!element) return;

        const innerCard = element.firstElementChild as HTMLElement;
        if (!innerCard) return;

        const originalTransform = innerCard.style.transform;
        innerCard.style.transform = 'none';

        try {
            // Detect mobile
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            const dataUrl = await toPng(element, {
                quality: 1,
                pixelRatio: isMobile ? 2 : 3, // Lower resolution on mobile
                cacheBust: true,
                // Fix for mobile cross-origin images
                fetchRequestInit: {
                    mode: 'cors',
                    cache: 'no-cache',
                },
                // Skip fonts that may cause issues on mobile
                skipFonts: isMobile,
                // Include inline styles
                includeQueryParams: true,
            });

            // For mobile, try to use share API or fallback to download
            if (isMobile && navigator.share) {
                try {
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    const file = new File([blob], `carta-mestre-${avatarCard?.name || 'fundador'}.png`, { type: 'image/png' });

                    await navigator.share({
                        files: [file],
                        title: 'Minha Carta Mestre',
                        text: 'Confira minha carta no Amigo Trunfo XP!'
                    });
                } catch (shareErr) {
                    // Fallback to regular download if share fails
                    const link = document.createElement('a');
                    link.download = `carta-mestre-${avatarCard?.name || 'fundador'}.png`;
                    link.href = dataUrl;
                    link.click();
                }
            } else {
                const link = document.createElement('a');
                link.download = `carta-mestre-${avatarCard?.name || 'fundador'}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error('Erro ao salvar imagem:', err);
            alert('Erro ao salvar imagem. Tente usar a função de screenshot do seu celular.');
        } finally {
            innerCard.style.transform = originalTransform;
        }
    };

    const handleShareStories = async () => {
        const element = document.getElementById('avatar-card');
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
            ctx.fillText('Carta Mestre - Fundador', 540, 160);

            const blob = await (await fetch(canvas.toDataURL('image/png'))).blob();
            const file = new File([blob], `carta-mestre-${avatarCard?.name || 'fundador'}-story.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Minha Carta Mestre',
                        text: 'Confira minha Carta Mestre do Amigo Trunfo! ⭐'
                    });
                } catch {
                    const link = document.createElement('a');
                    link.download = file.name;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                }
            } else {
                const link = document.createElement('a');
                link.download = file.name;
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (err) {
            console.error('Erro ao gerar stories:', err);
            alert('Erro ao gerar imagem para stories.');
        } finally {
            innerCard.style.transform = originalTransform;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#245EDC] to-[#3B7DD8] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white font-digital">Carregando seu perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-gradient-to-b from-[#245EDC] to-[#3B7DD8]">
            {/* Header - Windows XP Style */}
            <header className="bg-gradient-to-r from-[#0058EE] via-[#2F82FF] to-[#0054E3] px-4 py-3 shadow-lg">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="https://cdn-icons-png.flaticon.com/128/888/888865.png" alt="icon" className="w-8 h-8 drop-shadow" />
                        <div>
                            <h1 className="text-xl font-bold text-white font-digital drop-shadow">Amigo Trunfo XP</h1>
                            <p className="text-xs text-blue-200">Geração XP</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User Info with Level */}
                        <div className="text-right">
                            <p className="text-white font-digital text-sm drop-shadow">{profile?.username || 'Jogador'}</p>
                            <div className="flex items-center gap-2 justify-end">
                                <span
                                    className="text-xs font-bold px-2 py-0.5 rounded"
                                    style={{
                                        backgroundColor: getLevelFromXp(profile?.xp || 0).color,
                                        color: 'white',
                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {getLevelFromXp(profile?.xp || 0).icon} Lv.{getLevelFromXp(profile?.xp || 0).level}
                                </span>
                                <span className="text-xs text-blue-200">{profile?.xp || 0} XP</span>
                            </div>
                        </div>

                        {/* Sign Out */}
                        <button
                            onClick={onSignOut}
                            className="px-3 py-1.5 bg-gradient-to-b from-[#FFB8B8] to-[#E07070] border border-red-500 text-red-800 rounded text-sm font-bold hover:brightness-110 transition flex items-center gap-1"
                        >
                            <LogOut size={14} />
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs - XP Style */}
            <nav className="bg-[#ECE9D8] border-b-2 border-[#ACA899] shadow-inner">
                <div className="max-w-6xl mx-auto flex">
                    <button
                        onClick={() => setActiveTab('home')}
                        className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-digital text-sm transition border-r border-[#ACA899] ${activeTab === 'home'
                            ? 'bg-white text-[#0054E3] font-bold shadow-inner'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <User size={16} />
                        Meu Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('collection')}
                        className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-digital text-sm transition border-r border-[#ACA899] ${activeTab === 'collection'
                            ? 'bg-white text-[#0054E3] font-bold shadow-inner'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Package size={16} />
                        Packs ({profile?.packs_available || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('battle')}
                        className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-digital text-sm transition border-r border-[#ACA899] ${activeTab === 'battle'
                            ? 'bg-white text-[#0054E3] font-bold shadow-inner'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Swords size={16} />
                        Batalhar
                    </button>
                    <button
                        onClick={() => setActiveTab('create')}
                        className={`flex-1 py-2 px-4 flex items-center justify-center gap-2 font-digital text-sm transition ${activeTab === 'create'
                            ? 'bg-white text-[#0054E3] font-bold shadow-inner'
                            : 'text-gray-700 hover:bg-white/50'
                            }`}
                    >
                        <Wand2 size={16} />
                        Criar Carta
                    </button>
                </div>
            </nav>

            {/* Main Content - XP Window Style */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-4 pb-8">
                    {/* Home Tab - Show Avatar Card */}
                    {activeTab === 'home' && avatarCard && (
                        <div className="flex flex-col items-center">
                            <div className="text-center mb-6">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-white" />
                                    <h2 className="text-2xl font-bold text-white font-digital drop-shadow">Sua Carta Mestre</h2>
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-blue-200 text-sm">Carta exclusiva de Fundador</p>
                            </div>

                            <div id="avatar-card" className="transform hover:scale-105 transition-transform duration-300">
                                <HoloCard
                                    data={getFormData()}
                                    stats={getStats()}
                                    rarity={(avatarCard.rarity as Rarity) || 'founder'}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#78C257] to-[#4E9A2F] border-2 border-[#3A7A1F] hover:brightness-110 text-white font-bold font-digital rounded shadow transition"
                                >
                                    <Download size={16} />
                                    Baixar
                                </button>
                                <button
                                    onClick={handleShareStories}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 border border-purple-700 hover:brightness-110 text-white font-bold font-digital rounded shadow transition"
                                >
                                    <Share2 size={16} />
                                    Stories
                                </button>
                            </div>

                            {/* Stats Summary */}
                            <div className="mt-8 bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-4 w-full max-w-md shadow">
                                <h3 className="text-[#0054E3] font-digital mb-3 flex items-center gap-2 font-bold">
                                    <Star className="w-4 h-4" />
                                    Estatísticas
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="text-gray-600">Cartas na coleção:</div>
                                    <div className="text-gray-800 font-bold">{userCards.length}</div>
                                    <div className="text-gray-600">Packs disponíveis:</div>
                                    <div className="text-gray-800 font-bold">{profile?.packs_available || 0}</div>
                                </div>

                                {/* Level Progress */}
                                <div className="mt-4 pt-4 border-t border-[#ACA899]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className="text-sm font-bold px-2 py-1 rounded"
                                            style={{
                                                backgroundColor: getLevelFromXp(profile?.xp || 0).color,
                                                color: 'white'
                                            }}
                                        >
                                            {getLevelFromXp(profile?.xp || 0).icon} {getLevelFromXp(profile?.xp || 0).title}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {getXpToNextLevel(profile?.xp || 0) > 0
                                                ? `${getXpToNextLevel(profile?.xp || 0)} XP para próximo nível`
                                                : 'Nível máximo!'
                                            }
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3">
                                        <div
                                            className="h-3 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${getLevelProgress(profile?.xp || 0)}%`,
                                                backgroundColor: getLevelFromXp(profile?.xp || 0).color
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-center text-gray-500 mt-1">
                                        {profile?.xp || 0} XP Total
                                    </p>
                                </div>
                            </div>

                            {/* Card Collection */}
                            {userCards.length > 1 && (
                                <div className="mt-8 w-full">
                                    <h3 className="text-white font-digital mb-4 flex items-center gap-2 justify-center drop-shadow">
                                        <Layers className="w-5 h-5" />
                                        Sua Coleção ({userCards.length} cartas)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                        {userCards.map((card) => (
                                            <div key={card.id} className="transform scale-75 origin-top hover:scale-80 transition-transform">
                                                <HoloCard
                                                    data={{
                                                        name: card.name,
                                                        image: card.image_url,
                                                        imageUrl: card.image_url,
                                                        age: 25,
                                                        maritalStatus: 'NPC',
                                                        profession: card.profession
                                                    }}
                                                    stats={{
                                                        attributes: [
                                                            { label: 'Energia', value: card.attr_0, icon: 'zap' },
                                                            { label: 'Estilo', value: card.attr_1, icon: 'smile' },
                                                            { label: 'Audácia', value: card.attr_2, icon: 'rocket' },
                                                            { label: 'Social', value: card.attr_3, icon: 'heart' },
                                                            { label: 'Skill', value: card.attr_4, icon: 'laptop' }
                                                        ],
                                                        specialAbility: card.special_ability
                                                    }}
                                                    rarity={card.rarity}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Packs Tab */}
                    {activeTab === 'collection' && (
                        <div className="text-center py-12">
                            <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-8 max-w-md mx-auto shadow-lg">
                                <Package className="w-24 h-24 mx-auto text-[#0054E3] mb-4" />
                                <h2 className="text-2xl font-bold text-[#0054E3] font-digital mb-2">Abrir Packs</h2>
                                <p className="text-gray-600 mb-6">Você tem {profile?.packs_available || 0} packs disponíveis</p>

                                {(profile?.packs_available || 0) > 0 ? (
                                    <button
                                        onClick={() => setShowPackOpening(true)}
                                        className="px-8 py-4 bg-gradient-to-b from-[#78C257] to-[#4E9A2F] border-2 border-[#3A7A1F] text-white font-bold text-lg rounded shadow-lg hover:brightness-110 transition font-digital"
                                    >
                                        🎁 Abrir Pack (3 cartas)
                                    </button>
                                ) : (
                                    <p className="text-gray-500">Volte amanhã para mais packs!</p>
                                )}

                                <p className="text-xs text-gray-500 mt-4">Cada pack contém 3 cartas aleatórias de NPCs famosos!</p>
                            </div>
                        </div>
                    )}

                    {/* Battle Tab */}
                    {activeTab === 'battle' && (
                        <div className="text-center py-12">
                            <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-8 max-w-md mx-auto shadow-lg">
                                <Swords className="w-24 h-24 mx-auto text-[#0054E3] mb-4" />
                                <h2 className="text-2xl font-bold text-[#0054E3] font-digital mb-2">Arena de Batalha</h2>
                                <p className="text-gray-600 mb-6">Desafie NPCs famosos e ganhe XP!</p>

                                {userCards.length > 0 ? (
                                    <button
                                        onClick={() => setShowBattle(true)}
                                        className="px-8 py-4 bg-gradient-to-b from-[#FF6B35] to-[#E05020] border-2 border-[#B03010] text-white font-bold text-lg rounded shadow-lg hover:brightness-110 transition font-digital"
                                    >
                                        ⚔️ Iniciar Batalha
                                    </button>
                                ) : (
                                    <p className="text-gray-500">Você precisa de cartas para batalhar. Abra packs primeiro!</p>
                                )}

                                <p className="text-xs text-gray-500 mt-4">Cartas na coleção: {userCards.length}</p>
                            </div>
                        </div>
                    )}

                    {/* Create Card Tab - Playground */}
                    {activeTab === 'create' && (
                        <CardPlayground />
                    )}
                </div>
            </main>

            {/* Pack Opening Modal */}
            {showPackOpening && (
                <PackOpening
                    userId={userId}
                    packsAvailable={profile?.packs_available || 0}
                    onPackOpened={() => {
                        loadUserData(); // Reload profile data
                    }}
                    onClose={() => setShowPackOpening(false)}
                />
            )}

            {/* Battle Screen Modal */}
            {showBattle && (
                <BattleScreen
                    userId={userId}
                    onClose={() => setShowBattle(false)}
                    onBattleEnd={(won, xpGained) => {
                        loadUserData(); // Reload to update XP
                        console.log(`Battle ended: ${won ? 'Won' : 'Lost'}, XP: ${xpGained}`);
                    }}
                />
            )}
        </div>
    );
};
