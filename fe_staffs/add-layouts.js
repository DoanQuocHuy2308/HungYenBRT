const fs = require('fs');
const path = require('path');
const layouts = {
  'login': 'Đăng Nhập',
  'single-ticket': 'Bán Vé Lượt',
  'time-ticket': 'Bán Vé Thời Gian',
  'check-ticket': 'Kiểm Tra Vé',
  'restock': 'Bổ Sung Vé',
  'lookup': 'Tra Cứu',
  'statistics': 'Thống Kê'
};
const base = './app';
for (const [dir, title] of Object.entries(layouts)) {
  const file = path.join(base, dir, 'layout.tsx');
  const content = `import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title} | BRT Staff',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;
  fs.writeFileSync(file, content);
  console.log('Created ' + file);
}
