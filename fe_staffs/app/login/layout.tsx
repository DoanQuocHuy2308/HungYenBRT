import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng Nhập | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
