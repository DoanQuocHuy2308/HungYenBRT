import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bổ Sung Vé | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
