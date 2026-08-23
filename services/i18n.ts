/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  promptBank: string;
  fluid: string;
  settings: string;
  history: string;
  info: string;
  themeLight: string;
  themeDark: string;
  languageSelect: string;
  english: string;
  malay: string;

  // Settings popover
  model: string;
  clarificationModel: string;
  storyType: string;
  storyGeneric: string;
  storyNarrative: string;
  aspectRatio: string;
  resolution: string;
  landscape: string;
  square: string;
  portrait: string;

  // Prompt Bank & Template Library Modal
  promptBankTitle: string;
  templateLibrary: string;
  templateLibrarySubtitle: string;
  useTemplate: string;
  filterAll: string;
  filterImage: string;
  filterStory: string;
  allCategories: string;
  selectTemplate: string;
  templatesCount: string;
  promptBankClickToPopulate: string;
  promptBankSearchPlaceholder: string;
  promptBankNoResults: string;
  categoryAll: string;

  // Vision & Prompt Input
  visionPromptTitle: string;
  complexityEmpty: string;
  complexitySimple: string;
  complexityDetailed: string;
  complexityAdvanced: string;
  modeImage: string;
  modeStory: string;
  promptPlaceholder: string;
  promptPlaceholderImage: string;
  promptPlaceholderStory: string;
  addReferenceImages: string;
  uploadReferenceImagesTooltip: string;
  removeImageTooltip: string;
  referenceImagesUploaded: string;
  helpMeRefine: string;
  helpMeRefinePrompt: string;
  refiningPrompt: string;
  analyzingPrompt: string;
  refinePromptTooltip: string;
  generate: string;
  generateImages: string;
  generateStory: string;
  generating: string;
  generateTooltip: string;

  // Clarifications
  guidedClarifications: string;
  questionsCount: string;
  newQuestions: string;
  pendingAnswersCount: string;
  cancelAnswers: string;
  updatePrompt: string;
  updatingPrompt: string;
  customNuancePlaceholder: string;
  customAnswerPlaceholder: string;
  skipQuestion: string;
  noActiveClarifications: string;
  getDifferentQuestionsTooltip: string;
  refresh: string;
  clickUpdatePromptPrompt: string;
  thinkingSteps: string[];

  // Output Gallery & Display
  visualGalleryTitle: string;
  generatedShowcase: string;
  storyWorkspace: string;
  generatingImage: string;
  generationFailed: string;
  slotEmpty: string;
  readyForPrompt: string;
  craftingNarrative: string;
  storyCanvasReady: string;
  storyCanvasReadyDesc: string;
  useAsPromptTooltip: string;
  copyToClipboard: string;
  exportAll: string;
  download: string;
  downloadImage: string;
  copyPrompt: string;
  copied: string;
  useAsReference: string;
  applyStoryToPrompt: string;
  confirmApplyStory: string;
  confirmApplyStoryDesc: string;
  replacePromptTitle: string;
  replacePromptDesc: string;
  actionCannotBeUndone: string;
  yesReplace: string;
  applyNow: string;
  cancel: string;
  outdatedBanner: string;
  resultsOutdated: string;
  resultsOutdatedDesc: string;
  emptyImageTitle: string;
  emptyImageSubtitle: string;
  emptyStoryTitle: string;
  emptyStorySubtitle: string;
  lightboxTitle: string;
  close: string;

  // History Sidebar
  sessionHistoryTitle: string;
  sessionHistory: string;
  sessionHistoryNote: string;
  noHistory: string;
  historyItemRestored: string;

  // Welcome Overlay & Info Modal
  welcomeGreeting: string;
  welcomeIntro: string;
  pillar1Title: string;
  pillar1Desc: string;
  pillar2Title: string;
  pillar2Desc: string;
  pillar3Title: string;
  pillar3Desc: string;
  starterInspiration: string;
  startCreating: string;
  howItWorks: string;
  howItWorksDesc: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  giveFeedback: string;
  feedbackSubtext: string;
  viewWelcomeScreen: string;

  // Mobile Navigation & FAB
  navEditor: string;
  navPreview: string;
  switchToPreview: string;
  switchToEditor: string;

  // Popups & Status
  switchedToImageMode: string;
  switchedToStoryMode: string;
  modeSwitchClarificationTip: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appTitle: "Ka!ro",
    appSubtitle: "Proactive Co-Creator",
    promptBank: "Prompt Bank",
    fluid: "Fluid",
    settings: "Settings",
    history: "History",
    info: "Info",
    themeLight: "Light",
    themeDark: "Dark",
    languageSelect: "Language",
    english: "English",
    malay: "Bahasa Melayu",

    model: "Model",
    clarificationModel: "Clarification Model",
    storyType: "Story Type",
    storyGeneric: "Generic",
    storyNarrative: "Narrative",
    aspectRatio: "Aspect Ratio",
    resolution: "Resolution",
    landscape: "Landscape",
    square: "Square",
    portrait: "Portrait",

    promptBankTitle: "Template Library",
    templateLibrary: "Template Library",
    templateLibrarySubtitle: "Select from predefined prompt templates to automatically populate your canvas with high-quality starting points.",
    useTemplate: "Use Template",
    filterAll: "All Types",
    filterImage: "Image Prompts",
    filterStory: "Story & Copy Prompts",
    allCategories: "All Categories",
    selectTemplate: "Select Template",
    templatesCount: "templates",
    promptBankClickToPopulate: "Click to populate",
    promptBankSearchPlaceholder: "Search templates, categories, keywords, or tags...",
    promptBankNoResults: "No matching prompt templates found",
    categoryAll: "All",

    visionPromptTitle: "Vision & Prompt",
    complexityEmpty: "Empty",
    complexitySimple: "Simple",
    complexityDetailed: "Detailed",
    complexityAdvanced: "Advanced",
    modeImage: "Image",
    modeStory: "Story",
    promptPlaceholder: "Describe your creative vision...",
    promptPlaceholderImage: "Describe an image you want to create, e.g., 'a cyberpunk teahouse in the rain at midnight'...",
    promptPlaceholderStory: "Describe a story idea, e.g., 'a retired lighthouse keeper discovers a mechanical whale carrying ancient memories'...",
    addReferenceImages: "Add Reference Images",
    uploadReferenceImagesTooltip: "Upload reference image (PNG, JPG, WebP)",
    removeImageTooltip: "Remove image",
    referenceImagesUploaded: "reference image(s) uploaded",
    helpMeRefine: "Help me refine prompt",
    helpMeRefinePrompt: "Help me refine prompt",
    refiningPrompt: "Refining...",
    analyzingPrompt: "Analyzing...",
    refinePromptTooltip: "Analyze prompt and generate clarifying questions",
    generate: "Generate",
    generateImages: "Generate",
    generateStory: "Generate Story",
    generating: "Generating...",
    generateTooltip: "Generate content based on prompt and answers",

    guidedClarifications: "Guided Clarifications",
    questionsCount: "questions",
    newQuestions: "New Questions",
    pendingAnswersCount: "pending answer",
    cancelAnswers: "Cancel answers",
    updatePrompt: "Update prompt",
    updatingPrompt: "Updating...",
    customNuancePlaceholder: "Type a custom nuance or specific preference...",
    customAnswerPlaceholder: "Type a custom nuance or specific preference...",
    skipQuestion: "Skip",
    noActiveClarifications: "No clarifications active. Click 'Help me refine prompt' to explore guided suggestions.",
    getDifferentQuestionsTooltip: "Generate fresh clarifying questions",
    refresh: "Refresh",
    clickUpdatePromptPrompt: "Click 'Update prompt' above to blend your selected answers into the prompt.",
    thinkingSteps: [
      "Analyzing prompt for ambiguities...",
      "Identifying vague attributes...",
      "Detecting implicit entities...",
      "Evaluating semantic uncertainties...",
      "Drafting clarification questions..."
    ],

    visualGalleryTitle: "Visual Output Gallery",
    generatedShowcase: "Generated Showcase",
    storyWorkspace: "Story Narrative Canvas",
    generatingImage: "Generating image...",
    generationFailed: "Generation failed",
    slotEmpty: "Slot Empty",
    readyForPrompt: "Enter a prompt and hit Generate to render this frame",
    craftingNarrative: "Crafting your narrative story...",
    storyCanvasReady: "Story Canvas Ready",
    storyCanvasReadyDesc: "Describe your narrative concept and click Generate to bring your story to life.",
    useAsPromptTooltip: "Apply this scene description directly into the prompt box",
    copyToClipboard: "Copy to clipboard",
    exportAll: "Export All",
    download: "Download",
    downloadImage: "Download",
    copyPrompt: "Copy Prompt",
    copied: "Copied!",
    useAsReference: "Use as reference",
    applyStoryToPrompt: "Apply story to prompt",
    confirmApplyStory: "Apply Story to Prompt?",
    confirmApplyStoryDesc: "This will replace your current prompt with a visual scene description derived from this story.",
    replacePromptTitle: "Replace current prompt with this story?",
    replacePromptDesc: "This will overwrite your existing prompt in the editor with this narrative.",
    actionCannotBeUndone: "This action cannot be undone.",
    yesReplace: "Yes, Replace",
    applyNow: "Apply Now",
    cancel: "Cancel",
    outdatedBanner: "Prompt has been updated since these results were generated.",
    resultsOutdated: "Results may be outdated",
    resultsOutdatedDesc: "The prompt has changed since these outputs were generated.",
    emptyImageTitle: "Ready to create",
    emptyImageSubtitle: "Enter a prompt and explore guided clarifications to generate stunning visuals.",
    emptyStoryTitle: "Story canvas ready",
    emptyStorySubtitle: "Describe your narrative concept to craft an immersive story.",
    lightboxTitle: "High-Resolution Image Preview",
    close: "Close",

    sessionHistoryTitle: "Session History",
    sessionHistory: "Session History",
    sessionHistoryNote: "Sessions are saved locally in your browser so you can restore previous prompts and creations.",
    noHistory: "Your generation history will appear here.",
    historyItemRestored: "Session restored",

    welcomeGreeting: "Ka!ro",
    welcomeIntro: "An intelligent co-creation canvas that uncovers implicit assumptions, drafts guided clarifications, and lets you refine ideas before rendering images or stories.",
    pillar1Title: "Guided Clarifications",
    pillar1Desc: "Proactively detects ambiguities and drafts key questions.",
    pillar2Title: "Smart Prompt Refinement",
    pillar2Desc: "Dynamically blends your answers into rich, high-fidelity prompts.",
    pillar3Title: "Full Showcase",
    pillar3Desc: "Generate high-resolution visuals or narrative stories.",
    starterInspiration: "Quick Starter Prompts",
    startCreating: "Start Creating",
    howItWorks: "How it works",
    howItWorksDesc: "Start with a prompt, template, or reference image. The AI analyzes implicit gaps and provides clarifying questions to help you refine your concept.",
    step1Title: "Draft & Prompt",
    step1Desc: "Start with your idea, a template from Prompt Bank, or a reference image.",
    step2Title: "Clarify & Refine",
    step2Desc: "Select option chips or type custom responses, then click 'Update prompt'.",
    step3Title: "Generate & Iterate",
    step3Desc: "Render high-resolution visuals or narrative stories, and reuse them as references.",
    giveFeedback: "Give Feedback",
    feedbackSubtext: "Help us improve Ka!ro",
    viewWelcomeScreen: "View Welcome Screen",

    navEditor: "Editor",
    navPreview: "Preview",
    switchToPreview: "Switch to Preview mode",
    switchToEditor: "Switch to Editor mode",

    switchedToImageMode: "Switched to Image Mode",
    switchedToStoryMode: "Switched to Story Mode",
    modeSwitchClarificationTip: "Clarifications are ready for your next prompt. Click 'Help me refine prompt' to explore questions tailored for your concept."
  },
  ms: {
    appTitle: "Ka!ro",
    appSubtitle: "Rakan Pencipta Proaktif",
    promptBank: "Bank Prompt",
    fluid: "Cecair",
    settings: "Tetapan",
    history: "Sejarah",
    info: "Maklumat",
    themeLight: "Cerah",
    themeDark: "Gelap",
    languageSelect: "Bahasa",
    english: "English",
    malay: "Bahasa Melayu",

    model: "Model AI",
    clarificationModel: "Model Penjelasan",
    storyType: "Jenis Cerita",
    storyGeneric: "Umum",
    storyNarrative: "Naratif",
    aspectRatio: "Nisbah Aspek",
    resolution: "Resolusi",
    landscape: "Lanskap",
    square: "Segi Empat",
    portrait: "Potret",

    promptBankTitle: "Pustaka Templat",
    templateLibrary: "Pustaka Templat",
    templateLibrarySubtitle: "Pilih daripada templat prompt untuk memulakan kanvas anda dengan draf berkualiti tinggi secara automatik.",
    useTemplate: "Gunakan Templat",
    filterAll: "Semua Jenis",
    filterImage: "Prompt Imej",
    filterStory: "Prompt Cerita & Iklan",
    allCategories: "Semua Kategori",
    selectTemplate: "Pilih Templat",
    templatesCount: "templat",
    promptBankClickToPopulate: "Klik untuk guna",
    promptBankSearchPlaceholder: "Cari templat, kategori, kata kunci, atau tag...",
    promptBankNoResults: "Tiada templat prompt yang sepadan dijumpai",
    categoryAll: "Semua",

    visionPromptTitle: "Visi & Prompt",
    complexityEmpty: "Kosong",
    complexitySimple: "Mudah",
    complexityDetailed: "Terperinci",
    complexityAdvanced: "Lanjutan",
    modeImage: "Gambar",
    modeStory: "Cerita",
    promptPlaceholder: "Huraikan visi kreatif anda...",
    promptPlaceholderImage: "Terangkan gambar yang ingin anda cipta, cth: 'kedai teh cyberpunk dalam hujan tengah malam'...",
    promptPlaceholderStory: "Terangkan idea cerita anda, cth: 'seorang penjaga rumah api bersara menemui paus mekanikal berzaman'...",
    addReferenceImages: "Tambah Gambar Rujukan",
    uploadReferenceImagesTooltip: "Muat naik gambar rujukan (PNG, JPG, WebP)",
    removeImageTooltip: "Padam gambar",
    referenceImagesUploaded: "gambar rujukan dimuat naik",
    helpMeRefine: "Bantu perincikan prompt",
    helpMeRefinePrompt: "Bantu perincikan prompt",
    refiningPrompt: "Memperincikan...",
    analyzingPrompt: "Menganalisis...",
    refinePromptTooltip: "Analisis prompt dan jana soalan penjelasan",
    generate: "Jana",
    generateImages: "Jana Gambar",
    generateStory: "Jana Cerita",
    generating: "Menjana...",
    generateTooltip: "Jana kandungan berdasarkan prompt dan jawapan anda",

    guidedClarifications: "Penjelasan Berpandu",
    questionsCount: "soalan",
    newQuestions: "Soalan Baharu",
    pendingAnswersCount: "jawapan menunggu",
    cancelAnswers: "Batal jawapan",
    updatePrompt: "Kemas kini prompt",
    updatingPrompt: "Mengemas kini...",
    customNuancePlaceholder: "Taip nuansa tersuai atau pilihan khusus anda...",
    customAnswerPlaceholder: "Taip nuansa tersuai atau pilihan khusus anda...",
    skipQuestion: "Langkau",
    noActiveClarifications: "Tiada penjelasan aktif. Klik 'Bantu perincikan prompt' untuk meneroka cadangan berpandu.",
    getDifferentQuestionsTooltip: "Jana soalan penjelasan baharu",
    refresh: "Segarkan",
    clickUpdatePromptPrompt: "Klik 'Kemas kini prompt' di atas untuk menggabungkan pilihan jawapan ke dalam prompt.",
    thinkingSteps: [
      "Menganalisis kekaburan dalam prompt...",
      "Mengenal pasti atribut yang kurang jelas...",
      "Mengesan entiti tersirat...",
      "Menilai ketidakpastian semantik...",
      "Merangka soalan-soalan penjelasan..."
    ],

    visualGalleryTitle: "Galeri Hasil Visual",
    generatedShowcase: "Pameran Hasil",
    storyWorkspace: "Kanvas Naratif Cerita",
    generatingImage: "Menjana imej...",
    generationFailed: "Penjanaan gagal",
    slotEmpty: "Slot Kosong",
    readyForPrompt: "Masukkan prompt dan klik Jana untuk menghasilkan bingkai ini",
    craftingNarrative: "Sedang merangka cerita naratif anda...",
    storyCanvasReady: "Kanvas Cerita Sedia",
    storyCanvasReadyDesc: "Huraikan konsep naratif anda dan klik Jana untuk menghidupkan cerita.",
    useAsPromptTooltip: "Gunakan huraian adegan ini terus ke dalam kotak prompt",
    copyToClipboard: "Salin ke papan klip",
    exportAll: "Eksport Semua",
    download: "Muat Turun",
    downloadImage: "Muat Turun",
    copyPrompt: "Salin Prompt",
    copied: "Disalin!",
    useAsReference: "Guna sebagai rujukan",
    applyStoryToPrompt: "Gunakan cerita pada prompt",
    confirmApplyStory: "Gunakan Cerita pada Prompt?",
    confirmApplyStoryDesc: "Ini akan menggantikan prompt semasa anda dengan huraian adegan visual daripada cerita ini.",
    replacePromptTitle: "Gantikan prompt semasa dengan cerita ini?",
    replacePromptDesc: "Ini akan menggantikan prompt sedia ada dalam editor dengan naratif ini.",
    actionCannotBeUndone: "Tindakan ini tidak boleh dibatalkan.",
    yesReplace: "Ya, Gantikan",
    applyNow: "Gunakan Sekarang",
    cancel: "Batal",
    outdatedBanner: "Prompt telah dikemas kini sejak hasil ini dijana.",
    resultsOutdated: "Hasil mungkin lapuk",
    resultsOutdatedDesc: "Prompt telah berubah sejak hasil ini dijana.",
    emptyImageTitle: "Sedia untuk mencipta",
    emptyImageSubtitle: "Masukkan prompt dan terokai soalan berpandu untuk menjana visual yang memukau.",
    emptyStoryTitle: "Kanvas cerita sedia",
    emptyStorySubtitle: "Huraikan konsep naratif anda untuk menghasilkan cerita yang memikat.",
    lightboxTitle: "Pratonton Gambar Resolusi Tinggi",
    close: "Tutup",

    sessionHistoryTitle: "Sejarah Sesi",
    sessionHistory: "Sejarah Sesi",
    sessionHistoryNote: "Sesi disimpan secara setempat dalam penyemak imbas anda supaya anda boleh memulihkan prompt dan ciptaan terdahulu.",
    noHistory: "Sejarah penjanaan anda akan dipaparkan di sini.",
    historyItemRestored: "Sesi telah dipulihkan",

    welcomeGreeting: "Ka!ro",
    welcomeIntro: "Kanvas penciptaan bersama pintar yang mencungkil andaian tersirat, merangka penjelasan berpandu, dan membantu anda memperhalusi idea sebelum menjana gambar atau cerita.",
    pillar1Title: "Penjelasan Berpandu",
    pillar1Desc: "Secara proaktif mengesan kekaburan dan merangka soalan utama.",
    pillar2Title: "Penalaan Prompt Pintar",
    pillar2Desc: "Menggabungkan jawapan anda secara dinamik menjadi prompt bermutu tinggi.",
    pillar3Title: "Pameran Menyeluruh",
    pillar3Desc: "Jana gambar resolusi tinggi atau cerita naratif penuh.",
    starterInspiration: "Prompt Permulaan Pantas",
    startCreating: "Mula Mencipta",
    howItWorks: "Cara Penggunaan",
    howItWorksDesc: "Mulakan dengan idea prompt, templat dari Bank Prompt, atau gambar rujukan. AI akan menganalisis ruang penambahbaikan dan menyediakan soalan berpandu.",
    step1Title: "Draf & Prompt",
    step1Desc: "Mulakan dengan idea anda, templat Bank Prompt, atau gambar rujukan.",
    step2Title: "Jelas & Perincikan",
    step2Desc: "Pilih pilihan atau taip respons tersuai, kemudian klik 'Kemas kini prompt'.",
    step3Title: "Jana & Ulang",
    step3Desc: "Jana visual resolusi tinggi atau cerita naratif, dan guna semula sebagai rujukan.",
    giveFeedback: "Beri Maklum Balas",
    feedbackSubtext: "Bantu kami menambah baik Ka!ro",
    viewWelcomeScreen: "Lihat Skrin Selamat Datang",

    navEditor: "Editor",
    navPreview: "Pratonton",
    switchToPreview: "Tukar ke mod Pratonton",
    switchToEditor: "Tukar ke mod Editor",

    switchedToImageMode: "Bertukar ke Mod Gambar",
    switchedToStoryMode: "Bertukar ke Mod Cerita",
    modeSwitchClarificationTip: "Penjelasan sedia untuk prompt anda yang seterusnya. Klik 'Bantu perincikan prompt' untuk meneroka soalan khusus bagi konsep anda."
  }
};

export const getTranslation = (lang?: Language | string): Translations => {
  if (lang === 'ms') return TRANSLATIONS.ms;
  return TRANSLATIONS.en;
};
