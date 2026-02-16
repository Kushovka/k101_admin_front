import { BrowserRouter } from "react-router-dom";
import AppContent from "./components/appContent/AppContent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
