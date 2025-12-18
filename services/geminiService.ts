import { GoogleGenAI, Type } from "@google/genai";
import { CardStats, IconType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Atributos fixos para batalha (índices 0-4):
 * 0 - Energia (zap) - quão enérgico/ativo é
 * 1 - Estilo (smile) - carisma, aparência, charme
 * 2 - Audácia (rocket) - ousadia, coragem, loucura
 * 3 - Social (heart) - habilidade social, conexões
 * 4 - Skill (laptop) - habilidade técnica/profissional
 */
const FIXED_ATTRIBUTES = [
  { label: 'Energia', icon: 'zap' as IconType },
  { label: 'Estilo', icon: 'smile' as IconType },
  { label: 'Audácia', icon: 'rocket' as IconType },
  { label: 'Social', icon: 'heart' as IconType },
  { label: 'Skill', icon: 'laptop' as IconType },
];

export const generateCardStats = async (
  age: number,
  profession: string,
  maritalStatus: string,
  name: string
): Promise<CardStats> => {
  const prompt = `
    IMPORTANTE: Responda SEMPRE em português brasileiro (pt-BR).
    
    Analise o seguinte perfil para um jogo de cartas chamado "Amigo Trunfo".
    
    Perfil:
    - Nome: ${name}
    - Idade: ${age}
    - Profissão/Hobby: ${profession}
    - Estado Civil: ${maritalStatus}

    Gere valores numéricos (0-100) para EXATAMENTE estes 5 atributos fixos:
    
    1. ENERGIA (attr_0): Quão enérgico, ativo e disposto a pessoa é. Crianças e atletas têm alto. Idosos e sedentários têm baixo.
    2. ESTILO (attr_1): Carisma, charme, aparência, swag. Modelos e artistas têm alto.
    3. AUDÁCIA (attr_2): Ousadia, coragem, loucura, disposição para riscos. Aventureiros têm alto.
    4. SOCIAL (attr_3): Habilidade social, networking, popularidade. Políticos e influencers têm alto.
    5. SKILL (attr_4): Habilidade técnica/profissional, expertise. Especialistas têm alto.

    Diretrizes para valores:
    - Considere a idade: crianças têm muita energia mas pouco skill profissional
    - Considere a profissão: programador tem alto skill mas talvez baixo social
    - Considere o estado civil: casados podem ter menos audácia, mais social
    - Seja criativo e divertido, mas realista nos valores
    - Valores entre 30-90 são comuns, 1-30 ou 90-100 são extremos

    Gere também uma HABILIDADE ESPECIAL engraçada e criativa (máximo 6 palavras, em português).
    Exemplo: "Dorme de olho aberto", "Café no sangue".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            attr_0: { type: Type.INTEGER, description: "Energia (0-100)" },
            attr_1: { type: Type.INTEGER, description: "Estilo (0-100)" },
            attr_2: { type: Type.INTEGER, description: "Audácia (0-100)" },
            attr_3: { type: Type.INTEGER, description: "Social (0-100)" },
            attr_4: { type: Type.INTEGER, description: "Skill (0-100)" },
            specialAbility: { type: Type.STRING, description: "Habilidade especial engraçada" },
          },
          required: ["attr_0", "attr_1", "attr_2", "attr_3", "attr_4", "specialAbility"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);

      // Mapear para o formato CardStats com atributos fixos
      return {
        attributes: FIXED_ATTRIBUTES.map((attr, index) => ({
          label: attr.label,
          value: Math.min(100, Math.max(0, data[`attr_${index}`] || 50)),
          icon: attr.icon,
        })),
        specialAbility: data.specialAbility || "Mistério absoluto",
      };
    }
    throw new Error("No data returned");
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback stats com valores baseados em randomização leve
    const baseValue = 50;
    return {
      attributes: FIXED_ATTRIBUTES.map((attr) => ({
        label: attr.label,
        value: baseValue + Math.floor(Math.random() * 30) - 15,
        icon: attr.icon,
      })),
      specialAbility: "Erro no Matrix: Tente novamente.",
    };
  }
};