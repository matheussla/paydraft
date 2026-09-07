import { ReactNode } from 'react';

interface IWelcomeCardProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

export function WelcomeCard({ title, subtitle, children }: IWelcomeCardProps) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-8">{subtitle}</p>
      {children}
    </div>
  );
}
