import { Link } from 'react-router-dom';

export const Terms = () => (
  <main className="mx-auto max-w-3xl px-6 py-12 font-sans text-charcoal">
    <Link to="/login" className="text-[13px] font-semibold text-amber-gold hover:text-amber-gold/80">
      Back to sign in
    </Link>
    <h1 className="mt-6 font-serif text-[32px] font-bold">Terms of Service</h1>
    <p className="mt-4 text-[15px] leading-7 text-gray-600">
      Oraculum is provided to authorized university library staff for catalog, circulation, and
      member management. You agree to use the platform responsibly, protect member data, and follow
      your institution&apos;s library policies when performing administrative actions.
    </p>
    <p className="mt-4 text-[15px] leading-7 text-gray-600">
      Access may be suspended if credentials are shared, misused, or used to perform unauthorized
      changes to library records.
    </p>
  </main>
);
