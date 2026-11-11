import { LangProvider } from "./lib/lang";
import Index from "./pages/Index";

// StoryTable is a single screen that steps through consent, photo, talk,
// story card and note. No router, no accounts, nothing stored.
const App = () => (
  <LangProvider>
    <Index />
  </LangProvider>
);

export default App;
