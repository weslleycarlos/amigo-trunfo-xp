import React, { useState, useEffect } from 'react';
import { Swords, Trophy, X, ChevronRight, Zap, Smile, Rocket, Heart, Laptop, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HoloCard } from './HoloCard';
import type { FormData, CardStats, Rarity, IconType } from '../types';

interface BattleScreenProps {
    userId: string;
    onClose: () => void;
    onBattleEnd: (won: boolean, xpGained: number) => void;
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

type BattlePhase = 'select' | 'opponent' | 'choose_attr' | 'compare' | 'result';

const ATTRIBUTES = [
    { index: 0, label: 'Energia', icon: Zap, color: '#FFD700' },
    { index: 1, label: 'Estilo', icon: Smile, color: '#FF69B4' },
    { index: 2, label: 'Audácia', icon: Rocket, color: '#FF4500' },
    { index: 3, label: 'Social', icon: Heart, color: '#FF1493' },
    { index: 4, label: 'Skill', icon: Laptop, color: '#00CED1' },
];

export const BattleScreen: React.FC<BattleScreenProps> = ({ userId, onClose, onBattleEnd }) => {
    const [phase, setPhase] = useState<BattlePhase>('select');
    const [userCards, setUserCards] = useState<CardFromDB[]>([]);
    const [selectedCard, setSelectedCard] = useState<CardFromDB | null>(null);
    const [opponentCard, setOpponentCard] = useState<CardFromDB | null>(null);
    const [selectedAttr, setSelectedAttr] = useState<number | null>(null);
    const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user's cards
    useEffect(() => {
        loadUserCards();
    }, [userId]);

    const loadUserCards = async () => {
        try {
            const { data: userCardLinks } = await supabase
                .from('user_cards')
                .select('card_id')
                .eq('user_id', userId);

            if (userCardLinks && userCardLinks.length > 0) {
                const cardIds = userCardLinks.map(uc => uc.card_id);
                const { data: cards } = await supabase
                    .from('cards')
                    .select('*')
                    .in('id', cardIds);

                if (cards) {
                    setUserCards(cards);
                }
            }
        } catch (error) {
            console.error('Error loading cards:', error);
        } finally {
            setLoading(false);
        }
    };

    const selectCard = (card: CardFromDB) => {
        setSelectedCard(card);
        setPhase('opponent');
        loadOpponent();
    };

    const loadOpponent = async () => {
        try {
            // Get random NPC card
            const { data: npcs } = await supabase
                .from('cards')
                .select('*')
                .eq('is_npc', true);

            if (npcs && npcs.length > 0) {
                const randomNpc = npcs[Math.floor(Math.random() * npcs.length)];
                
                // Small delay for dramatic effect
                await new Promise(r => setTimeout(r, 1500));
                
                setOpponentCard(randomNpc);
                setPhase('choose_attr');
            }
        } catch (error) {
            console.error('Error loading opponent:', error);
        }
    };

    const selectAttribute = async (attrIndex: number) => {
        setSelectedAttr(attrIndex);
        setPhase('compare');

        // Dramatic pause
        await new Promise(r => setTimeout(r, 2000));

        // Compare values
        const userValue = getAttrValue(selectedCard!, attrIndex);
        const opponentValue = getAttrValue(opponentCard!, attrIndex);

        if (userValue > opponentValue) {
            setResult('win');
        } else if (userValue < opponentValue) {
            setResult('lose');
        } else {
            setResult('draw');
        }

        setPhase('result');
    };

    const getAttrValue = (card: CardFromDB, index: number): number => {
        const key = `attr_${index}` as keyof CardFromDB;
        return (card[key] as number) || 0;
    };

    const finishBattle = async () => {
        const xpGained = result === 'win' ? 25 : result === 'draw' ? 10 : 5;
        
        // Update user XP
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('xp')
                .eq('id', userId)
                .single();

            if (profile) {
                await supabase
                    .from('profiles')
                    .update({ xp: (profile.xp || 0) + xpGained })
                    .eq('id', userId);
            }
        } catch (error) {
            console.error('Error updating XP:', error);
        }

        onBattleEnd(result === 'win', xpGained);
        onClose();
    };

    const playAgain = () => {
        setPhase('select');
        setSelectedCard(null);
        setOpponentCard(null);
        setSelectedAttr(null);
        setResult(null);
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
        attributes: ATTRIBUTES.map((attr, index) => ({
            label: attr.label,
            value: getAttrValue(card, index),
            icon: ['zap', 'smile', 'rocket', 'heart', 'laptop'][index] as IconType
        })),
        specialAbility: card.special_ability
    });

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
                <div className="text-center">
                    <Swords className="w-16 h-16 text-[#0054E3] mx-auto mb-4 animate-pulse" />
                    <p className="text-white font-digital">Carregando arena...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#245EDC] to-[#1a3a8a] overflow-y-auto p-4">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded transition z-50"
            >
                <X size={20} />
            </button>

            {/* Title */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <Swords className="w-6 h-6 text-white" />
                <h1 className="text-xl font-bold text-white font-digital drop-shadow">Arena de Batalha</h1>
            </div>

            <div className="w-full max-w-5xl mt-12">
                {/* Phase: Select Card */}
                {phase === 'select' && (
                    <div className="text-center">
                        <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-6 shadow-xl">
                            <h2 className="text-xl font-bold text-[#0054E3] font-digital mb-4">
                                Escolha sua carta para batalhar!
                            </h2>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
                                {userCards.map(card => (
                                    <button
                                        key={card.id}
                                        onClick={() => selectCard(card)}
                                        className="transform scale-75 origin-top hover:scale-80 transition-transform cursor-pointer"
                                    >
                                        <HoloCard
                                            data={convertToFormData(card)}
                                            stats={convertToStats(card)}
                                            rarity={card.rarity}
                                        />
                                    </button>
                                ))}
                            </div>

                            {userCards.length === 0 && (
                                <p className="text-gray-500 py-8">
                                    Você não tem cartas! Abra packs primeiro.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Phase: Loading Opponent */}
                {phase === 'opponent' && (
                    <div className="text-center">
                        <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-8 shadow-xl max-w-md mx-auto">
                            <Swords className="w-20 h-20 text-[#0054E3] mx-auto mb-4 animate-bounce" />
                            <h2 className="text-xl font-bold text-[#0054E3] font-digital mb-2">
                                Procurando oponente...
                            </h2>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                                <div className="bg-[#0054E3] h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phase: Choose Attribute */}
                {phase === 'choose_attr' && selectedCard && opponentCard && (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-white font-digital mb-6 drop-shadow">
                            Escolha um atributo para comparar!
                        </h2>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-6">
                            {/* Your card */}
                            <div className="text-center">
                                <p className="text-white font-digital mb-2">Sua carta</p>
                                <div className="transform scale-75 origin-top">
                                    <HoloCard
                                        data={convertToFormData(selectedCard)}
                                        stats={convertToStats(selectedCard)}
                                        rarity={selectedCard.rarity}
                                    />
                                </div>
                            </div>

                            <div className="text-4xl text-white font-bold">VS</div>

                            {/* Opponent card */}
                            <div className="text-center">
                                <p className="text-white font-digital mb-2">Oponente</p>
                                <div className="transform scale-75 origin-top">
                                    <HoloCard
                                        data={convertToFormData(opponentCard)}
                                        stats={convertToStats(opponentCard)}
                                        rarity={opponentCard.rarity}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Attribute buttons */}
                        <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-4 max-w-lg mx-auto">
                            <p className="text-gray-700 font-digital mb-3">Escolha um atributo:</p>
                            <div className="grid grid-cols-5 gap-2">
                                {ATTRIBUTES.map(attr => {
                                    const Icon = attr.icon;
                                    const userValue = getAttrValue(selectedCard, attr.index);
                                    return (
                                        <button
                                            key={attr.index}
                                            onClick={() => selectAttribute(attr.index)}
                                            className="flex flex-col items-center p-2 bg-white border-2 border-gray-300 rounded hover:border-[#0054E3] hover:bg-blue-50 transition"
                                        >
                                            <Icon size={20} style={{ color: attr.color }} />
                                            <span className="text-xs font-bold mt-1">{attr.label}</span>
                                            <span className="text-lg font-bold text-[#0054E3]">{userValue}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Phase: Comparing */}
                {phase === 'compare' && selectedAttr !== null && selectedCard && opponentCard && (
                    <div className="text-center">
                        <div className="bg-[#ECE9D8] border-2 border-[#ACA899] rounded-lg p-8 max-w-md mx-auto shadow-xl">
                            <h2 className="text-xl font-bold text-[#0054E3] font-digital mb-6">
                                Comparando {ATTRIBUTES[selectedAttr].label}...
                            </h2>

                            <div className="flex items-center justify-center gap-8">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Você</p>
                                    <div className="text-5xl font-bold text-[#0054E3] animate-pulse">
                                        {getAttrValue(selectedCard, selectedAttr)}
                                    </div>
                                </div>

                                <div className="text-2xl font-bold text-gray-400">VS</div>

                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Oponente</p>
                                    <div className="text-5xl font-bold text-red-500 animate-pulse">
                                        {getAttrValue(opponentCard, selectedAttr)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Phase: Result */}
                {phase === 'result' && result && (
                    <div className="text-center">
                        <div className={`bg-[#ECE9D8] border-4 rounded-lg p-8 max-w-md mx-auto shadow-xl ${
                            result === 'win' ? 'border-green-500' : 
                            result === 'lose' ? 'border-red-500' : 
                            'border-yellow-500'
                        }`}>
                            {result === 'win' && (
                                <>
                                    <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-green-600 font-digital mb-2">
                                        🎉 VITÓRIA! 🎉
                                    </h2>
                                    <p className="text-gray-600">Você ganhou +25 XP!</p>
                                </>
                            )}
                            
                            {result === 'lose' && (
                                <>
                                    <Swords className="w-20 h-20 text-red-400 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-red-600 font-digital mb-2">
                                        Derrota...
                                    </h2>
                                    <p className="text-gray-600">Você ganhou +5 XP pela tentativa.</p>
                                </>
                            )}

                            {result === 'draw' && (
                                <>
                                    <Swords className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                                    <h2 className="text-3xl font-bold text-yellow-600 font-digital mb-2">
                                        Empate!
                                    </h2>
                                    <p className="text-gray-600">Você ganhou +10 XP!</p>
                                </>
                            )}

                            <div className="flex gap-3 justify-center mt-6">
                                <button
                                    onClick={playAgain}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#78C257] to-[#4E9A2F] border-2 border-[#3A7A1F] text-white font-bold rounded shadow hover:brightness-110 transition"
                                >
                                    <RotateCcw size={16} />
                                    Jogar Novamente
                                </button>
                                <button
                                    onClick={finishBattle}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-[#0054E3] to-[#003399] border-2 border-[#002266] text-white font-bold rounded shadow hover:brightness-110 transition"
                                >
                                    <ChevronRight size={16} />
                                    Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
