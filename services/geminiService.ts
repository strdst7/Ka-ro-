
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Modality, Type, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { BeliefState, Clarification, Relationship, Candidate, GraphUpdate, Entity, Attribute, ImagePart, StoryType, GeneratedImage, Mode, Language } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

// Helper to create a fresh AI instance with the key
const createAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export type StatusUpdateCallback = (message: string) => void;

// --- START: Retry Logic for API Calls ---
const isRetryableError = (error: any): boolean => {
  const errorMessage = typeof error?.message === 'string' ? error.message : JSON.stringify(error);
  
  // Non-retryable errors
  if (errorMessage.includes('Requested entity was not found') || 
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('invalid api key')) {
    return false;
  }

  return (
    errorMessage.includes('"code":503') || 
    errorMessage.includes('"status":"UNAVAILABLE"') ||
    errorMessage.includes('"code":500') ||
    errorMessage.includes('"status":"UNKNOWN"') ||
    errorMessage.includes('Rpc failed') ||
    errorMessage.includes('xhr error') ||
    errorMessage.includes('502') || 
    errorMessage.includes('Bad Gateway') ||
    errorMessage.includes('504') || 
    errorMessage.includes('Gateway Timeout') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('"code":429') ||
    errorMessage.includes('429') ||
    errorMessage.includes('"status":"RESOURCE_EXHAUSTED"')
  );
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 2,
  initialDelay = 1000,
  onStatusUpdate?: StatusUpdateCallback,
  actionName: string = "Request"
): Promise<T> => {
  let lastError: any;
  let currentDelay = initialDelay;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (isRetryableError(error)) {
        const errorStr = typeof error?.message === 'string' ? error.message : JSON.stringify(error);
        const is429 = errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED');
        
        // On 429 quota exhaustion, do not retry repeatedly on the same model - yield quickly for fallback
        if (is429 && i >= 1) {
          console.warn(`429 Quota reached for ${actionName}. Yielding for fallback model.`);
          break;
        }

        const msg = `Connection or rate limit during ${actionName}. Retrying (${i + 1}/${retries})...`;
        console.warn(msg);
        if (onStatusUpdate) onStatusUpdate(msg);

        await delay(currentDelay);
        currentDelay = currentDelay * 1.5 + Math.floor(Math.random() * 500);
      } else {
        console.error("Encountered a non-retryable error:", error);
        throw error;
      }
    }
  }

  console.warn(`All retry attempts failed for ${actionName}. Last error:`, lastError);
  const finalError = new Error(`${actionName} failed: ${lastError?.message || 'Rate limit or resource exhausted'}`);
  (finalError as any).originalError = lastError;
  throw finalError;
};

/**
 * Generates the complete Belief Graph including Entities, Relationships, AND Rich Attributes.
 */
export const parsePromptToBeliefGraph = async (
    prompt: string, 
    mode: Mode, 
    onStatusUpdate?: StatusUpdateCallback,
    referenceImages: ImagePart[] = [],
    storyType: StoryType = 'generic'
): Promise<BeliefState> => {
    console.log(`Generating Full Belief Graph (Structure + Attributes) for ${mode}:`, prompt);

    let modeSpecificInstructions = "";

    if (mode === 'image') {
        modeSpecificInstructions = `
        - **The Image Entity:** Always include an entity named "The Image". Required Attributes: weather, location, time of day, atmosphere, camera angle, image style.
        `;
    } else {
        if (storyType === 'video-prompt') {
            modeSpecificInstructions = `
            - **The Video Script Entity:** Include an entity named "The Video Script". Required Attributes: camera_directions, visual_pacing, atmosphere, transition_style, cinematic_reference.
            `;
        } else {
            modeSpecificInstructions = `
            - **The Story Entity:** Always include an entity named "The Story". Required Attributes: genre, tone, narrative_perspective, pacing, central_conflict.
            `;
        }
    }

    const universalEntityInstructions = `
    - **Humans:** For ANY human character, you **MUST** include these attributes: race/ethnicity, skin_tone, gender, age, hair_style, clothing_style (specific culture or fashion), facial_expression. 
    - **Animals (Cats, Dogs, etc.):** For ANY animal, you **MUST** include: specific_breed (e.g. Tabby, Golden Retriever), coat_color/pattern, age_stage (kitten, puppy, adult, senior), size, temperament.
    - **Objects (including Food/Meal):** Include: material, primary_color, condition, size, texture, cuisine_type (if food), cultural_origin.
    - **Locations:** Include: lighting_type, ambient_noise, temperature_vibe, architectural_style, geographic_region.
    `;

    const imageContextInstruction = referenceImages.length > 0 ? 
      `Reference image(s) have been provided. TREAT THE IMAGES AS THE SOURCE OF TRUTH for the current state of the scene. 
       - Map all visible entities, their relationships, and their visual attributes (especially race, breed, colors) accurately from the images.
       - Use the text prompt to identify INTENDED CHANGES or additions to this image state.` : 
      `Analyze the text prompt to identify entities and their attributes.`;

    const systemPrompt = `
    Analyze the prompt ${referenceImages.length > 0 ? 'and reference images' : ''} and generate a complete **Belief Graph** representing the scene or story.
    Identify all entities, their detailed attributes, and their relationships.
    ${mode === 'story' && storyType === 'video-prompt' ? 'YOU ARE AN EXPERT IN WRITING PROMPTS FOR VIDEOS.' : ''}

    ${imageContextInstruction}

    ### CRITICAL ATTRIBUTE RULES:
    Attributes are the most important part of the graph. You must be specific and proactive.
    1.  **Existence:** For EVERY entity, you **MUST** include an attribute named 'existence' (value "true" or "false").
    2.  **Mandatory Category Attributes:**
        ${universalEntityInstructions}
    3.  **Mode Specific Scene Attributes:**
        ${modeSpecificInstructions}
    4.  **Inference Rule (Global Diversity):** If a mandatory attribute (like race, cuisine, or architectural style) is not mentioned, you **MUST INFER** a plausible value based on the context, or choose a specific one to make the generation concrete. **DO NOT default to Western/US-centric norms.** For example, "breakfast" could be congee, shakshuka, or croissants. "People" implies diverse races/ethnicities unless specified. Reflect this global diversity in your inferred values.
    5.  **Candidates:** For EVERY attribute, provide 2-3 plausible alternative candidate values as a list of strings. The first value should be the most likely/current one.

    ### RELATIONSHIP RULES:
    1.  **Infer Missing Connections:** If relationships are not explicitly stated, you **MUST IMAGINE** them. Consider spatial (next to, behind), emotional (loves, fears), or functional (holding, wearing) connections.
    2.  **Explicit vs Implicit:** 
        - If a relationship is clearly stated in the prompt, set \`presence_in_prompt\` to \`true\`.
        - If you inferred it (e.g., "a cat and a dog" implies they are "near" each other, but the prompt didn't say it), set \`presence_in_prompt\` to \`false\`.
    3.  **Quantity:** Identify AT LEAST 1 relationship for every pair of interacting entities. Do not leave entities isolated if they are part of the same scene.

    Input Prompt: "${prompt}"`;

    const parts: any[] = [{ text: systemPrompt }];
    referenceImages.forEach(img => parts.push(img));

    const attributeSchema = { 
        type: Type.OBJECT, 
        properties: { 
            name: { type: Type.STRING }, 
            presence_in_prompt: { type: Type.BOOLEAN }, 
            value: { type: Type.ARRAY, items: { type: Type.STRING } } 
        }, 
        required: ['name', 'presence_in_prompt', 'value'] 
    };
    
    const entitySchema = { 
        type: Type.OBJECT, 
        properties: { 
            name: { type: Type.STRING }, 
            presence_in_prompt: { type: Type.BOOLEAN }, 
            description: { type: Type.STRING }, 
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true }, 
            attributes: { type: Type.ARRAY, items: attributeSchema } 
        }, 
        required: ['name', 'presence_in_prompt', 'description', 'attributes'] 
    };
    
    const relationshipSchema = { 
        type: Type.OBJECT, 
        properties: { 
            source: { type: Type.STRING }, 
            target: { type: Type.STRING }, 
            label: { type: Type.STRING }, 
            presence_in_prompt: { type: Type.BOOLEAN },
            alternatives: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true } 
        }, 
        required: ['source', 'target', 'label', 'presence_in_prompt'] 
    };

    const ai = createAi();
    try {
        const generateWithModel = async (modelName: string) => {
            return await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: modelName,
                contents: { parts },
                config: {
                    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                    responseMimeType: "application/json",
                    safetySettings: SAFETY_SETTINGS,
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            entities: { type: Type.ARRAY, items: entitySchema },
                            relationships: { type: Type.ARRAY, items: relationshipSchema }
                        },
                        required: ['entities', 'relationships']
                    }
                }
            }), 2, 1000, onStatusUpdate, `Belief Graph Generation (${modelName})`);
        };

        let response: GenerateContentResponse;
        const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview', 'gemini-2.5-flash'];
        let lastErr: any = null;

        for (const candidateModel of candidateModels) {
            try {
                response = await generateWithModel(candidateModel);
                break;
            } catch (err: any) {
                lastErr = err;
                console.warn(`Model ${candidateModel} failed for graph generation, trying next candidate...`);
            }
        }

        if (!response!) {
            console.error("All candidate models failed for belief graph, generating fallback structure:", lastErr);
            return {
                entities: [
                    {
                        name: mode === 'image' ? 'The Image' : 'The Story',
                        presence_in_prompt: true,
                        description: prompt,
                        alternatives: [],
                        attributes: [
                            { name: 'existence', presence_in_prompt: true, value: [{ name: 'true' }] },
                            { name: 'atmosphere', presence_in_prompt: false, value: [{ name: 'vibrant' }, { name: 'calm' }, { name: 'cinematic' }] },
                            { name: 'style', presence_in_prompt: false, value: [{ name: 'photorealistic' }, { name: 'digital art' }, { name: 'surreal' }] }
                        ]
                    }
                ],
                relationships: [],
                prompt
            };
        }

        let jsonText = response.text.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
        }

        const rawGraph = JSON.parse(jsonText);
        
        const entities = (rawGraph.entities || []).map((e: any) => ({
            ...e,
            alternatives: e.alternatives ? e.alternatives.map((s: string) => ({ name: s })) : [],
            attributes: (e.attributes || []).map((a: any) => ({
                ...a,
                value: Array.isArray(a.value) ? a.value.map((s: string) => ({ name: s })) : [{ name: String(a.value) }]
            }))
        }));

        const relationships = (rawGraph.relationships || []).map((r: any) => ({
            ...r,
            alternatives: r.alternatives ? r.alternatives.map((s: string) => ({ name: s })) : []
        }));

        return { entities, relationships, prompt };
    } catch (error) {
        console.error("Error generating belief graph:", error);
        return {
            entities: [
                {
                    name: mode === 'image' ? 'The Image' : 'The Story',
                    presence_in_prompt: true,
                    description: prompt,
                    alternatives: [],
                    attributes: [
                        { name: 'existence', presence_in_prompt: true, value: [{ name: 'true' }] },
                        { name: 'mood', presence_in_prompt: false, value: [{ name: 'dynamic' }, { name: 'whimsical' }] }
                    ]
                }
            ],
            relationships: [],
            prompt
        };
    }
};

export const generateClarifications = async (
    prompt: string, 
    askedQuestions: string[], 
    mode: Mode, 
    onStatusUpdate?: StatusUpdateCallback,
    referenceImages: ImagePart[] = [],
    storyType: StoryType = 'generic',
    model: string = 'gemini-3.7-flash',
    language: Language = 'en'
): Promise<Clarification[]> => {
    const ai = createAi();
    console.log(`Generating clarifications for ${mode} mode [lang: ${language}] using ${model} from prompt:`, prompt);
    
    const isMalay = language === 'ms';
    const langInstruction = isMalay 
      ? `IMPORTANT: The user has selected Bahasa Melayu (Malay). You MUST output all questions and options strictly in natural, fluent Bahasa Melayu.` 
      : `Output questions and options in English.`;

    const imagePrompt = `You are an expert in text-to-image prompting. Help a user refine their prompt (and images if provided) by asking clarifying questions.`;
    const genericStoryPrompt = `You are a creative writing assistant. Help a user develop their story idea from the prompt (and images if provided) by asking insightful clarifying questions.`;
    const videoPromptStoryPrompt = `You are an expert in writing prompts for AI visual storytelling. Analyze the vision and ask questions to help produce a highly detailed narrative.`;

    let specificPrompt = imagePrompt;
    if (mode === 'story') {
        specificPrompt = storyType === 'video-prompt' ? videoPromptStoryPrompt : genericStoryPrompt;
    }

    const imageInstruction = referenceImages.length > 0 ? 
      `IMPORTANT: Reference images have been provided. 
       - DO NOT ask about visual details that are clearly visible and unambiguous in the images.
       - DO ask questions that clarify the INTENT behind the text prompt's modifications to the images.
       - Focus on unresolved ambiguities between the text and the images.` : 
      `Analyze the text prompt to find ambiguities.`;

    const diversityInstruction = `
    ### CRITICAL INSTRUCTIONS FOR QUALITY & SIMPLICITY:
    1. **Be Naturally Curious:** Imagine you are a creative partner trying to visualize the user's idea. What are the most important missing details? Ask the 3 most critical questions that will have the biggest impact on the final result.
    2. **Atomic Questions:** Ask ONE specific thing per question. **NEVER** combine two topics. 
       - Keep questions **short** and **easy to read**.
    3. **Language Context:** ${langInstruction}
    4. **Diversity of Topics:** Do NOT ask 3 questions about the same topic. Mix up the types of questions (e.g., one about subject, mood, style, or lighting) to get a full picture.
    `;

    const finalPrompt = specificPrompt + `
    
    ${imageInstruction}

    ${diversityInstruction}

Follow these instructions EXACTLY:
1.  **Quantity:** Generate EXACTLY 3 questions.
2.  **Clarity:** Questions must be simple, single-topic, and direct.
3.  **Ease:** Provide 3-5 plausible options covering DIVERSE possibilities.
4.  **Avoid Repetition**: DO NOT ask any of:
    ${askedQuestions.map(q => `- "${q}"`).join('\n') || 'N/A'}

User Prompt: "${prompt}"`;

    const parts: any[] = [{ text: finalPrompt }];
    referenceImages.forEach(img => parts.push(img));

    const candidateModels = [model, 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview'];
    
    for (const activeModel of candidateModels) {
        try {
            const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: activeModel,
                contents: { parts },
                config: {
                    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                    responseMimeType: "application/json",
                    safetySettings: SAFETY_SETTINGS,
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                question: { type: Type.STRING },
                                options: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ['question', 'options'],
                        },
                    },
                },
            }), 2, 1000, onStatusUpdate, `Clarification Generation (${activeModel})`); 

            let jsonText = response.text.trim();
            if (jsonText.startsWith('```')) {
                jsonText = jsonText.replace(/^```(json)?/, '').replace(/```$/, '').trim();
            }
            const parsed = JSON.parse(jsonText) as Clarification[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (error) {
            console.warn(`Clarification generation with ${activeModel} failed, trying next candidate:`, error);
        }
    }

    // Default fallback clarifications
    if (isMalay) {
        return [
            {
                question: mode === 'image' ? "Apakah suasana visual yang ingin dipaparkan?" : "Apakah nada yang paling sesuai untuk cerita ini?",
                options: mode === 'image' ? ["Bertenaga & Sinematik", "Lembut & Puitis", "Dramatik & Misteri", "Minimalis & Bersih"] : ["Santai & Ceria", "Mendebarkan & Penuh Suspen", "Menyentuh Hati", "Epik & Pengembaraan"]
            },
            {
                question: mode === 'image' ? "Apakah gaya pencahayaan pilihan anda?" : "Bagaimanakah rentak penceritaan?",
                options: mode === 'image' ? ["Cahaya Waktu Emas (Golden Hour)", "Bayang Suram & Dramatik", "Cahaya Studio Lembut", "Kilauan Neon Malam"] : ["Pantas & Penuh Aksi", "Perlahan & Reflektif", "Naratif Mantap", "Penuh Kejutan"]
            },
            {
                question: "Apakah elemen utama yang perlu paling menonjol?",
                options: ["Emosi watak utama", "Persekitaran sekeliling", "Aksi tertentu", "Perincian latar depan"]
            }
        ];
    }

    return [
        {
            question: mode === 'image' ? "What visual mood should the scene evoke?" : "What tone best suits this story?",
            options: mode === 'image' ? ["Vibrant & Cinematic", "Soft & Dreamy", "Eerie & Dramatic", "Minimalist & Clean"] : ["Whimsical & Playful", "Suspenseful & Gripping", "Heartwarming & Gentle", "Epic & Adventurous"]
        },
        {
            question: mode === 'image' ? "What style of lighting do you prefer?" : "What is the primary pacing?",
            options: mode === 'image' ? ["Warm Golden Hour", "Moody Low-Key Shadows", "Soft Diffused Studio Light", "Neon Nightglow"] : ["Fast & Action-Packed", "Slow & Reflective", "Steady Narrative Arc", "Twist-Filled Mystery"]
        },
        {
            question: "What core focal element should stand out most?",
            options: ["The main character's emotion", "The surrounding environment", "A specific highlighted action", "Subtle foreground details"]
        }
    ];
};

export const refinePromptWithAllUpdates = async (
    originalPrompt: string,
    clarifications: { question: string; answer: string }[],
    graphUpdates: GraphUpdate[],
    onStatusUpdate?: StatusUpdateCallback,
    language: Language = 'en'
  ): Promise<string> => {
    const ai = createAi();
    let updatesPromptSection = "";
    if (graphUpdates.length > 0) {
        const graphList = graphUpdates.map((u) => {
            if (u.type === 'attribute') {
                return `- For entity "${u.entity}", set attribute "${u.attribute}" to "${u.value}".`;
            } else {
                return `- Change relationship between "${u.source}" and "${u.target}" from "${u.oldLabel}" to "${u.newLabel}".`;
            }
        }).join('\n');
        updatesPromptSection += `\nSPECIFIC EDITS TO APPLY:\n${graphList}\n`;
    }
  
    if (clarifications.length > 0) {
        const qaList = clarifications.map((c) => `- User Answer to "${c.question}": "${c.answer}"`).join('\n');
        updatesPromptSection += `\nNEW INFORMATION FROM Q&A:\n${qaList}\n`;
    }
  
    const isMalay = language === 'ms';
    const langRule = isMalay 
      ? "If the original prompt or user answers are in Malay, output the refined prompt naturally in Malay or maintain the language context appropriately."
      : "Maintain the linguistic style and fidelity of the prompt.";

    const promptMessage = `Rewrite the prompt to incorporate specific user edits while strictly preserving all other existing details.
    
Original Prompt: "${originalPrompt}"

${updatesPromptSection}

CRITICAL INSTRUCTIONS:
1. Integrate all specific edits and answers into a single, cohesive, descriptive prompt.
2. ${langRule}
3. YOUR ENTIRE RESPONSE MUST ONLY BE THE FINAL REFINED PROMPT TEXT.
4. DO NOT INCLUDE ANY LABELS, PREFIXES, OR FORMATTING LIKE "Updated Prompt:", "Refined Prompt:", or "**Updated Prompt:**".
5. DO NOT provide any conversational intro or outro.
6. DO NOT use markdown bolding for the whole prompt.

Output the refined prompt text now:`;
  
    const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview'];
    for (const activeModel of candidateModels) {
        try {
            const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
              model: activeModel,
              contents: promptMessage,
              config: {
                  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                  systemInstruction: "You are a prompt engineering expert. Your task is to rewrite user prompts based on provided updates. You MUST output ONLY the final refined text of the prompt. No prefixes, no suffixes, no 'Updated Prompt' labels. Just the prompt itself.",
                  temperature: 0.2,
                  safetySettings: SAFETY_SETTINGS
              }
            }), 2, 1000, onStatusUpdate, `Prompt Refinement (${activeModel})`);
          
            let refined = response.text || originalPrompt;
            refined = refined.replace(/^[\s\W]*(updated|refined|final|new)\s*prompt\s*[:\s-]+/i, '');
            refined = refined.replace(/^\**Updated Prompt:\**\s*/i, '');
            refined = refined.replace(/^\**Refined Prompt:\**\s*/i, '');
            refined = refined.replace(/^Prompt:\s*/i, '');
            refined = refined.trim();
          
            if (refined) return refined;
        } catch (error) {
            console.warn(`Prompt refinement with ${activeModel} failed, trying next candidate:`, error);
        }
    }

    // Heuristic fallback if all API calls fail
    const addedClauses: string[] = [];
    clarifications.forEach(c => addedClauses.push(`${c.answer}`));
    graphUpdates.forEach(g => {
        if (g.type === 'attribute') addedClauses.push(`${g.attribute} is ${g.value}`);
    });
    if (addedClauses.length > 0) {
        return `${originalPrompt}, featuring ${addedClauses.join(', ')}`;
    }
    return originalPrompt;
  };

export const generateImagesFromPrompt = async (
    prompt: string, 
    onStatusUpdate?: StatusUpdateCallback,
    referenceImages: ImagePart[] = [],
    aspectRatio: string = "16:9",
    model: string = 'gemini-2.5-flash-image',
    imageSize: string = '1K'
): Promise<GeneratedImage[]> => {
    const ai = createAi();
    console.log("Generating images for prompt:", prompt, "Model:", model, "Ratio:", aspectRatio, "Size:", imageSize);
    
    if (model.startsWith('imagen-')) {
        try {
            const response = await withRetry<GenerateImagesResponse>(() => ai.models.generateImages({
                model,
                prompt,
                config: {
                    numberOfImages: 4,
                    aspectRatio: aspectRatio as any,
                    outputMimeType: 'image/jpeg'
                }
            }), 2, 1500, onStatusUpdate, "Imagen Generation");
            
            return response.generatedImages.map(img => ({ url: `data:image/jpeg;base64,${img.image.imageBytes}` }));
        } catch (error) {
            console.warn("Imagen generation failed, falling back to Flash image generation:", error);
            // Fall back to Gemini flash image
            return generateImagesFromPrompt(prompt, onStatusUpdate, referenceImages, aspectRatio, 'gemini-2.5-flash-image', imageSize);
        }
    } else {
        // Flash path (Nano Banana)
        const generateOne = async (targetModel: string, index: number): Promise<{ imageUrl: string | null, refusal?: string, error?: string }> => {
            try {
                const parts: any[] = [{ text: prompt }];
                referenceImages.forEach(img => parts.push(img));

                const imageConfig: any = { 
                    aspectRatio,
                    imageSize: (targetModel === 'gemini-3-pro-image-preview' || targetModel === 'gemini-3.1-flash-image-preview') ? imageSize : undefined
                };

                const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                    model: targetModel,
                    contents: { parts },
                    config: { 
                        imageConfig,
                        safetySettings: SAFETY_SETTINGS
                    }
                }), 2, 1000, onStatusUpdate, `Image #${index + 1}`);
                
                let refusalText = '';
                if (response.candidates && response.candidates[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            return { imageUrl: `data:image/png;base64,${part.inlineData.data}` };
                        }
                        if (part.text) {
                            refusalText += part.text;
                        }
                    }
                }
                return { imageUrl: null, refusal: refusalText || undefined };
            } catch (err: any) {
                console.warn(`Image generation #${index + 1} with ${targetModel} encountered error:`, err);
                const errMsg = typeof err?.message === 'string' ? err.message : JSON.stringify(err);
                
                // Try fallback model if primary hit quota
                if (errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
                    if (targetModel !== 'gemini-2.5-flash-image') {
                        console.log(`Retrying image #${index + 1} with fallback gemini-2.5-flash-image...`);
                        try {
                            const fallbackParts: any[] = [{ text: prompt }];
                            referenceImages.forEach(img => fallbackParts.push(img));
                            const fallbackRes = await ai.models.generateContent({
                                model: 'gemini-2.5-flash-image',
                                contents: { parts: fallbackParts },
                                config: { imageConfig: { aspectRatio }, safetySettings: SAFETY_SETTINGS }
                            });
                            if (fallbackRes.candidates?.[0]?.content?.parts) {
                                for (const part of fallbackRes.candidates[0].content.parts) {
                                    if (part.inlineData) {
                                        return { imageUrl: `data:image/png;base64,${part.inlineData.data}` };
                                    }
                                }
                            }
                        } catch (fErr) {
                            console.warn("Fallback image generation also failed:", fErr);
                        }
                    }
                }
                return { imageUrl: null, error: errMsg };
            }
        };

        const targetModel = model || 'gemini-2.5-flash-image';
        const validImages: GeneratedImage[] = [];
        const errors: string[] = [];

        // Stagger requests to avoid 429 quota burst spikes
        // First generate image #1 immediately to ensure quick first result
        const firstResult = await generateOne(targetModel, 0);
        if (firstResult.imageUrl) {
            validImages.push({ url: firstResult.imageUrl });
        } else if (firstResult.refusal) {
            errors.push(firstResult.refusal);
        } else if (firstResult.error) {
            errors.push(firstResult.error);
        }

        // Generate remaining 3 in sequential batches with small delay
        for (let i = 1; i < 4; i++) {
            await delay(350); // slight throttle between calls
            if (onStatusUpdate) onStatusUpdate(`Creating image (${i + 1}/4)...`);
            const res = await generateOne(targetModel, i);
            if (res.imageUrl) {
                validImages.push({ url: res.imageUrl });
            } else if (res.refusal) {
                errors.push(res.refusal);
            } else if (res.error) {
                errors.push(res.error);
            }
        }

        // If at least one image succeeded, return valid images
        if (validImages.length > 0) {
            const results: GeneratedImage[] = [...validImages];
            while (results.length < 4 && errors.length > 0) {
                results.push({ url: null, error: errors.shift() });
            }
            return results;
        }

        // If all failed, provide clean error message
        const lastErrText = errors[0] || "Image generation failed";
        if (lastErrText.includes("429") || lastErrText.includes("RESOURCE_EXHAUSTED") || lastErrText.includes("quota")) {
            throw new Error("Gemini API rate limit or quota exceeded. Please wait a few moments before generating again.");
        }
        throw new Error(lastErrText);
    }
};

export const generateStoryFromPrompt = async (
    prompt: string, 
    onStatusUpdate?: StatusUpdateCallback,
    referenceImages: ImagePart[] = [],
    model: string = 'gemini-3.7-flash',
    storyType: StoryType = 'generic',
    language: Language = 'en'
): Promise<string> => {
    const ai = createAi();
    console.log(`Generating story for prompt [lang: ${language}]:`, prompt, "Model:", model, "StoryType:", storyType);
    
    const isMalay = language === 'ms';
    let instruction = isMalay
      ? `Tulis sebuah cerita pendek dan kreatif dalam Bahasa Melayu berdasarkan prompt (dan gambar jika disediakan). Idea: "${prompt}"`
      : `Write a short, creative story based on the prompt (and images if provided). Idea: "${prompt}"`;

    if (storyType === 'video-prompt') {
        instruction = isMalay
          ? `ANDA IALAH PAKAR PENULISAN PROMPT UNTUK PENJANA VIDEO AI. 
Tugasan anda adalah mengambil idea pengguna "${prompt}" dan menulisnya semula sebagai prompt penjanaan video sinematik dan berorientasikan visual yang sangat terperinci dalam Bahasa Melayu.
Huraikan pergerakan kamera, pencahayaan, tekstur/bahan, dan aksi khusus.
Kekalkan hasil dalam satu perenggan yang padat dengan maklumat visual.`
          : `YOU ARE AN EXPERT IN WRITING PROMPTS FOR AI VIDEO GENERATORS. 
        Your task is to take the user's idea "${prompt}" and rewrite it into a detailed, highly visual, cinematic video generation prompt. 
        Describe camera movements, lighting, materials, and specific actions. 
        Keep the output as a single paragraph dense with visual information.`;
    }
    
    const parts: any[] = [{ text: instruction }];
    referenceImages.forEach(img => parts.push(img));

    const candidateModels = [model, 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite-preview'];
    let lastError: any = null;

    for (const candidateModel of candidateModels) {
        try {
            const response = await withRetry<GenerateContentResponse>(() => ai.models.generateContent({
                model: candidateModel,
                contents: { parts },
                config: { 
                    temperature: 0.8,
                    thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                    safetySettings: SAFETY_SETTINGS
                }
            }), 2, 1000, onStatusUpdate, `Story Generation (${candidateModel})`);
            if (response.text) return response.text;
        } catch (error) {
            lastError = error;
            console.warn(`Story generation with ${candidateModel} failed, trying next candidate...`);
        }
    }

    console.error("Error generating story:", lastError);
    if (lastError?.message?.includes("429") || lastError?.message?.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("Gemini API rate limit or quota exceeded. Please wait a few moments before generating again.");
    }
    throw lastError || new Error("Failed to generate story.");
};
