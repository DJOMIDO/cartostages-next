import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
        <p>
          CartoStages NLP - sources{" "}
          <Link
            href="http://w3.erss.univ-tlse2.fr/membre/tanguy/offres.html"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground"
          >
            WAGA / ERSS Toulouse
          </Link>
        </p>
        <p>Master IdL - Université Grenoble Alpes</p>
      </div>
    </footer>
  );
}
