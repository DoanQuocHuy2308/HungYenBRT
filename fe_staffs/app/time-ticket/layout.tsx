import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bán Vé Thời Gian | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
