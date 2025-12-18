// Sistema de Níveis - Amigo Trunfo XP
// Baseado em XP acumulado por batalhas

export interface LevelInfo {
    level: number;
    title: string;
    minXp: number;
    maxXp: number;
    color: string;
    icon: string;
}

// Tabela de níveis (inspirada em ranks de jogos dos anos 2000)
export const LEVELS: LevelInfo[] = [
    { level: 1, title: 'Novato', minXp: 0, maxXp: 49, color: '#808080', icon: '🐣' },
    { level: 2, title: 'Aprendiz', minXp: 50, maxXp: 149, color: '#4A90D9', icon: '📘' },
    { level: 3, title: 'Jogador', minXp: 150, maxXp: 299, color: '#43A047', icon: '🎮' },
    { level: 4, title: 'Veterano', minXp: 300, maxXp: 499, color: '#7B1FA2', icon: '⭐' },
    { level: 5, title: 'Expert', minXp: 500, maxXp: 749, color: '#F57C00', icon: '🔥' },
    { level: 6, title: 'Mestre', minXp: 750, maxXp: 999, color: '#C62828', icon: '👑' },
    { level: 7, title: 'Lenda', minXp: 1000, maxXp: 1499, color: '#FFD700', icon: '🏆' },
    { level: 8, title: 'Mítico', minXp: 1500, maxXp: 2499, color: '#E040FB', icon: '💎' },
    { level: 9, title: 'Imortal', minXp: 2500, maxXp: 4999, color: '#00BCD4', icon: '🌟' },
    { level: 10, title: 'Divino', minXp: 5000, maxXp: Infinity, color: '#FF1744', icon: '🔱' },
];

/**
 * Calcula o nível baseado no XP total
 */
export const getLevelFromXp = (xp: number): LevelInfo => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (xp >= LEVELS[i].minXp) {
            return LEVELS[i];
        }
    }
    return LEVELS[0];
};

/**
 * Calcula o progresso percentual para o próximo nível
 */
export const getLevelProgress = (xp: number): number => {
    const currentLevel = getLevelFromXp(xp);
    const levelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);

    // Se for o último nível, sempre 100%
    if (levelIndex === LEVELS.length - 1) {
        return 100;
    }

    const nextLevel = LEVELS[levelIndex + 1];
    const xpInCurrentLevel = xp - currentLevel.minXp;
    const xpNeededForNext = nextLevel.minXp - currentLevel.minXp;

    return Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNext) * 100));
};

/**
 * Calcula XP restante para o próximo nível
 */
export const getXpToNextLevel = (xp: number): number => {
    const currentLevel = getLevelFromXp(xp);
    const levelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);

    // Se for o último nível
    if (levelIndex === LEVELS.length - 1) {
        return 0;
    }

    const nextLevel = LEVELS[levelIndex + 1];
    return nextLevel.minXp - xp;
};

/**
 * Retorna o título formatado com emoji
 */
export const getFormattedTitle = (xp: number): string => {
    const level = getLevelFromXp(xp);
    return `${level.icon} ${level.title}`;
};
