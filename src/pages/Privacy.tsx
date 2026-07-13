import { Link } from 'react-router-dom';

export const Privacy = () => (
  <main className="mx-auto max-w-3xl px-6 py-12 font-sans text-charcoal">
    <Link to="/login" className="text-[13px] font-semibold text-amber-gold hover:text-amber-gold/80">
      Back to sign in
    </Link>
    <h1 className="mt-6 font-serif text-[32px] font-bold">Privacy Policy</h1>
    <p className="mt-4 text-[15px] leading-7 text-gray-600">
      Oraculum stores administrator account details, session metadata, and library operational
      records required to run circulation workflows. Profile information such as name, email, and
      phone is used for account management and support.
    </p>
    <p className="mt-4 text-[15px] leading-7 text-gray-600">
      Member and borrowing data is processed solely for library operations. Contact your institution
      administrator for data retention, export, or deletion requests.
    </p>
  </main>
);
