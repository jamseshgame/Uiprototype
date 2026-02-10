import { MainMenu } from "./components/main-menu";
import { LanguageProvider } from "./contexts/LanguageContext";

export default function App() {
  return (
    <LanguageProvider>
      <div className="size-full relative">
        <MainMenu />
      </div>
    </LanguageProvider>
  );
}
