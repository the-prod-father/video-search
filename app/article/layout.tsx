import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Reality of Video AI in Public Safety | Gavin McNamara',
  description: 'Why training data quality matters more than model size. Understanding what determines whether AI video analysis succeeds or fails in real-world law enforcement deployments.',
  openGraph: {
    title: 'The Reality of Video AI in Public Safety',
    description: 'Why training data quality matters more than model size. Lessons from 7 years at Axon building Evidence.com.',
    images: [
      {
        url: '/body-cams.webp',
        width: 1200,
        height: 630,
        alt: 'Body-worn camera on police officer',
      },
    ],
    type: 'article',
    authors: ['Gavin McNamara'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Reality of Video AI in Public Safety',
    description: 'Why training data quality matters more than model size. Lessons from 7 years at Axon.',
    images: ['/body-cams.webp'],
  },
};

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
