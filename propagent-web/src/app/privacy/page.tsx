export const metadata = {
  title: 'Privacy Policy — agent-loop',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-slate">
      <h1 className="text-3xl font-bold text-charcoal-900 mb-6">Privacy Policy</h1>
      <p className="text-charcoal-600">
        agent-loop (Pty) Ltd (&ldquo;agent-loop&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your
        privacy. This policy explains what personal information we collect through
        our platform, how we use it, and your rights under the Protection of
        Personal Information Act (POPIA).
      </p>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">
        What we collect
      </h2>
      <ul className="list-disc pl-6 text-charcoal-600">
        <li>Account details: name, email, phone, agency.</li>
        <li>Listing and property information you add to the platform.</li>
        <li>Usage analytics to improve the product.</li>
      </ul>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">
        How we use it
      </h2>
      <p className="text-charcoal-600">
        We use your information to operate the platform, respond to enquiries,
        and improve our services. We do not sell your personal data to third
        parties.
      </p>
      <h2 className="mt-8 text-xl font-semibold text-charcoal-900">
        Contact
      </h2>
      <p className="text-charcoal-600">
        Questions? Email <a className="underline" href="mailto:hello@agentloop.co.za">hello@agentloop.co.za</a>.
      </p>
    </main>
  );
}
