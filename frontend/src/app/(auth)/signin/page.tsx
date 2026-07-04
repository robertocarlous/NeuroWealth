import { redirect } from "next/navigation";
import { SIGN_IN_PATH } from "@/lib/auth-constants";

interface SignInPageProps {
  searchParams?: { from?: string };
}

export default function SignInPage({ searchParams }: SignInPageProps) {
  const destination = searchParams?.from
    ? `${SIGN_IN_PATH}?from=${encodeURIComponent(searchParams.from)}`
    : SIGN_IN_PATH;

  redirect(destination);
}
