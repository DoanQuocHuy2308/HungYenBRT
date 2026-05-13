import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bán Vé Lượt | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
