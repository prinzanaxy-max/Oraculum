import { Library } from 'lucide-react';
import clsx from 'clsx';

interface OraculumLogoProps {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
}

export const OraculumLogo = ({
  className,
  iconClassName,
  wordmarkClassName,
  showWordmark = true,
}: OraculumLogoProps) => (
  <div className={clsx('flex items-center gap-3', className)}>
    <div
      className={clsx(
        'flex h-8 w-8 items-center justify-center rounded-lg bg-amber-gold/10 text-amber-gold',
        iconClassName
      )}
    >
      <Library className="h-5 w-5" />
    </div>
    {showWordmark && (
      <span className={clsx('font-serif text-2xl font-bold tracking-tight text-charcoal', wordmarkClassName)}>
        Oraculum
      </span>
    )}
  </div>
);
