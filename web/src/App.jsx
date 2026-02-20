import { useEffect, useState } from "react";
import { listGames } from "./api";
import { useDebouncedValue } from "./useDebouncedValue";
import "./App.css";

function formatPrice(priceCents, currency) {
  const value = (priceCents / 100).toFixed(2);
  return `${value} ${currency}`;
}

export default function App() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Cart state: array of game objects
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");

    listGames({ search: debouncedSearch, limit: 50, offset: 0 })
      .then((data) => {
        if (!alive) return;
        setItems(data.items || []);
        setTotal(data.total ?? (data.items?.length || 0));
      })
      .catch((e) => {
        if (!alive) return;
        setErr(e.message || "Failed to load games");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [debouncedSearch]);

  function addToCart(game) {
    // Prevent duplicates
    if (cart.some((c) => c.id === game.id)) return;
    setCart((prev) => [...prev, game]);
    setCartOpen(true);
  }

  function removeFromCart(gameId) {
    setCart((prev) => prev.filter((c) => c.id !== gameId));
  }

  function isInCart(gameId) {
    return cart.some((c) => c.id === gameId);
  }

  const cartTotal = cart.reduce((sum, g) => sum + g.priceCents, 0);
  const cartCurrency = cart.length > 0 ? cart[0].currency : "EUR";

  return (
    <div className="page">
      <header className="header">
        <div className="headerTop">
          <h1 className="title">Game Search</h1>
          <div className="headerRight">
            <span className="count">
              {loading ? "…" : `${total} results`}
            </span>
            <button
              className="cartToggle"
              onClick={() => setCartOpen(!cartOpen)}
              aria-label="Toggle cart"
            >
              🛒{" "}
              {cart.length > 0 && (
                <span className="cartBadge">{cart.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="searchRow">
          <input
            className="searchInput"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a game…"
            aria-label="Search games"
          />
        </div>
      </header>

      {err ? <div className="state error">{err}</div> : null}
      {loading ? <div className="state">Loading…</div> : null}
      {!loading && !err && items.length === 0 ? (
        <div className="state">No games found</div>
      ) : null}

      <div className="layout">
        <main className="grid">
          {items.map((g) => (
            <article key={g.id} className="card">
              <div className="coverWrap">
                <img className="cover" src={g.imageUrl} alt={g.title} />
              </div>

              <div className="cardBody">
                <div className="cardTitle" title={g.title}>
                  {g.title}
                </div>

                <div className="metaRow">
                  <span className="pill">{g.platform || "—"}</span>
                  {g.region ? <span className="pill">{g.region}</span> : null}
                </div>

                <div className="priceRow">
                  <div className="price">
                    {formatPrice(g.priceCents, g.currency)}
                  </div>
                  <button
                    className={`buyBtn ${isInCart(g.id) ? "inCart" : ""}`}
                    onClick={() =>
                      isInCart(g.id)
                        ? removeFromCart(g.id)
                        : addToCart(g)
                    }
                  >
                    {isInCart(g.id) ? "In Cart ✓" : "Buy"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </main>

        {/* Cart / Checkout Sidebar */}
        {cartOpen && (
          <aside className="cartSidebar">
            <div className="cartHeader">
              <h2 className="cartTitle">Checkout</h2>
              <button
                className="cartClose"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="cartEmpty">Your cart is empty</p>
            ) : (
              <>
                <ul className="cartList">
                  {cart.map((g) => (
                    <li key={g.id} className="cartItem">
                      <img
                        className="cartThumb"
                        src={g.imageUrl}
                        alt={g.title}
                      />
                      <div className="cartItemInfo">
                        <div className="cartItemTitle">{g.title}</div>
                        <div className="cartItemPrice">
                          {formatPrice(g.priceCents, g.currency)}
                        </div>
                      </div>
                      <button
                        className="cartRemove"
                        onClick={() => removeFromCart(g.id)}
                        aria-label={`Remove ${g.title}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="cartFooter">
                  <div className="cartTotalRow">
                    <span>Total</span>
                    <span className="cartTotalPrice">
                      {formatPrice(cartTotal, cartCurrency)}
                    </span>
                  </div>
                  <button className="checkoutBtn">Proceed to Checkout</button>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
