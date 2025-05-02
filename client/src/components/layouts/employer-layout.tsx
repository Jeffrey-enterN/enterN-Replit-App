import { ReactNode } from 'react';
import EmployerNavbar from './employer-navbar';

interface EmployerLayoutProps {
  children: ReactNode;
}

export default function EmployerLayout({ children }: EmployerLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <EmployerNavbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}