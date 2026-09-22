import AdvisorClient from './AdvisorClient';

export const metadata = {
  title: 'Location Advisor — SriGen',
  description: 'Find the best business for any location in India using population, competition, nearby places and climate data.',
};

export default function AdvisorPage() {
  return <AdvisorClient />;
}