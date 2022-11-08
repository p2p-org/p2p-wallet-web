import type { MapActionWithNoParams } from '../common';

type OnboardingComplexActions = never;

type OnboardingSimpleActionNames = 'Create_Start_Button' | 'Restore_Start_Button';

type OnboardingSimpleActions = MapActionWithNoParams<OnboardingSimpleActionNames>;

export type OnboardingActions = OnboardingSimpleActions | OnboardingComplexActions;
