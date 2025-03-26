
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CampaignManager from "./pages/CampaignManager";
import CampaignLibrary from "./pages/CampaignLibrary";
import CampaignDetail from "./pages/CampaignDetail";
import { CampaignSidebarProvider } from "./components/CampaignSidebarProvider";

function App() {
  // Confirm that Index component is being properly imported
  console.log("Index component:", Index);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CampaignSidebarProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manager" element={<CampaignManager />} />
            <Route path="/library" element={<CampaignLibrary />} />
            <Route path="/campaign/:id" element={<CampaignDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster position="top-center" richColors closeButton />
      </CampaignSidebarProvider>
    </ThemeProvider>
  );
}

export default App;
