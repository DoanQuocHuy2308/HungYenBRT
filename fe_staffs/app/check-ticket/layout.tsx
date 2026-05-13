import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kiểm Tra Vé | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
