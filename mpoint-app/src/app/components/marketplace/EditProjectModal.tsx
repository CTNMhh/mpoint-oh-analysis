import React from "react";

interface EditProjectModalProps {
  project: any;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSubmit }) => {
  const [formState, setFormState] = React.useState({ ...project });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === "checkbox" && "checked" in e.target) {
      checked = (e.target as HTMLInputElement).checked;
    }
  setFormState((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // longDescription aus contentEditable div auslesen
    const longDescDiv = document.getElementById("projectLongDescription") as HTMLDivElement | null;
    let longDescription = longDescDiv?.innerHTML?.trim() || null;
    if (longDescription === "" || longDescription === "<br>") longDescription = null;
    // Kategorie wie im Create-Modal in UPPERCASE senden
    const category = formState.category ? String(formState.category).toUpperCase() : null;
    // Deadline in ISO-Format normalisieren (falls "YYYY-MM-DD" aus dem Date-Input)
    let deadline: string | null = null;
    if (formState.deadline) {
      const d = String(formState.deadline);
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        deadline = new Date(d).toISOString();
      } else {
        deadline = d;
      }
    }
    // Nur relevante Felder für das Update senden (email/publicEmail entfallen; "anonymous" ist nur Dummy)
    const payload: any = {
      id: formState.id,
      type: formState.type,
      title: formState.title ?? null,
      category,
      shortDescription: formState.shortDescription ?? null,
      longDescription,
      location: formState.location ?? null,
      deadline,
      skills: formState.skills ?? null,
    };
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-11/12 max-w-2xl max-h-screen overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Projekt bearbeiten</h2>
          <button
            className="text-gray-500 hover:text-gray-700 text-2xl p-1 hover:bg-gray-100 rounded"
            onClick={onClose}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Typ-Auswahl Angebot/Anfrage */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Typ</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700">
                  <input type="radio" name="type" value="Anfrage" checked={formState.type === "Anfrage"} onChange={handleChange} /> Anfrage
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                  <input type="radio" name="type" value="Angebot" checked={formState.type === "Angebot"} onChange={handleChange} /> Angebot
                </label>
              </div>
            </div>
            {/* Projekttitel */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectTitle">
                Projekttitel
              </label>
              <input
                type="text"
                id="projectTitle"
                name="title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="z.B. Website-Relaunch für Startup"
                value={formState.title || ""}
                onChange={handleChange}
                required
              />
            </div>
            {/* Kategorie */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectCategory">
                Kategorie
              </label>
              <select id="projectCategory" name="category" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" value={formState.category?.toLowerCase()} onChange={handleChange} required>
                <option value="">Kategorie auswählen</option>
                <option value="dienstleistung">Dienstleistung</option>
                <option value="produkt">Produkt</option>
                <option value="digitalisierung">Digitalisierung</option>
                <option value="nachhaltigkeit">Nachhaltigkeit</option>
                <option value="management">Management</option>
                <option value="marketing">Marketing</option>
                <option value="consulting">Consulting</option>
              </select>
            </div>
            {/* Beschreibung (kurz) */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectShortDescription">
                Beschreibung (kurz)
              </label>
              <input
                type="text"
                id="projectShortDescription"
                name="shortDescription"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Kurze Projektbeschreibung..."
                value={formState.shortDescription || ""}
                onChange={handleChange}
                required
              />
            </div>
            {/* Beschreibung (lang) WYSIWYG Editor */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectLongDescription">
                Beschreibung (lang)
              </label>
              <div
                id="projectLongDescription"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm min-h-24 bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                contentEditable={true}
                style={{ minHeight: "96px" }}
                suppressContentEditableWarning={true}
                dangerouslySetInnerHTML={{ __html: formState.longDescription || "" }}
              />
            </div>
            {/* Standort und Deadline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectLocation">
                  Standort
                </label>
                <input
                  type="text"
                  id="projectLocation"
                  name="location"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="z.B. München, Remote"
                  value={formState.location || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectDeadline">
                  Deadline
                </label>
                <input
                  type="date"
                  id="projectDeadline"
                  name="deadline"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  value={formState.deadline ? formState.deadline.slice(0, 10) : ""}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            {/* Benötigte Fähigkeiten */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="projectSkills">
                Benötigte Fähigkeiten
              </label>
              <input
                type="text"
                id="projectSkills"
                name="skills"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="z.B. JavaScript, React, Design, SEO (mit Komma trennen)"
                value={formState.skills || ""}
                onChange={handleChange}
              />
            </div>
            {/* Dummy Checkbox: Anonym einstellen */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  checked={!!formState.anonymous}
                  onChange={handleChange}
                />
                <span className="text-sm">Anonym einstellen (Unternehmensname wird nicht angezeigt)</span>
              </label>
            </div>
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-5 border-t border-gray-200">
              <button type="button" className="px-6 py-3 border border-red-600 bg-white text-red-600 rounded-lg font-medium hover:bg-red-600 hover:text-white hover:shadow transition-colors" onClick={onClose}>
                Abbrechen
              </button>
              <button type="submit" className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 hover:shadow transition-colors">
                Bearbeiten
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;
