import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Terms & Conditions 📜</h1>
      <p className="mb-6 text-gray-400">
        By using this platform, you agree to the following terms — which are
        short, sweet, and written without the usual lawyer jargon.
      </p>

      <ul className="list-decimal list-inside space-y-2 text-gray-400">
        <li>
          No hacking the system (unless it’s ethical and you tell us first 😉).
        </li>
        <li>
          Don’t pretend to be someone you’re not — the internet has enough
          imposters already.
        </li>
        <li>
          Play nice with others. This isn’t a battle royale (most of the time).
        </li>
        <li>
          We reserve the right to update these terms if something wild happens.
        </li>
      </ul>

      <p className="mt-6 text-gray-400">
        Basically: use responsibly, have fun, and let’s keep the dev world a
        little less boring.
      </p>

      <Link
        href="/"
        className="inline-block mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 font-semibold transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
