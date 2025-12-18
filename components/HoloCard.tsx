import React, { useRef, useState } from 'react';
import { CardStats, FormData, IconType, Rarity } from '../types';
import { Zap, Heart, Shield, Skull, Laptop, Star, Brain, Smile, Rocket, Ghost, Gamepad2, Award, Sparkles } from 'lucide-react';

interface HoloCardProps {
  data: FormData;
  stats: CardStats;
  id?: string;
  rarity?: Rarity;
}

const ICON_MAP: Record<IconType, React.ElementType> = {
  skull: Skull,
  zap: Zap,
  shield: Shield,
  heart: Heart,
  laptop: Laptop,
  brain: Brain,
  smile: Smile,
  rocket: Rocket,
  ghost: Ghost,
  gamepad: Gamepad2
};

const COLOR_MAP: Record<IconType, string> = {
  skull: 'text-gray-400',
  zap: 'text-yellow-400',
  shield: 'text-blue-500',
  heart: 'text-red-500',
  laptop: 'text-green-400',
  brain: 'text-pink-400',
  smile: 'text-orange-400',
  rocket: 'text-purple-500',
  ghost: 'text-slate-300',
  gamepad: 'text-indigo-400'
};

// Configuração Visual por Raridade
const RARITY_STYLES: Record<Rarity, {
  border: string;
  bgTexture: string;
  headerGradient: string;
  holoOpacity: string;
  badgeColor: string;
  badgeText: string;
  footerColor: string;
  textColorOverride?: string;
  matrixEffect?: boolean;
  particleEffect?: boolean;
}> = {
  common: {
    border: 'border-gray-400', // Cinza
    bgTexture: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
    headerGradient: 'from-gray-800 via-gray-600 to-gray-800 border-gray-400',
    holoOpacity: 'opacity-0', // Sem brilho
    badgeColor: 'text-gray-400',
    badgeText: 'COMUM',
    footerColor: 'bg-gray-100 border-gray-400 text-gray-800'
  },
  uncommon: {
    border: 'border-green-600', // Verde
    bgTexture: "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
    headerGradient: 'from-green-900 via-green-700 to-green-900 border-green-400',
    holoOpacity: 'opacity-0 group-hover:opacity-25', // Brilho estático simples (leve)
    badgeColor: 'text-green-500',
    badgeText: 'INCOMUM',
    footerColor: 'bg-[#e0ffe0] border-green-600 text-green-900'
  },
  rare: {
    border: 'border-blue-500', // Azul
    bgTexture: "url('https://www.transparenttextures.com/patterns/black-scales.png')",
    headerGradient: 'from-blue-900 via-blue-600 to-blue-900 border-blue-400',
    holoOpacity: 'opacity-0 group-hover:opacity-50', // Efeito holográfico leve/médio
    badgeColor: 'text-blue-400',
    badgeText: 'RARA',
    footerColor: 'bg-[#e0f0ff] border-blue-500 text-blue-900'
  },
  ultra_rare: {
    border: 'border-yellow-400', // Dourado
    bgTexture: "url('https://www.transparenttextures.com/patterns/diagmonds-light.png')",
    headerGradient: 'from-yellow-700 via-yellow-500 to-yellow-700 border-yellow-300',
    holoOpacity: 'opacity-0 group-hover:opacity-90', // Intenso
    badgeColor: 'text-yellow-400',
    badgeText: 'ULTRA RARA',
    footerColor: 'bg-[#fffbe0] border-yellow-500 text-yellow-900',
    particleEffect: true
  },
  secret_rare: {
    border: 'border-[#00FF00]', // Matrix Green
    bgTexture: "url('https://www.transparenttextures.com/patterns/wall-4-light.png')",
    headerGradient: 'from-black via-green-900 to-black border-green-500',
    holoOpacity: 'opacity-0 group-hover:opacity-40',
    badgeColor: 'text-green-500',
    badgeText: 'SECRET',
    footerColor: 'bg-black border-green-500 text-green-500',
    textColorOverride: 'text-green-500',
    matrixEffect: true
  },
  founder: {
    border: 'border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)]', // Orange glow
    bgTexture: "url('https://www.transparenttextures.com/patterns/gold-scale.png')",
    headerGradient: 'from-orange-600 via-yellow-500 to-red-500 border-yellow-400',
    holoOpacity: 'opacity-0 group-hover:opacity-70',
    badgeColor: 'text-orange-400',
    badgeText: '⭐ FUNDADOR',
    footerColor: 'bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-500 text-orange-900',
    particleEffect: true
  }
};

interface StatRowProps {
  label: string;
  value: number;
  iconType: IconType;
  isSecret?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, iconType, isSecret }) => {
  const Icon = ICON_MAP[iconType] || Star;
  let colorClass = COLOR_MAP[iconType] || 'text-white';

  if (isSecret) {
    colorClass = 'text-green-500 drop-shadow-[0_0_2px_rgba(0,255,0,0.8)]';
  }

  return (
    <div className={`flex items-center justify-between py-0.5 border-b ${isSecret ? 'border-green-900/50 bg-black/50' : 'border-gray-700/30 bg-black/10'} last:border-0 px-2 my-px rounded`}>
      <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
        <Icon size={10} className={`${colorClass} flex-shrink-0`} />
        <span
          className={`text-[8px] uppercase font-bold tracking-tighter truncate leading-tight ${isSecret ? 'text-green-500 font-digital' : 'text-gray-200'}`}
          title={label}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className={`w-12 h-1.5 rounded-full overflow-hidden border ${isSecret ? 'border-green-700 bg-black' : 'bg-gray-800 border-gray-600'}`}>
          <div
            className={`h-full ${isSecret ? 'bg-green-500 shadow-[0_0_5px_#00ff00]' : colorClass.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, value)}%` }}
          ></div>
        </div>
        <span className={`font-pixel text-[8px] drop-shadow-md min-w-[16px] text-right ${isSecret ? 'text-green-500' : 'text-white'}`}>{value}</span>
      </div>
    </div>
  );
};

export const HoloCard: React.FC<HoloCardProps> = ({ data, stats, id, rarity = 'common' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });

  const styleConfig = RARITY_STYLES[rarity];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    // Disable rotation for secret_rare (Matrix effect looks better without it)
    if (rarity === 'secret_rare') return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  };

  // Touch handlers for mobile
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (rarity === 'secret_rare') return;

    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Reduced rotation for mobile (less intense)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleTouchEnd = () => {
    // Smooth reset on touch end
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  };

  return (
    <div
      className="perspective-1000 group w-[320px] h-[480px] mx-auto select-none touch-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      id={id}
    >
      <div
        ref={cardRef}
        className={`relative w-full h-full transition-transform duration-100 ease-out transform-gpu shadow-2xl rounded-xl border-[8px] ${styleConfig.border}`}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          boxShadow: rarity === 'secret_rare'
            ? `0 0 0 1px #003300, 0 0 0 4px #000, 0 0 20px #00ff00, ${-rotate.y * 1}px ${rotate.x * 1}px 20px rgba(0,255,0,0.2)`
            : rarity === 'ultra_rare'
              ? `0 0 0 1px #8a6c08, 0 0 0 4px #000, 0 0 15px #ffd700, ${-rotate.y * 1}px ${rotate.x * 1}px 20px rgba(0,0,0,0.5)`
              : `0 0 0 1px #555, 0 0 0 4px #222, ${-rotate.y * 1}px ${rotate.x * 1}px 20px rgba(0,0,0,0.5)`
        }}
      >
        {/* Particle Effect for Ultra Rare */}
        {styleConfig.particleEffect && (
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
          </div>
        )}

        {/* Matrix Rain Effect for Secret Rare */}
        {styleConfig.matrixEffect && (
          <div className="matrix-rain z-50">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="matrix-column"
                style={{
                  left: `${i * 5}%`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              >
                {Array.from({ length: 25 }, () =>
                  String.fromCharCode(0x30A0 + Math.random() * 96)
                ).join('')}
              </span>
            ))}
          </div>
        )}

        {/* Holographic Overlay - Not for Secret Rare (uses Matrix instead) */}
        {!styleConfig.matrixEffect && (
          <div
            className={`absolute inset-0 z-40 transition-opacity duration-300 pointer-events-none rounded-lg mix-blend-color-dodge ${styleConfig.holoOpacity}`}
            style={{
              background: `
                linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.7) 35%, rgba(0,255,255,0.7) 40%, rgba(255,0,255,0.7) 45%, transparent 60%),
                url("https://www.transparenttextures.com/patterns/diagmonds-light.png")
              `,
              backgroundSize: '200% 200%, auto',
              backgroundPosition: `${glare.x}% ${glare.y}%, 0 0`,
              filter: 'brightness(1.2) contrast(1.2)'
            }}
          />
        )}

        {/* Card Content Container - Padding increased here to prevent clipping */}
        <div
          className={`relative z-30 flex flex-col h-full px-4 pt-2 pb-5 overflow-hidden`}
          style={{ backgroundImage: styleConfig.bgTexture, backgroundColor: rarity === 'secret_rare' ? '#000' : 'transparent' }}
        >

          {/* Header */}
          <div className={`flex justify-between items-center mb-1 bg-gradient-to-r ${styleConfig.headerGradient} border rounded-t px-2 py-1 shadow-md shrink-0`}>
            <h2 className={`font-digital font-bold text-sm uppercase tracking-wider drop-shadow-md ${styleConfig.textColorOverride || 'text-white'}`}>
              {data.name}
            </h2>
            <div className="flex items-center gap-1">
              <span className={`font-pixel text-[6px] ${rarity === 'secret_rare' ? 'text-green-500' : 'text-yellow-300'}`}>NVL</span>
              <span className={`font-pixel text-[10px] ${rarity === 'secret_rare' ? 'text-green-500' : 'text-yellow-300'}`}>{data.age}</span>
            </div>
          </div>

          {/* Image Area */}
          <div className={`relative w-full aspect-[4/3] bg-black border-4 ${rarity === 'secret_rare' ? 'border-green-800' : 'border-gray-400'} rounded-sm shadow-inner mb-2 overflow-hidden group shrink-0`}>
            {data.image ? (
              <div
                className={`w-full h-full bg-cover bg-center bg-no-repeat ${rarity === 'secret_rare' ? 'grayscale contrast-125 brightness-90 sepia-[.5] hue-rotate-50' : ''}`}
                style={{ backgroundImage: `url(${data.image})` }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gray-900">NO SIGNAL</div>
            )}

            {/* Retro overlay lines */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />

            {/* Job Tag - Moved inside image to save vertical space */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-0.5 border-t border-white/20">
              <p className={`font-digital text-center text-[9px] uppercase tracking-widest leading-none ${rarity === 'secret_rare' ? 'text-green-500' : 'text-green-400'}`}>
                {data.profession}
              </p>
            </div>
          </div>

          {/* Stats Grid - Moved up and compacted */}
          <div className={`flex-1 ${rarity === 'secret_rare' ? 'bg-black border-green-900' : 'bg-gray-900/80 border-gray-600'} border rounded p-1 mb-2 shadow-inner backdrop-blur-sm min-h-0 flex flex-col justify-center`}>
            {stats.attributes.map((attr, index) => (
              <StatRow
                key={index}
                label={attr.label}
                value={attr.value}
                iconType={attr.icon}
                isSecret={rarity === 'secret_rare'}
              />
            ))}
          </div>

          {/* Footer / Ability - Ensured padding from bottom */}
          <div className={`${styleConfig.footerColor} border-2 rounded p-1 shadow-md relative mt-auto shrink-0`}>
            <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 ${rarity === 'secret_rare' ? 'bg-black border-green-500 text-green-500' : 'bg-yellow-600 text-white border-yellow-300'} px-2 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-wider border shadow`}>
              Status MSN
            </div>
            <p className={`font-digital text-[8px] leading-tight text-center italic pt-1 ${rarity === 'secret_rare' ? 'text-green-400 font-mono' : ''}`}>
              "{stats.specialAbility}"
            </p>
          </div>

          {/* Rarity Seal */}
          <div className="absolute top-9 right-4 pointer-events-none z-50 flex flex-col items-end">
            <div className={`${styleConfig.badgeColor} drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transform rotate-12 flex flex-col items-center`}>
              <Award className="w-8 h-8 fill-current" strokeWidth={1.5} />
              <span className="font-pixel text-[6px] font-bold bg-black/50 px-1 rounded backdrop-blur-sm -mt-2 border border-white/20">
                {styleConfig.badgeText}
              </span>
            </div>
          </div>

          {/* Rarity Star (Bottom Right) - Moved inwards */}
          <div className="absolute bottom-5 right-5 opacity-90 pointer-events-none z-50">
            {rarity === 'ultra_rare' ? (
              <Sparkles className="text-yellow-400 fill-yellow-200 w-4 h-4 animate-spin-slow" />
            ) : (
              <Star className={`${rarity === 'secret_rare' ? 'text-green-500 fill-green-500' : 'text-yellow-500 fill-yellow-500'} w-3 h-3 drop-shadow-lg animate-pulse`} />
            )}
          </div>

        </div>
      </div>
    </div>
  );
};