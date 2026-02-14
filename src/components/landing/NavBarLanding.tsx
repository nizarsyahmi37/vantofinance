import { Zap } from "lucide-react";

interface NavbarProps {
	onLogin: () => void;
}

export default function NavbarLanding({ onLogin }: NavbarProps) {
	return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto sticky top-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-vanto-600 flex items-center justify-center">
          <Zap className="w-5 h-5" />
        </div>
        <span className="text-xl font-bold text-gray-900">Vanto</span>
      </div>
      <button
        onClick={onLogin}
        className="px-4 py-2 rounded-lg bg-vanto-600 text-sm font-medium hover:bg-vanto-700 transition-colors"
      >
        Get Started
      </button>
    </nav>
	);
}

