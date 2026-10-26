import { PRIVATE_PAGE_METADATA } from '@/app/lib/seo';
export const metadata = { title: 'Active learning | LeseLaut', ...PRIVATE_PAGE_METADATA };
export default function PrivateLayout({ children }: { children: React.ReactNode }) { return children; }
