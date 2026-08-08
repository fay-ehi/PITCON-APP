import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";

function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-white">
      <Container className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:justify-between">
        <Logo />
        <p className="text-small text-gray-500">
          © {year} PITCON. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

export { SiteFooter };
