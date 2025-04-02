import { Settings } from "lucide-react";
import logo from "@assets/logo.png";

export default function Header() {
  return (
    <header className="bg-primary text-white py-3 px-4 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <img src={logo} alt="enterN Ghost Tamer Logo" className="h-10 mr-2" />
        <h1 className="font-semibold text-lg">enterN | Ghost Tamer</h1>
      </div>
      <button className="p-1 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
        <Settings className="w-6 h-6" />
      </button>
    </header>
  );
}
