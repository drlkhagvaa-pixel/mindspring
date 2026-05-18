export type Page =
  | 'home'
  | 'psych-login'
  | 'psych-register'
  | 'psych-dashboard'
  | 'psych-client-detail'
  | 'psych-assign-tests'
  | 'psych-view-results'
  | 'client-login'
  | 'client-tests'
  | 'test-taking'
  | 'psych-reset-password'
  | 'psych-subscription'
  | 'psych-pending'
  | 'admin-panel';

export type SubscriptionStatus = 'pending' | 'active' | 'expired';
export type SubscriptionPlan = 'monthly' | 'yearly';

export interface Psychologist {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionExpiresAt?: string;
}

export interface Client {
  id: string;
  psychologistId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  notes?: string;
  accessCode: string;
  assignedTests: string[];
  completedTests: TestResult[];
  createdAt: string;
}

export interface TestResult {
  testId: string;
  answers: { questionId: string; value?: number; textValue?: string }[];
  subscaleScores: { [key: string]: number };
  totalScore: number;
  interpretation: string;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe' | 'extreme';
  completedAt: string;
}

export interface Question {
  id: string;
  text: string;
  imageUrl?: string;
  reversed?: boolean;
  subscale?: string;
}

export interface AnswerOption {
  label: string;
  value: number;
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  severity: 'minimal' | 'mild' | 'moderate' | 'severe' | 'extreme';
  description: string;
  recommendation: string;
}

export interface Subscale {
  id: string;
  name: string;
  questionIds: string[];
  ranges: ScoreRange[];
  multiplier?: number;
}

export interface PsychTest {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  instructions: string;
  timeMinutes: number;
  questions: Question[];
  answerOptions: AnswerOption[];
  subscales?: Subscale[];
  ranges: ScoreRange[];
  disclaimer?: string;
  specialScoring?: string;
  testType?: 'choice' | 'text' | 'image-choice';
}

export type AppView = {
  page: Page;
  selectedClientId?: string;
  selectedTestId?: string;
  activeTestResultIndex?: number;
};
