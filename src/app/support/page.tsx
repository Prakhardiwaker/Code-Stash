import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-200">
      <h1 className="text-3xl font-bold mb-4">Support 🚀</h1>
      <p className="mb-6 text-gray-400">
        Stuck? Confused? Or maybe just lost in the matrix? Don’t worry — you’ve
        landed on the right page. This is where bugs get squashed, and questions
        find their answers.
      </p>

      <section className="mt-10 border-t border-gray-800/50 pt-8">
        <h2 className="text-2xl font-semibold mb-3">Contact the Developer</h2>
        <p className="mb-4 text-gray-400">
          Hi, I’m{" "}
          <span className="font-semibold text-gray-300">Prakhar Diwaker</span>,
          the person behind this project. If you’ve got feedback, found a bug,
          or just want to say hi — feel free to reach out.
        </p>
        <ul className="space-y-2 text-gray-300">
          <li>
            📧{" "}
            <a
              href="mailto:prakhardiwaker@gmail.com"
              className="hover:underline"
            >
              prakhardiwaker@gmail.com
            </a>
          </li>
          <li>
            💼{" "}
            <a
              href="https://www.linkedin.com/in/prakhar-diwaker-261271122/"
              target="_blank"
              className="hover:underline"
            >
              LinkedIn
            </a>
          </li>
          <li>
            💻{" "}
            <a
              href="https://github.com/prakhardiwaker"
              target="_blank"
              className="hover:underline"
            >
              GitHub
            </a>
          </li>
        </ul>
      </section>

      <Link
        href="/"
        className="inline-block mt-8 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 font-semibold transition-colors"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
