import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import "./App.css";

type MediaType = "movie" | "tv" | "book" | "game";
type Status = "backlog" | "in progress" | "completed";
type MediaItem = {
  id: string;
  title: string;
  type: MediaType;
  status: Status;
  notes: string;
  year?: string;
  addedAt: number;
};

const STORAGE_KEY = "media-backlog-items";
const starterItems: MediaItem[] = [
  {
    id: "starter-1",
    title: "Perfect Days",
    type: "movie",
    status: "backlog",
    notes: "Save for a quiet Sunday night.",
    year: "2023",
    addedAt: 6,
  },
  {
    id: "starter-2",
    title: "Severance",
    type: "tv",
    status: "in progress",
    notes: "Season 1 · Episode 6",
    year: "2022",
    addedAt: 5,
  },
  {
    id: "starter-3",
    title: "Tomorrow, and Tomorrow, and Tomorrow",
    type: "book",
    status: "in progress",
    notes: "About halfway through.",
    year: "2022",
    addedAt: 4,
  },
  {
    id: "starter-4",
    title: "Outer Wilds",
    type: "game",
    status: "backlog",
    notes: "Go in without reading spoilers.",
    year: "2019",
    addedAt: 3,
  },
  {
    id: "starter-5",
    title: "The Bear",
    type: "tv",
    status: "completed",
    notes: "Chaotic, tender, excellent.",
    year: "2022",
    addedAt: 2,
  },
  {
    id: "starter-6",
    title: "Past Lives",
    type: "movie",
    status: "completed",
    notes: "A new favorite.",
    year: "2023",
    addedAt: 1,
  },
];

const typeLabels: Record<MediaType, string> = {
  movie: "Film",
  tv: "Series",
  book: "Book",
  game: "Game",
};
const typeMarks: Record<MediaType, string> = {
  movie: "●",
  tv: "▰",
  book: "▥",
  game: "✦",
};
const statusLabels: Record<Status, string> = {
  backlog: "Backlog",
  "in progress": "In progress",
  completed: "Completed",
};

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as MediaItem[]) : starterItems;
  } catch {
    return starterItems;
  }
}

function App() {
  const [items, setItems] = useState<MediaItem[]>(loadItems);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter(
        (item) =>
          !query ||
          item.title.toLowerCase().includes(query) ||
          item.notes.toLowerCase().includes(query),
      )
      .sort((a, b) => b.addedAt - a.addedAt);
  }, [items, search, typeFilter, statusFilter]);

  const counts = useMemo(
    () => ({
      all: items.length,
      backlog: items.filter((item) => item.status === "backlog").length,
      "in progress": items.filter((item) => item.status === "in progress")
        .length,
      completed: items.filter((item) => item.status === "completed").length,
    }),
    [items],
  );

  function addItem(item: Omit<MediaItem, "id" | "addedAt">) {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `item-${Date.now()}`;
    setItems((current) => [...current, { ...item, id, addedAt: Date.now() }]);
    setIsAdding(false);
  }

  function updateStatus(id: string, status: Status) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Media Backlog home">
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>Media Backlog</span>
        </a>
        <button
          className="add-button compact"
          onClick={() => setIsAdding(true)}
        >
          <span aria-hidden="true">＋</span> Add media
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Your personal watch, read &amp; play list</p>
            <h1>
              Keep the next great
              <br />
              story close.
            </h1>
            <p className="hero-description">
              One calm place for everything you want to experience—without
              losing the recommendations that caught your attention.
            </p>
          </div>
          <div className="hero-stats" aria-label="Backlog summary">
            <div>
              <strong>{counts.backlog}</strong>
              <span>Waiting for you</span>
            </div>
            <div>
              <strong>{counts["in progress"]}</strong>
              <span>In progress</span>
            </div>
            <div>
              <strong>{counts.completed}</strong>
              <span>Finished</span>
            </div>
          </div>
        </section>

        <section className="library" aria-labelledby="library-title">
          <div className="section-heading">
            <div>
              <p className="section-kicker">The collection</p>
              <h2 id="library-title">My library</h2>
            </div>
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search your library</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search titles or notes"
              />
            </label>
          </div>

          <div className="filter-row">
            <div className="status-tabs" aria-label="Filter by status">
              {(["all", "backlog", "in progress", "completed"] as const).map(
                (status) => (
                  <button
                    className={statusFilter === status ? "active" : ""}
                    onClick={() => setStatusFilter(status)}
                    key={status}
                  >
                    {status === "all" ? "All" : statusLabels[status]}
                    <span>{counts[status]}</span>
                  </button>
                ),
              )}
            </div>
            <label className="type-filter">
              <span className="sr-only">Filter by media type</span>
              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value as MediaType | "all")
                }
              >
                <option value="all">All media</option>
                <option value="movie">Films</option>
                <option value="tv">Series</option>
                <option value="book">Books</option>
                <option value="game">Games</option>
              </select>
            </label>
          </div>

          {filteredItems.length ? (
            <div className="media-grid">
              {filteredItems.map((item, index) => (
                <article
                  className={`media-card tone-${item.type}`}
                  key={item.id}
                  style={{ "--delay": `${index * 45}ms` } as CSSProperties}
                >
                  <div className="card-visual" aria-hidden="true">
                    <span className="media-mark">{typeMarks[item.type]}</span>
                    <span className="media-initial">
                      {item.title.charAt(0).toUpperCase()}
                    </span>
                    <span className="visual-type">{typeLabels[item.type]}</span>
                  </div>
                  <div className="card-content">
                    <div className="card-meta">
                      <span>{typeLabels[item.type]}</span>
                      {item.year && <span>{item.year}</span>}
                    </div>
                    <h3>{item.title}</h3>
                    <p>{item.notes || "No notes yet."}</p>
                    <div className="card-actions">
                      <label>
                        <span className="sr-only">Status for {item.title}</span>
                        <select
                          className={`status-select status-${item.status.replace(" ", "-")}`}
                          value={item.status}
                          onChange={(event) =>
                            updateStatus(item.id, event.target.value as Status)
                          }
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>
                      <button
                        className="remove-button"
                        onClick={() =>
                          setItems((current) =>
                            current.filter((entry) => entry.id !== item.id),
                          )
                        }
                        aria-label={`Remove ${item.title}`}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span aria-hidden="true">◎</span>
              <h3>No stories found</h3>
              <p>Try a different filter, or add something new to your list.</p>
              <button className="text-button" onClick={() => setIsAdding(true)}>
                Add a title
              </button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <span>Media Backlog</span>
        <p>A little shelf for the stories you don’t want to forget.</p>
      </footer>
      {isAdding && (
        <AddMediaDialog onAdd={addItem} onClose={() => setIsAdding(false)} />
      )}
    </div>
  );
}

function AddMediaDialog({
  onAdd,
  onClose,
}: {
  onAdd: (item: Omit<MediaItem, "id" | "addedAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [status, setStatus] = useState<Status>("backlog");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (title.trim())
      onAdd({
        title: title.trim(),
        type,
        status,
        year: year.trim(),
        notes: notes.trim(),
      });
  }

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        <p className="section-kicker">Grow your collection</p>
        <h2 id="dialog-title">Add something new</h2>
        <p className="dialog-intro">
          Save it now. Decide when to start it later.
        </p>
        <form onSubmit={submit}>
          <label className="field">
            <span>Title</span>
            <input
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Left Hand of Darkness"
            />
          </label>
          <div className="field-pair">
            <label className="field">
              <span>Media type</span>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaType)}
              >
                <option value="movie">Film</option>
                <option value="tv">Series</option>
                <option value="book">Book</option>
                <option value="game">Game</option>
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                <option value="backlog">Backlog</option>
                <option value="in progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          <label className="field">
            <span>
              Release year <em>optional</em>
            </span>
            <input
              inputMode="numeric"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              placeholder="2024"
            />
          </label>
          <label className="field">
            <span>
              Note <em>optional</em>
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did this catch your eye?"
              rows={3}
            />
          </label>
          <div className="dialog-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-button">
              Add to library
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;
