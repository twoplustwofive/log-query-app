import LogsComponent from "./logs/components/Logs";

const App = () => {
  return (
    <div className="app">
      <h1
        style={{
          textAlign: "center",
          borderBottom: "2px solid #ccc",
          padding: "10px",
        }}
      >
        Log Query Application
      </h1>
      <LogsComponent />
    </div>
  );
};

export default App;
