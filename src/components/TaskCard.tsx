import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Clock, Calendar } from "lucide-react";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const priorityIcons = {
  low: '🟢',
  medium: '🟡',
  high: '🔴'
};

export function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="group relative overflow-hidden border-0 bg-gradient-card shadow-soft hover:shadow-medium transition-smooth"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
        <Checkbox
          checked={task.status === 'completed'}
          onCheckedChange={() => onToggleComplete(task.id)}
          className="mt-1"
        />

        <div className={`flex-1 ${task.status === 'completed' ? 'opacity-60' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-medium text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h3>
            
            <div className={`flex gap-1 transition-smooth ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(task)}
                className="h-7 w-7 p-0 hover:bg-accent"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mb-3 ${task.status === 'completed' ? 'line-through text-muted-foreground/70' : 'text-muted-foreground'}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <Badge className={`text-xs ${priorityColors[task.priority]} border-0`}>
              <span className="mr-1">{priorityIcons[task.priority]}</span>
              {task.priority}
            </Badge>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );
}