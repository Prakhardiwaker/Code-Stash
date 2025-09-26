import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy 🔒</h1>
      <p className="mb-6 text-gray-400">
        We take your privacy seriously. Seriously-seriously. Your data isn’t for
        sale, rent, or barter — not even for infinite coffee refills.
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-400">
        <li>We collect only the data we absolutely need (no stalker vibes).</li>
        <li>Your personal info stays between you and this app.</li>
        <li>
          No shady tracking pixels — we like transparent code, not invisible
          spies.
        </li>
        <li>
          If you ever want your data gone, just let us know. Poof! It’s history.
        </li>
      </ul>

      <p className="mt-6 text-gray-400">
        TL;DR: Your secrets are safe, your memes are safe, and your cat pictures
        are safe.
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
