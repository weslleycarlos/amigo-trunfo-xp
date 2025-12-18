import React, { useState, useEffect } from 'react';
import { Package, Sparkles, X, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HoloCard } from './HoloCard';
import type { FormData, CardStats, Rarity, IconType } from '../types';

interface PackOpeningProps {
    userId: string;
    packsAvailable: number;
    onPackOpened: () => void;
    onClose: () => void;
}

interface CardFromDB {
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

type OpeningPhase = 'ready' | 'shaking' | 'opening' | 'revealing' | 'done';

export const PackOpening: React.FC<PackOpeningProps> = ({
    userId,
    packsAvailable,
    onPackOpened,
    onClose
}) => {
    const [phase, setPhase] = useState<OpeningPhase>('ready');
    const [cards, setCards] = useState<CardFromDB[]>([]);
    const [revealedIndex, setRevealedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openPack = async () => {
        if (packsAvailable <= 0) return;

        setLoading(true);
        setError(null);
        setPhase('shaking');

        try {
            // 1. Get random cards from the pool (excluding user's avatar cards)
            const { data: randomCards, error: cardsError } = await supabase
                .from('cards')
                .select('*')
                .eq('is_npc', true)
                .limit(10);

            if (cardsError) throw cardsError;
            if (!randomCards || randomCards.length === 0) {
                throw new Error('Nenhuma carta disponível no pool');
            }

            // Shuffle and pick 3
            const shuffled = randomCards.sort(() => Math.random() - 0.5);
            const selectedCards = shuffled.slice(0, Math.min(3, shuffled.length));

            // 2. Animation sequence
            await new Promise(r => setTimeout(r, 1500)); // Shaking
            setPhase('opening');
            await new Promise(r => setTimeout(r, 1000)); // Opening

            setCards(selectedCards);
            setRevealedIndex(0); // Start with first card revealed
            setPhase('revealing');

            // 3. Save cards to user_cards
            for (const card of selectedCards) {
                await supabase.from('user_cards').insert({
                    user_id: userId,
                    card_id: card.id,
                    is_avatar: false
                });
            }

            // 4. Decrement packs_available
            await supabase
                .from('profiles')
                .update({ packs_available: packsAvailable - 1 })
                .eq('id', userId);

        } catch (err: any) {
            console.error('Error opening pack:', err);
            setError(err.message || 'Erro ao abrir pack');
            setPhase('ready');
        } finally {
            setLoading(false);
        }
    };

    const revealNext = () => {
        if (revealedIndex < cards.length - 1) {
            setRevealedIndex(prev => prev + 1);
        } else {
            setPhase('done');
        }
    };

    const finish = () => {
        onPackOpened();
        onClose();
    };

    const convertToFormData = (card: CardFromDB): FormData => ({
        name: card.name,
        image: card.image_url,
        imageUrl: card.image_url,
        age: 25,
        maritalStatus: 'NPC',
        profession: card.profession
    });

    const convertToStats = (card: CardFromDB): CardStats => ({
        attributes: [
            { label: 'Energia', value: card.attr_0, icon: 'zap' as IconType },
            { label: 'Estilo', value: card.attr_1, icon: 'smile' as IconType },
            { label: 'Audácia', value: card.attr_2, icon: 'rocket' as IconType },
            { label: 'Social', value: card.attr_3, icon: 'heart' as IconType },
            { label: 'Skill', value: card.attr_4, icon: 'laptop' as IconType }
        ],
        specialAbility: card.special_ability
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white transition"
            >
                <X size={24} />
            </button>

            <div className="text-center max-w-4xl w-full px-4">
                {/* Ready Phase */}
                {phase === 'ready' && (
                    <div className="animate-fade-in">
                        <div className="relative inline-block mb-8">
                            {/* Pack Image */}
                            <div className="w-48 h-64 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                                <Package className="w-20 h-20 text-white drop-shadow-lg relative z-10" />
                                <Sparkles className="absolute top-4 right-4 w-6 h-6 text-yellow-200 animate-pulse" />
                                <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-yellow-200 animate-pulse" />
                            </div>

                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 blur-3xl -z-10 scale-150"></div>
                        </div>

                        <h2 className="text-3xl font-bold text-yellow-400 font-digital mb-4">
                            Pack de Cartas
                        </h2>
                        <p className="text-gray-400 mb-2">Você tem {packsAvailable} pack(s) disponíveis</p>
                        <p className="text-gray-500 text-sm mb-8">Cada pack contém 3 cartas aleatórias!</p>

                        {error && (
                            <p className="text-red-400 mb-4">{error}</p>
                        )}

                        <button
                            onClick={openPack}
                            disabled={packsAvailable <= 0 || loading}
                            className={`px-8 py-4 font-bold text-lg rounded-lg shadow-lg transition-all font-digital ${packsAvailable > 0 && !loading
                                ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:scale-105 hover:shadow-xl'
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Abrindo...' : 'Abrir Pack!'}
                        </button>
                    </div>
                )}

                {/* Shaking Phase */}
                {phase === 'shaking' && (
                    <div className="animate-fade-in">
                        <div className="w-48 h-64 mx-auto bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden animate-shake">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                            <Package className="w-20 h-20 text-white drop-shadow-lg relative z-10" />

                            {/* Particles */}
                            {[...Array(20)].map((_, i) => (
                                <Sparkles
                                    key={i}
                                    className="absolute text-yellow-200 animate-ping"
                                    style={{
                                        top: `${Math.random() * 100}%`,
                                        left: `${Math.random() * 100}%`,
                                        width: `${8 + Math.random() * 16}px`,
                                        animationDelay: `${Math.random() * 0.5}s`
                                    }}
                                />
                            ))}
                        </div>

                        <p className="text-2xl font-bold text-yellow-400 font-digital mt-8 animate-pulse">
                            Preparando...
                        </p>
                    </div>
                )}

                {/* Opening Phase */}
                {phase === 'opening' && (
                    <div className="animate-fade-in">
                        <div className="w-48 h-64 mx-auto bg-gradient-to-br from-white via-yellow-100 to-yellow-300 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden animate-pulse">
                            <div className="absolute inset-0 bg-white/50"></div>
                            <Sparkles className="w-24 h-24 text-yellow-500 animate-spin relative z-10" />
                        </div>

                        {/* Light burst */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-96 h-96 bg-gradient-radial from-yellow-400/50 via-transparent to-transparent rounded-full animate-ping"></div>
                        </div>

                        <p className="text-2xl font-bold text-white font-digital mt-8">
                            ✨ Revelando! ✨
                        </p>
                    </div>
                )}

                {/* Revealing Phase */}
                {phase === 'revealing' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold text-yellow-400 font-digital mb-6">
                            Carta {revealedIndex + 1} de {cards.length}
                        </h2>

                        <div className="flex justify-center items-center gap-8 mb-8">
                            {cards.map((card, index) => (
                                <div
                                    key={card.id}
                                    className={`transition-all duration-500 ${index <= revealedIndex
                                        ? 'opacity-100 scale-100'
                                        : 'opacity-0 scale-50 pointer-events-none absolute'
                                        }`}
                                >
                                    {index <= revealedIndex && (
                                        <div className="transform hover:scale-105 transition-transform">
                                            <HoloCard
                                                data={convertToFormData(card)}
                                                stats={convertToStats(card)}
                                                rarity={card.rarity}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={revealNext}
                            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-all font-digital flex items-center gap-2 mx-auto"
                        >
                            {revealedIndex < cards.length - 1 ? (
                                <>Próxima Carta <ChevronRight size={20} /></>
                            ) : (
                                <>Concluir <Sparkles size={20} /></>
                            )}
                        </button>
                    </div>
                )}

                {/* Done Phase */}
                {phase === 'done' && (
                    <div className="animate-fade-in">
                        <h2 className="text-3xl font-bold text-yellow-400 font-digital mb-4">
                            🎉 Pack Aberto! 🎉
                        </h2>
                        <p className="text-gray-400 mb-8">
                            Você obteve {cards.length} novas cartas para sua coleção!
                        </p>

                        <div className="flex justify-center items-center gap-4 mb-8 flex-wrap">
                            {cards.map((card) => (
                                <div key={card.id} className="transform scale-75">
                                    <HoloCard
                                        data={convertToFormData(card)}
                                        stats={convertToStats(card)}
                                        rarity={card.rarity}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={finish}
                            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg shadow-lg hover:scale-105 transition-all font-digital"
                        >
                            Voltar ao Menu
                        </button>
                    </div>
                )}
            </div>

            {/* CSS for animations */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          10% { transform: translateX(-5px) rotate(-2deg); }
          20% { transform: translateX(5px) rotate(2deg); }
          30% { transform: translateX(-5px) rotate(-2deg); }
          40% { transform: translateX(5px) rotate(2deg); }
          50% { transform: translateX(-5px) rotate(-2deg); }
          60% { transform: translateX(5px) rotate(2deg); }
          70% { transform: translateX(-5px) rotate(-2deg); }
          80% { transform: translateX(5px) rotate(2deg); }
          90% { transform: translateX(-3px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
        </div>
    );
};
