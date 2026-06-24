import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initOfflineSync } from "./lib/offline-sync";

// Iniciar sistema de sincronización offline
initOfflineSync();

createRoot(document.getElementById("root")!).render(<App />);
