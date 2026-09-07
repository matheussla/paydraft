import { Button } from '../../shared/components';
import { WelcomeCard } from './components/WelcomeCard';
import { useCounter } from './hooks/useCounter';

export function WelcomeFeature() {
  const { count, increment } = useCounter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <WelcomeCard title="Paydraft" subtitle="Local invoicing app">
        <Button onClick={increment}>
          Count: {count}
        </Button>
      </WelcomeCard>
    </div>
  );
}
