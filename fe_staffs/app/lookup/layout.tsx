import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tra Cứu | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
