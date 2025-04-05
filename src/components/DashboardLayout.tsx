
import { useState, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  MessageSquare, 
  History, 
  BarChart, 
  Users, 
  User, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const DashboardLayout = ({ children, pageTitle }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Check-in", href: "/check-in", icon: MessageSquare },
    { name: "Journal", href: "/journal", icon: MessageSquare },
    { name: "History", href: "/history", icon: History },
    { name: "Community", href: "/community", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r border-gray-200 bg-white">
            <div className="flex items-center justify-center flex-shrink-0 px-4">
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 bg-wellness-green rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">MH</span>
                </div>
                <h1 className="ml-2 text-xl font-bold text-gray-800">MoodBloom</h1>
              </Link>
            </div>
            <div className="mt-10 flex-grow">
              <nav className="px-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-3 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-wellness-green text-white"
                          : "text-gray-700 hover:bg-wellness-green-light hover:text-white"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-5 w-5 ${
                          isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <Avatar>
                  <AvatarImage src="" alt={user?.name || ""} />
                  <AvatarFallback className="bg-wellness-purple-light text-wellness-purple-dark">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                  <Button 
                    variant="ghost" 
                    className="text-xs text-gray-500 flex items-center mt-1 p-0 h-auto"
                    onClick={logout}
                  >
                    <LogOut className="h-3 w-3 mr-1" />
                    Sign out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              className="text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex items-center justify-center px-4">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-wellness-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MH</span>
              </div>
              <h1 className="ml-2 text-lg font-bold text-gray-800">MoodBloom</h1>
            </Link>
          </div>
          <div className="mt-5 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-wellness-green text-white"
                        : "text-gray-700 hover:bg-wellness-green-light hover:text-white"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? "text-white" : "text-gray-500 group-hover:text-white"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src="" alt={user?.name || ""} />
                <AvatarFallback className="bg-wellness-purple-light text-wellness-purple-dark">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                <Button 
                  variant="ghost" 
                  className="text-xs text-gray-500 flex items-center mt-1 p-0 h-auto"
                  onClick={logout}
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 md:hidden">
          <Button
            variant="ghost"
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-wellness-green"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 flex justify-center px-4">
            <div className="flex-1 flex items-center justify-center">
              <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="hidden md:flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900">{pageTitle}</h1>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
