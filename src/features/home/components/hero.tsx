export function Hero() {
  return (
    <section className="flex min-h-[calc(100vh-80px)] items-center justify-center">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary">
          Since 1997
        </p>

        <h1 className="text-5xl font-bold leading-tight md:text-7xl">
          Premium Wedding
          <br />
          Invitation Studio
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground">
          Crafting elegant invitations that become cherished memories.
          Discover premium invitation collections designed for every
          celebration.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-primary px-8 py-3 text-primary-foreground">
            Explore Collection
          </button>

          <button className="rounded-lg border px-8 py-3">
            Make an Enquiry
          </button>
        </div>
      </div>
    </section>
  );
}