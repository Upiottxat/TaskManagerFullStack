import { CheckSquare, Clock, Flag, Plus, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

interface TaskSidebarProps {
  onNewTask: () => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  taskCounts: {
    all: number;
    pending: number;
    completed: number;
  };
}

const navItems = [
  { id: 'all', label: 'All Tasks', icon: CheckSquare },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'completed', label: 'Completed', icon: CheckSquare },
];

export function TaskSidebar({ onNewTask, filter, onFilterChange, taskCounts }: TaskSidebarProps) {
    const { user, signIn, signUp } = useAuth();
  return (
    <Sidebar className="border-r border-border bg-gradient-subtle">
      <SidebarContent>
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-semibold text-lg text-foreground">TaskFlow</h1>
          </div>
          
          <Button 
            onClick={onNewTask}
            className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth shadow-soft"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium px-4">
            Tasks
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = filter === item.id;
                const count = taskCounts[item.id as keyof typeof taskCounts];
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onFilterChange(item.id)}
                      className={`flex items-center justify-between px-4 py-2.5 transition-smooth ${
                        isActive 
                          ? 'bg-primary/10 text-primary border-r-2 border-primary' 
                          : 'hover:bg-accent/50 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {count}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">{user.id}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}