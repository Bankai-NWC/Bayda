import { redirect } from 'next/navigation';

import { VerifySuccessClient } from './_components/VerifySuccessClient';

interface Props {
  searchParams: Promise<{ success?: string; error?: string; user?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { success, error, user } = await searchParams;

  if (success === 'true' && user) {
    const userData = JSON.parse(decodeURIComponent(user));
    return <VerifySuccessClient user={userData} />;
  }

  if (error) {
    return (
      <div>
        <h1>The link is invalid</h1>
        <a href="/auth/pending-verification">Request a new one</a>
      </div>
    );
  }

  redirect('/auth/pending-verification');
}
