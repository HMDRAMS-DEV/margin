import Link from "next/link";

export function Logo() {
  return (
    <Link className="logo" href="/" aria-label="Margin home">
      <span className="logoRule" aria-hidden="true" />
      Margin
    </Link>
  );
}
