import React from "react";

interface MessageModalProps {
  project: any;
  requests: any[];
  onClose: () => void;
  onReject: (requestId: string) => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ project, requests, onClose, onReject }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-11/12 max-w-lg max-h-screen overflow-y-auto shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Mitteilungen zu: {project.title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
        <div>
          {requests.length === 0 ? (
            <div className="text-gray-500 text-sm">Keine Anfragen vorhanden.</div>
          ) : (
            <ul className="space-y-4">
              {requests.map(req => (
                <li key={req.id} className="border rounded-lg p-4 flex flex-col gap-2 bg-gray-50">
                  <div className="font-medium text-gray-800">{req.userName || "Unbekannter Nutzer"}</div>
                  <div className="text-gray-600 text-sm">{req.message}</div>
                  <div className="flex gap-2 mt-2 items-center">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled
                    >
                      Antworten
                    </button>
                    {req.status === "DECLINED" ? (
                      <span className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700">Abgelehnt</span>
                    ) : (
                      <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                        onClick={() => onReject(req.id)}
                      >
                        Ablehnen
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
