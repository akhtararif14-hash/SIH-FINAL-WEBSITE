import OnboardingClient from './OnboardingClient';

export const metadata = {
  title: 'Welcome — SriGen',
  description: 'Set up SriGen in three quick steps: language, your details, and sign in.',
};

export default function OnboardingPage() {
  return <OnboardingClient />;
}