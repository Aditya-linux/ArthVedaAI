import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'News & Sentiment | ArthVeda AI',
    description: 'From data to financial wisdom, powered by AI.',
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
