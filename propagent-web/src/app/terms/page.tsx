export const metadata = {
  title: 'Terms of Service — Agent Loop',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-charcoal-900 mb-6">Terms of Service</h1>
      <p className="text-charcoal-600 text-sm italic">Last updated: April 2026</p>
      <p className="text-charcoal-600">
        These terms govern your use of Agent Loop (Pty) Ltd (&ldquo;Agent Loop&rdquo;,
        &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account or using the platform
        you agree to be bound by them.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">1. Your account</h2>
      <p className="text-charcoal-600">
        You are responsible for keeping your login credentials secure and for any
        activity that happens under your account. You must provide accurate information
        during registration and keep it up to date.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">2. Subscription &amp; payments</h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>Paid plans are billed monthly in South African Rand (ZAR) via PayFast.</li>
        <li>Your subscription auto-renews unless cancelled before the billing date.</li>
        <li>We reserve the right to change pricing with 30 days&apos; written notice.</li>
        <li>No refunds are issued for partial billing periods unless required by law.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">3. Acceptable use</h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>Do not post unlawful, infringing or misleading listings.</li>
        <li>Do not attempt to reverse-engineer, abuse or overload the service.</li>
        <li>Respect tenant and buyer data — process it lawfully under POPIA.</li>
        <li>Do not share your account credentials with third parties.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">4. Intellectual property</h2>
      <p className="text-charcoal-600">
        All content, design, logos, and software on Agent Loop are owned by us or our
        licensors. You retain ownership of data you upload but grant us a licence to
        process it to provide the service.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">5. Data protection (POPIA)</h2>
      <p className="text-charcoal-600">
        We process personal information in accordance with the Protection of Personal
        Information Act, 2013 (POPIA). See our{' '}
        <a className="underline" href="/privacy">Privacy Policy</a> for details on
        what we collect, why, and your rights as a data subject.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">6. Limitation of liability</h2>
      <p className="text-charcoal-600">
        The platform is provided &ldquo;as is&rdquo;. To the extent permitted by South
        African law (including the Consumer Protection Act 68 of 2008), Agent Loop is
        not liable for indirect, incidental, or consequential losses arising from use
        of the service. Nothing in these terms limits liability for fraud or gross
        negligence.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">7. Termination</h2>
      <p className="text-charcoal-600">
        You may cancel your account at any time from your billing settings. We may
        suspend or terminate your account if you breach these terms, with written
        notice where practicable.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">8. Governing law</h2>
      <p className="text-charcoal-600">
        These terms are governed by the laws of the Republic of South Africa. Any
        disputes will be subject to the jurisdiction of the courts of the Western Cape.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">9. Contact</h2>
      <p className="text-charcoal-600">
        Questions? Email{' '}
        <a className="underline" href="mailto:hello@agentloop.co.za">hello@agentloop.co.za</a>.
      </p>
    </main>
  );
}
