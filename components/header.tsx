import Link from 'next/link';
import Image from 'next/image';
import { IconSeparator, IconSparkles } from '@/components/ui/icons';

export async function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full px-4 border-b h-20 shrink-0 bg-background backdrop-blur-xl">
      <span className="inline-flex items-center home-links whitespace-nowrap">
        <a href="https://www.thegroup.ai" rel="noopener" target="_blank">
          <Image src="/alfred_logo.png" alt="Your Logo" width={150} height={54} className="w-auto h-12" />
        </a>
        <IconSeparator className="w-6 h-6 text-muted-foreground/20" />
        <Link href="/">
          <span className="text-lg font-bold">
            <IconSparkles className="inline mr-0 w-4 sm:w-5 mb-0.5" /> AI
          </span>
        </Link>
      </span>
    </header>
  );
}
