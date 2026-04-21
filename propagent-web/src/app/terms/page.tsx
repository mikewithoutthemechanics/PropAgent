export const metadata = {
  title: 'Terms of Service — agent-loop',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-charcoal-900 mb-6">Terms of Service</h1>
      <p className="text-charcoal-600">
        These terms govern your use of agent-loop. By creating an account or using
        the platform you agree to be bound by them.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">Your account</h2>
      <p className="text-charcoal-600">
        You are responsible for keeping your login credentials secure and for any
        activity that happens under your account.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">Acceptable use</h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>Do not post unlawful, infringing or misleading listings.</li>
        <li>Do not attempt to reverse-engineer, abuse or overload the service.</li>
        <li>Respect tenant and buyer data — process it lawfully under POPIA.</li>
      </ul>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">Liability</h2>
      <p className="text-charcoal-600">
        The platform is provided &ldquo;as is&rdquo;. agent-loop is not liable for
        indirect or consequential losses arising from use of the service.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">Contact</h2>
      <p className="text-charcoal-600">
        Questions? Email <a className="underline" href="mailto:hello@agentloop.co.za">hello@agentloop.co.za</a>.
      </p>
    </main>
  );
}
