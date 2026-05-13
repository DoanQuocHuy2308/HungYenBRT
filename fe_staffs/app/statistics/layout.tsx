import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thống Kê | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
