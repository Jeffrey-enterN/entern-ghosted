import { useState } from "react";
import { useGhostGuard } from "@/context/GhostGuardContext";
import Home from "@/pages/Home";
import Reports from "@/pages/Reports";
import NewReport from "@/pages/NewReport";

const GhostGuard = () => {
  const { activeTab, setActiveTab, currentSite } = useGhostGuard();
  const [showSettings, setShowSettings] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "reports":
        return <Reports />;
      case "newReport":
        return <NewReport />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-[360px] bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <div className="mr-2 text-primary-dark text-2xl">
              <i className="ri-ghost-line"></i>
            </div>
            <h1 className="font-display font-bold text-lg text-slate-800">GhostGuard</h1>
          </div>
          <div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-slate-500 hover:text-slate-700"
            >
              <i className="ri-settings-4-line text-lg"></i>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex-1 py-2 px-4 font-medium text-sm ${
              activeTab === "home"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 py-2 px-4 font-medium text-sm ${
              activeTab === "reports"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            My Reports
          </button>
          <button
            onClick={() => setActiveTab("newReport")}
            className={`flex-1 py-2 px-4 font-medium text-sm ${
              activeTab === "newReport"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Report
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-2 px-4">
        <div className="flex justify-between items-center">
          <div className="text-xs text-slate-500">
            <span>{currentSite}</span>
          </div>
          <div className="text-xs">
            <button className="text-slate-500 hover:text-slate-700 mr-2">
              <i className="ri-question-line"></i>
            </button>
            <button className="text-slate-500 hover:text-slate-700">
              <i className="ri-feedback-line"></i>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GhostGuard;
