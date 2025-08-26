export default function RequireLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Anmeldung erforderlich
        </h2>
        <p className="mb-6 text-gray-600">
          Bitte loggen Sie sich ein, um die Inhalte zu sehen und zu nutzen.
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-3 bg-[rgb(228,25,31)] text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Zum Login
        </a>
      </div>
    </main>
  );
}