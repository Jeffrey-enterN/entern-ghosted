import { Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-primary text-white py-3 px-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <h1 className="font-semibold text-lg">GhostGuard</h1>
      </div>
      <button className="p-1 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
        <Settings className="w-6 h-6" />
      </button>
    </header>
  );
}
