import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const emptyContact = {
  company: "",
  first_name: "",
  last_name: "",
  title: "",
  email: "",
  phone: "",
  website: "",
  store_url: "",
  notes: "",
};

const fields = [
  ["company", "Company", true],
  ["first_name", "First name"],
  ["last_name", "Last name"],
  ["title", "Title"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["website", "Website"],
  ["store_url", "Store URL"],
  ["notes", "Notes"],
];

function displayName(contact) {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
  return name || "No contact name";
}

export default function App() {
  const [contact, setContact] = useState(emptyContact);
  const [contacts, setContacts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadContacts() {
    const response = await fetch(`${API_URL}/contacts`);
    if (!response.ok) {
      throw new Error("Could not load contacts.");
    }
    setContacts(await response.json());
  }

  useEffect(() => {
    loadContacts().catch((loadError) => setError(loadError.message));
  }, []);

  function updateField(event) {
    setContact({
      ...contact,
      [event.target.name]: event.target.value,
    });
  }

  async function saveContact(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = Object.fromEntries(
      Object.entries(contact).map(([key, value]) => [key, value.trim() || null])
    );

    try {
      const response = await fetch(`${API_URL}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save contact.");
      }

      setContact(emptyContact);
      await loadContacts();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="entry-panel">
        <h1>Address Book</h1>
        <form onSubmit={saveContact}>
          {fields.map(([name, label, required]) => (
            <label key={name}>
              <span>{label}</span>
              {name === "notes" ? (
                <textarea
                  name={name}
                  value={contact[name]}
                  onChange={updateField}
                  rows="4"
                />
              ) : (
                <input
                  name={name}
                  value={contact[name]}
                  onChange={updateField}
                  required={required}
                />
              )}
            </label>
          ))}

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Contact"}
          </button>
        </form>
      </section>

      <section className="directory-panel">
        <div className="directory-header">
          <h2>Contact Directory</h2>
          <span>{contacts.length} saved</span>
        </div>

        <div className="contact-list">
          {contacts.length === 0 ? (
            <p className="empty-state">No contacts saved yet.</p>
          ) : (
            contacts.map((savedContact) => (
              <article className="contact-row" key={savedContact.id}>
                <div>
                  <h3>{savedContact.company}</h3>
                  <p>{displayName(savedContact)}</p>
                </div>
                <dl>
                  {savedContact.title ? (
                    <>
                      <dt>Title</dt>
                      <dd>{savedContact.title}</dd>
                    </>
                  ) : null}
                  {savedContact.email ? (
                    <>
                      <dt>Email</dt>
                      <dd>{savedContact.email}</dd>
                    </>
                  ) : null}
                  {savedContact.phone ? (
                    <>
                      <dt>Phone</dt>
                      <dd>{savedContact.phone}</dd>
                    </>
                  ) : null}
                  {savedContact.website ? (
                    <>
                      <dt>Website</dt>
                      <dd>{savedContact.website}</dd>
                    </>
                  ) : null}
                  {savedContact.store_url ? (
                    <>
                      <dt>Store</dt>
                      <dd>{savedContact.store_url}</dd>
                    </>
                  ) : null}
                  {savedContact.notes ? (
                    <>
                      <dt>Notes</dt>
                      <dd>{savedContact.notes}</dd>
                    </>
                  ) : null}
                </dl>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
