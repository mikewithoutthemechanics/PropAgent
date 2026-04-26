export const metadata = {
  title: 'Privacy Policy — Agent Loop',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-charcoal-900 mb-6">Privacy Policy</h1>
      <p className="text-charcoal-600 text-sm italic">Last updated: April 2026</p>
      <p className="text-charcoal-600">
        Agent Loop (Pty) Ltd (&ldquo;Agent Loop&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
        respects your privacy. This policy explains what personal information we collect
        through our platform, how we use it, and your rights under the Protection of
        Personal Information Act (POPIA).
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">1. Information we collect</h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li><strong>Account details:</strong> name, email, phone, agency, FFC number.</li>
        <li><strong>Property &amp; tenant data:</strong> listing information, tenant records, lease details you add.</li>
        <li><strong>Payment data:</strong> subscription status and PayFast tokens. We never store card numbers.</li>
        <li><strong>Usage data:</strong> pages visited, feature usage, and device/browser information.</li>
        <li><strong>Cookies:</strong> authentication session cookies and optional analytics cookies.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">2. How we use your information</h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>To operate, maintain, and improve the Agent Loop platform.</li>
        <li>To process payments and manage subscriptions.</li>
        <li>To send transactional emails (lease reminders, payment confirmations, maintenance updates).</li>
        <li>To provide AI-powered property matching, valuations, and analytics.</li>
        <li>To comply with legal obligations, including FICA verification.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">3. Legal basis for processing</h2>
      <p className="text-charcoal-600">
        Under POPIA, we process personal information based on: (a) your consent when you
        create an account; (b) the necessity of processing to perform a contract with you;
        and (c) our legitimate interest in improving our services.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">4. Data sharing</h2>
      <p className="text-charcoal-600">
        We do not sell your personal data. We share data only with:
      </p>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li><strong>Service providers:</strong> Supabase (database hosting), PayFast (payments), Resend (email), Groq (AI processing), Upstash (caching).</li>
        <li><strong>Regulatory bodies:</strong> when required by South African law (e.g., PPRA, SARS).</li>
        <li><strong>Other agents:</strong> only the anonymised property/buyer matching data you explicitly choose to share via the matching engine (POPIA-compliant, criteria-only).</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">5. Data retention</h2>
      <p className="text-charcoal-600">
        We retain your data for as long as your account is active or as needed to provide
        the service. After account deletion we retain records for up to 5 years as required
        by the Financial Intelligence Centre Act (FICA) and the Rental Housing Act.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">6. Your rights under POPIA</h2>
      <p className="text-charcoal-600">As a data subject, you have the right to:</p>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>Access the personal information we hold about you.</li>
        <li>Request correction of inaccurate information.</li>
        <li>Request deletion of your personal information (subject to legal retention requirements).</li>
        <li>Object to the processing of your personal information.</li>
        <li>Lodge a complaint with the Information Regulator.</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">7. Security</h2>
      <p className="text-charcoal-600">
        We use industry-standard security measures including encryption in transit (TLS),
        row-level security in our database, and secure authentication via Supabase.
        Despite our efforts, no system is 100% secure. Please protect your account
        credentials.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">8. Cookies</h2>
      <p className="text-charcoal-600">
        We use essential cookies for authentication and session management. Optional
        analytics cookies help us understand usage patterns. You can disable non-essential
        cookies in your browser settings.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">9. Changes to this policy</h2>
      <p className="text-charcoal-600">
        We may update this policy from time to time. Material changes will be communicated
        via email or an in-app notification at least 14 days before they take effect.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">10. Contact</h2>
      <p className="text-charcoal-600">
        Questions or data subject requests? Email our Information Officer at{' '}
        <a className="underline" href="mailto:hello@agentloop.co.za">hello@agentloop.co.za</a>.
      </p>
    </main>
  );
}
