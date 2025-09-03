import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TaskSidebar } from "./TaskSidebar";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";
import { Button } from "@/components/ui/button";
import { Search, Filter, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  // Load tasks from Supabase
  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter and search tasks
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'pending' && task.status === 'pending') ||
      (filter === 'completed' && task.status === 'completed');
    
    const matchesSearch = searchQuery === '' || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Task counts for sidebar
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = async (taskData: { id?: string; title: string; description?: string; priority: 'low' | 'medium' | 'high' }) => {
    if (!user) return;

    try {
      if (taskData.id) {
        // Update existing task
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
          })
          .eq('id', taskData.id)
          .eq('user_id', user.id);

        if (error) throw error;

        setTasks(prev => prev.map(task => 
          task.id === taskData.id 
            ? { ...task, title: taskData.title, description: taskData.description, priority: taskData.priority }
            : task
        ));

        toast({
          title: "Task updated",
          description: "Your task has been successfully updated.",
        });
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
          })
          .select()
          .single();

        if (error) throw error;

        setTasks(prev => [data as Task, ...prev]);
        toast({
          title: "Task created",
          description: "Your new task has been added successfully.",
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: "Error saving task",
        description: "Failed to save your task. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ));

      toast({
        title: task.status === 'completed' ? "Task marked as pending" : "Task completed",
        description: `"${task.title}" has been ${task.status === 'completed' ? 'marked as pending' : 'completed'}.`,
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      
      toast({
        title: "Task deleted",
        description: `"${task.title}" has been permanently removed.`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "Failed to delete the task. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <TaskSidebar 
          onNewTask={handleNewTask}
          filter={filter}
          onFilterChange={setFilter}
          taskCounts={taskCounts}
        />
        
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  {filter === 'all' && 'All Tasks'}
                  {filter === 'pending' && 'Pending Tasks'}
                  {filter === 'completed' && 'Completed Tasks'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-input border-border"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="border-border hover:bg-accent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Task List */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading your tasks...</p>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4 opacity-20">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'No matching tasks found' : 'No tasks yet'}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  {searchQuery 
                    ? 'Try adjusting your search terms or filters'
                    : 'Get started by creating your first task!'
                  }
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={handleNewTask}
                    className="bg-gradient-primary text-primary-foreground hover:opacity-90 transition-smooth"
                  >
                    Create Your First Task
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 max-w-4xl">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <TaskDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveTask}
          editingTask={editingTask}
        />
      </div>
    </SidebarProvider>
  );
}