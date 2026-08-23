
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Candidate {
  name: string; 
}

export interface Attribute {
  name:string;
  presence_in_prompt: boolean;
  value: Candidate[];
}

export interface Entity {
  name: string;
  presence_in_prompt: boolean;
  description: string;
  alternatives: Candidate[] | null;
  attributes: Attribute[];
}

export interface Relationship {
  source: string;
  target: string;
  label: string;
  alternatives?: Candidate[];
  presence_in_prompt?: boolean;
}

export interface BeliefState {
  entities: Entity[];
  relationships: Relationship[];
  prompt?: string;
}

export interface Clarification {
  question: string;
  options: string[];
}

export interface ImagePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export interface GeneratedImage {
    url: string | null;
    error?: string;
}

export type Mode = 'image' | 'story';
export type Language = 'en' | 'ms';
export type ImageSize = '512px' | '1K' | '2K' | '4K';
export type StoryType = 'generic' | 'video-prompt';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '1:4' | '1:8' | '4:1' | '8:1';

export type GraphUpdate = 
  | { type: 'attribute'; entity: string; attribute: string; value: string }
  | { type: 'relationship'; source: string; target: string; oldLabel: string; newLabel: string };

export interface AttributeDiff {
  entity: string;
  attribute: string;
  oldValue: string;
  newValue: string;
}

export interface RelationshipDiff {
  source: string;
  target: string;
  oldLabel: string;
  newLabel: string;
}

export interface ClarificationDiff {
  question: string;
  answer: string;
}

export interface AppliedDiff {
  id: string;
  timestamp: number;
  previousPrompt: string;
  updatedPrompt: string;
  attributeChanges: AttributeDiff[];
  relationshipChanges: RelationshipDiff[];
  clarificationChanges: ClarificationDiff[];
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  mode: Mode;
  thumbnail?: string; // Optional: first image thumbnail or a representation
}

export interface SessionState {
  prompt: string;
  mode: Mode;
  pendingAttributeUpdates: Record<string, string>;
  pendingRelationshipUpdates: Record<string, string>;
  pendingClarificationAnswers: Record<string, string>;
  aspectRatio?: AspectRatio;
  resolution?: string;
  selectedModel?: string;
  selectedClarificationModel?: string;
  storyType?: StoryType;
  language?: Language;
  beliefGraph?: BeliefState | null;
  clarifications?: Clarification[];
  answeredQuestions?: string[];
  skippedQuestions?: string[];
  activeToolTab?: 'clarify' | 'graph' | 'attributes';
  savedAt?: number;
}
