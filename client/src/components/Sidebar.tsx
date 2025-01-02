import { HomeIcon, BookOpenIcon, AwardIcon, SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: HomeIcon, label: "Dashboard", path: "/" },
    { icon: BookOpenIcon, label: "Learning Paths", path: "/paths" },
    { icon: AwardIcon, label: "Assessments", path: "/assessments" },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="pb-12 w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  location.pathname === item.path && "bg-secondary"
                )}
                onClick={() => navigate(item.path)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}