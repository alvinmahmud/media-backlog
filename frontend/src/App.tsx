import {
  type CSSProperties,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ApiError,
  authApi,
  mediaApi,
  type ApiMediaItem,
  type User,
} from "./api";
import "./App.css";

type MediaType = ApiMediaItem["type"];
type Status = ApiMediaItem["status"];
type NewMediaItem = Omit<ApiMediaItem, "_id" | "createdAt">;

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    authApi
      .session()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch((error: unknown) => {
        if (!(error instanceof ApiError) || error.status !== 401) {
          setSessionError(
            "The API is not reachable yet. Start the backend and try again.",
          );
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  if (checkingSession) return <LoadingScreen />;
  if (!user) {
    return (
      <SignInScreen
        initialError={sessionError}
        onAuthenticated={(authenticatedUser) => {
          setSessionError("");
          setUser(authenticatedUser);
        }}
      />
    );
  }

  return <Library user={user} onSignedOut={() => setUser(null)} />;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <span className="brand-mark">M</span>
      <p>Opening your library…</p>
    </div>
  );
}

function SignInScreen({
  initialError,
  onAuthenticated,
}: {
  initialError: string;
  onAuthenticated: (user: User) => void;
}) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  async function submitCredentials(event: FormEvent) {
    event.preventDefault();
    if (mode === "register" && password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response =
        mode === "register"
          ? await authApi.register(username, email, password)
          : await authApi.login(email, password);
      onAuthenticated(response.user);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : mode === "register"
            ? "Could not create your account"
            : "Could not sign in",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const googleSignIn = useCallback(
    async (credential: string) => {
      setError("");
      try {
        const response = await authApi.google(credential);
        onAuthenticated(response.user);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Google sign-in could not be completed",
        );
      }
    },
    [onAuthenticated],
  );

  return (
    <main className="auth-page">
      <section className="auth-story">
        <a
          className="brand auth-brand"
          href="/"
          aria-label="Media Backlog home"
        >
          <span className="brand-mark" aria-hidden="true">
            M
          </span>
          <span>Media Backlog</span>
        </a>
        <div>
          <p className="eyebrow">Your personal watch, read &amp; play list</p>
          <h1>
            Every story
            <br />
            has its moment.
          </h1>
          <p>
            Keep the recommendations that matter, make space for what’s next,
            and carry your library between devices.
          </p>
        </div>
        <p className="auth-footnote">
          A quiet home for films, series, books, and games.
        </p>
      </section>

      <section className="auth-panel" aria-labelledby="sign-in-title">
        <div className="auth-card">
          <p className="section-kicker">Welcome in</p>
          <h2 id="sign-in-title">
            {mode === "register" ? "Start your library" : "Welcome back"}
          </h2>
          <p className="auth-intro">
            {mode === "register"
              ? "Create an account to keep your collection saved and private."
              : "Sign in to return to your saved collection."}
          </p>

          <GoogleButton onCredential={googleSignIn} />
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <div className="account-mode-tabs" aria-label="Account action">
            <button
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
              type="button"
            >
              Create account
            </button>
            <button
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
              type="button"
            >
              Sign in
            </button>
          </div>

          <form onSubmit={submitCredentials} className="account-form">
            {mode === "register" && (
              <label className="field">
                <span>Username</span>
                <input
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[A-Za-z0-9_]+"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="alvin_reads"
                />
                <small>3–24 letters, numbers, or underscores</small>
              </label>
            )}
            <label className="field">
              <span>Email</span>
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                required
                type="password"
                minLength={10}
                maxLength={128}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  mode === "register"
                    ? "At least 10 characters"
                    : "Your password"
                }
              />
            </label>
            {mode === "register" && (
              <label className="field">
                <span>Confirm password</span>
                <input
                  required
                  type="password"
                  minLength={10}
                  maxLength={128}
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) =>
                    setPasswordConfirmation(event.target.value)
                  }
                  placeholder="Enter it once more"
                />
              </label>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="add-button auth-submit" disabled={submitting}>
              {submitting
                ? mode === "register"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "register"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function GoogleButton({
  onCredential,
}: {
  onCredential: (credential: string) => void;
}) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    if (!clientId || !buttonRef.current) return;
    const render = () => {
      if (!window.google || !buttonRef.current) return;
      buttonRef.current.replaceChildren();
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
        width: Math.min(360, buttonRef.current.clientWidth || 360),
      });
    };

    const existing = document.getElementById(
      "google-identity-script",
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", render);
      render();
      return () => existing.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.addEventListener("load", render);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [clientId, onCredential]);

  if (!clientId) {
    return (
      <div className="google-pending">
        <span className="google-g">G</span>
        <span>
          <strong>Google sign-in</strong>
          <small>Add a client ID to enable</small>
        </span>
        <span className="pending-pill">Setup pending</span>
      </div>
    );
  }
  return (
    <div
      className="google-button"
      ref={buttonRef}
      aria-label="Sign in with Google"
    />
  );
}

function Library({
  user,
  onSignedOut,
}: {
  user: User;
  onSignedOut: () => void;
}) {
  const [items, setItems] = useState<ApiMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    mediaApi
      .list()
      .then(setItems)
      .catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Could not load your library",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items
      .filter((item) => typeFilter === "all" || item.type === typeFilter)
      .filter((item) => statusFilter === "all" || item.status === statusFilter)
      .filter(
        (item) =>
          !query ||
          item.title.toLowerCase().includes(query) ||
          (item.notes || "").toLowerCase().includes(query),
      );
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

  async function addItem(item: NewMediaItem) {
    try {
      const created = await mediaApi.create(item);
      setItems((current) => [created, ...current]);
      setIsAdding(false);
      setError("");
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Could not save this item";
      setError(message);
      throw caught;
    }
  }

  async function updateStatus(id: string, status: Status) {
    try {
      const updated = await mediaApi.update(id, { status });
      setItems((current) =>
        current.map((item) => (item._id === id ? updated : item)),
      );
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not update the item",
      );
    }
  }

  async function removeItem(id: string) {
    try {
      await mediaApi.remove(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Could not remove the item",
      );
    }
  }

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      onSignedOut();
    }
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
        <div className="topbar-actions">
          <div className="account-chip">
            {user.picture ? (
              <img src={user.picture} alt="" />
            ) : (
              <span className="account-initial">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="account-name">{user.username}</span>
            <button onClick={signOut}>Sign out</button>
          </div>
          <button
            className="add-button compact"
            onClick={() => setIsAdding(true)}
          >
            <span aria-hidden="true">＋</span> Add media
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              {user.username}’s watch, read &amp; play list
            </p>
            <h1>
              Keep the next great
              <br />
              story close.
            </h1>
            <p className="hero-description">
              Your collection now lives with your account, ready whenever
              inspiration strikes.
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
              <p className="section-kicker">Saved to your account</p>
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
          {error && (
            <div className="api-message" role="alert">
              {error}
              <button onClick={() => setError("")} aria-label="Dismiss">
                ×
              </button>
            </div>
          )}
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

          {loading ? (
            <div className="library-loading">Loading your collection…</div>
          ) : filteredItems.length ? (
            <div className="media-grid">
              {filteredItems.map((item, index) => (
                <article
                  className={`media-card tone-${item.type}`}
                  key={item._id}
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
                            updateStatus(item._id, event.target.value as Status)
                          }
                        >
                          <option value="backlog">Backlog</option>
                          <option value="in progress">In progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>
                      <button
                        className="remove-button"
                        onClick={() => removeItem(item._id)}
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
              <h3>
                {items.length ? "No stories found" : "Your shelf is ready"}
              </h3>
              <p>
                {items.length
                  ? "Try a different filter, or add something new to your list."
                  : "Add the first film, series, book, or game you don’t want to forget."}
              </p>
              <button className="text-button" onClick={() => setIsAdding(true)}>
                Add a title
              </button>
            </div>
          )}
        </section>
      </main>
      <footer>
        <span>Media Backlog</span>
        <p>Signed in as {user.email}</p>
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
  onAdd: (item: NewMediaItem) => Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MediaType>("movie");
  const [status, setStatus] = useState<Status>("backlog");
  const [year, setYear] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAdd({
        title: title.trim(),
        type,
        status,
        year: year.trim(),
        notes: notes.trim(),
      });
    } finally {
      setSaving(false);
    }
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. The Left Hand of Darkness"
            />
          </label>
          <div className="field-pair">
            <label className="field">
              <span>Media type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as MediaType)}
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
                onChange={(event) => setStatus(event.target.value as Status)}
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
              onChange={(event) =>
                setYear(event.target.value.replace(/\D/g, ""))
              }
              placeholder="2024"
            />
          </label>
          <label className="field">
            <span>
              Note <em>optional</em>
            </span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Why did this catch your eye?"
              rows={3}
            />
          </label>
          <div className="dialog-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="add-button" disabled={saving}>
              {saving ? "Saving…" : "Add to library"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default App;
