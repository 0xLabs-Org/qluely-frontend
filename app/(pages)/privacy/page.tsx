import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-24 pb-32">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1f36] mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-black/40 mb-8">Effective Date: February 18, 2026</p>

        <div className="space-y-10 text-black/70 leading-relaxed">
          <section>
            <p>
              Qluely (“Company,” “we,” “us,” or “our”) provides an AI-powered meeting assistant application designed to deliver real-time contextual support during meetings, interviews, and work sessions (the “Service”), Qluely enables features such as real-time audio transcription, contextual AI assistance, and intelligent response generation to help users perform more effectively in professional environments.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">What we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Documents or text you upload for AI processing</li>
              <li>Screen and audio data, only when you grant system-level permission</li>
              <li>Basic usage and crash logs to keep things running smoothly</li>
              <li>Account info like your email and login details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">How we use it</h2>
            <p>
              Your data is used to power the AI features you ask for: real-time assistance,
              contextual answers, and performance improvements. We also use it for subscription
              management and fixing bugs.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Improve performance and accuracy</li>
              <li>Manage subscriptions and billing</li>
              <li>Provide technical support</li>
              <li>Prevent misuse or abuse</li>
              <li>Provide real-time AI assistance and transcription features</li>
            </ul>

            <p className="mt-3">
              We do not use your data for advertising. Screen and audio data are processed
              solely to deliver the features you requested.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">What we don&apos;t do</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We don&apos;t sell, rent, or trade your data</li>
              <li>We don&apos;t use your data for ads</li>
              <li>We don&apos;t share your data unless needed to run the service (e.g. cloud and AI providers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Security</h2>
            <p>
              We use encryption and secure cloud infrastructure to protect your data.
              Access is restricted to what&apos;s necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Data retention</h2>
            <p>
              We keep your data only as long as needed for your account to work or
              as required by law. You can request deletion at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Your rights</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Request deletion</li>
              <li>Withdraw consent for screen or audio access</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="mt-3">
              Qluely is not intended for users under 13.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Refunds</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Refunds are available within 3 days of purchase, provided no more than 10% of credits have been used</li>
              <li>If more than 3 days have passed or more than 10% of credits have been used, no refund will be issued</li>
              <li>
                To request a refund, please email{' '}
                <a
                  href="mailto:sameer@qluely.in"
                  className="text-blue-600 hover:underline"
                >
                  sameer@qluely.in
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Changes to this policy</h2>
            <p>
              We may update this policy from time to time. If we make significant changes,
              we&apos;ll post them here. Continued use of Qluely means you accept the latest version.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a1f36] mb-3">Contact</h2>
            <p>
              Questions? Reach out at{' '}
              <a
                href="mailto:sameer@qluely.in"
                className="text-blue-600 hover:underline"
              >
                sameer@qluely.in
              </a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
