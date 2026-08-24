import type { LucideIcon } from "lucide-react";

interface ProcessStepCardProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function ProcessStepCard({
  step,
  title,
  description,
  icon: Icon,
}: ProcessStepCardProps) {
  return (
    <article
      className="
        glass
        group
        relative
        h-full
        overflow-hidden
        rounded-3xl
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-primary/20
        hover:shadow-[0_20px_50px_rgba(122,31,43,0.14)]
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -left-20
          -top-20
          h-40
          w-40
          rounded-full
          bg-primary/8
          opacity-0
          blur-3xl
          transition-opacity
          duration-500
          group-hover:opacity-100
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-px
          w-2/3
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-white/30
          to-transparent
        "
      />

      <div className="relative z-10 flex h-full flex-col items-center p-8 text-center">
        <span
          className="
            mb-3
            text-sm
            font-semibold
            tracking-[0.3em]
            text-primary
          "
        >
          {String(step).padStart(2, "0")}
        </span>

        <div
          className="
            mb-6
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            border
            border-primary/10
            bg-primary/10
            text-primary
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:bg-primary
            group-hover:text-primary-foreground
          "
        >
          <Icon className="h-8 w-8" />
        </div>

        <h3
          className="
            mb-3
            text-2xl
            font-semibold
            text-foreground
            transition-colors
            duration-300
            group-hover:text-primary
          "
        >
          {title}
        </h3>

        <p className="text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      </div>
    </article>
  );
}