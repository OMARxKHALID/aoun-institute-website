import PageHero from "@/components/ui/page-hero";

const LegalPage = ({ tag, title, updated, sections }) => (
  <main>
    <PageHero tag={tag} title={title} text={`Last updated: ${updated}`} />
    <article className="mx-auto flex max-w-4xl flex-col gap-10 px-8 pb-24">
      {sections.map(({ heading, body }) => (
        <section key={heading} className="flex flex-col gap-3 border-b border-white/10 pb-10">
          <h2 className="font-machina text-3xl">{heading}</h2>
          {body.map((p) => (
            <p key={p} className="text-lg font-normal leading-relaxed text-white/70">
              {p}
            </p>
          ))}
        </section>
      ))}
    </article>
  </main>
);

export default LegalPage;
