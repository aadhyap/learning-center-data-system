import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Code Ninjas</h2>

        <input
          className="search"
          type="text"
          placeholder="Search ninjas..."
        />

        <h3>Filters</h3>

        <p>Program</p>
        <label>
          <input type="checkbox" /> Create
        </label>

        <label>
          <input type="checkbox" /> Junior
        </label>

        <label>
          <input type="checkbox" /> Godot
        </label>
      </aside>

      <main className="content">
        <div className="page-header">
          <div>
            <h1>Ninjas</h1>
            <p>View and manage student progress</p>
          </div>

          <button>+ Add Ninja</button>
        </div>
      </main>
    </div>
  );
}

export default App;