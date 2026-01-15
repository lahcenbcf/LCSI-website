export const ErrorMessage = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
    <p className="text-red-800 mb-4">Erreur: {error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Réessayer
    </button>
  </div>
);