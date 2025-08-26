import React from "react";

interface EditRequestModalProps {
  message: string;
  onClose: () => void;
  onSubmit: (message: string) => void;
  onDelete?: () => void;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  isEdit?: boolean;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  message,
  onClose,
  onSubmit,
  onDelete,
  loading = false,
  error,
  success,
  isEdit = false,
}) => {
  const [msg, setMsg] = React.useState(message || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!msg.trim()) return;
    onSubmit(msg.trim());
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-lg font-bold mb-4">{isEdit ? "Anfrage bearbeiten" : "Projekt anfragen"}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={4}
            placeholder="Ihre Nachricht an den Anbieter..."
            value={msg}
            onChange={e => setMsg(e.target.value)}
            disabled={loading}
          />
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
          <div className="flex gap-3 justify-end">
            {isEdit && onDelete && (
              <button type="button" className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onDelete} disabled={loading}>Löschen</button>
            )}
            <button type="button" className="px-5 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={onClose} disabled={loading}>Abbrechen</button>
            <button type="submit" className={`px-5 py-2 rounded ${isEdit ? "bg-blue-600 hover:bg-blue-700" : "bg-[#e31e24] hover:bg-[#c01a1f]"} text-white font-medium hover:shadow transition-colors`} disabled={loading || !msg.trim()}>
              {isEdit ? "Speichern" : "Anfrage senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;
