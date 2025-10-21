"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Task {
  id: string;
  name: string;
  description: string;
  gold: number;
  experience: number;
}

interface TaskFormData {
  name: string;
  description: string;
  gold: number;
  experience: number;
}

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createForm, setCreateForm] = useState<TaskFormData>({
    name: "",
    description: "",
    gold: 0,
    experience: 0,
  });
  const [editForm, setEditForm] = useState<TaskFormData>({
    name: "",
    description: "",
    gold: 0,
    experience: 0,
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      name: "Test-BDA-1",
      description: "Solve this exercise in class",
      gold: 1000,
      experience: 1000,
    },
    {
      id: "2",
      name: "Test-BDA-2",
      description: "Solve this exercise in class",
      gold: 1000,
      experience: 1000,
    },
  ]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      id: Date.now().toString(),
      ...createForm,
    };
    setTasks([...tasks, newTask]);
    setCreateForm({ name: "", description: "", gold: 0, experience: 0 });
    setShowCreateModal(false);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTask) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id ? { ...task, ...editForm } : task
        )
      );
      setShowEditModal(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      name: task.name,
      description: task.description,
      gold: task.gold,
      experience: task.experience,
    });
    setShowEditModal(true);
  };

  return (
    <div className="flex w-full flex-col items-center gap-2 bg-white text-black dark:bg-neutral-900 dark:text-white">
      <section className="flex w-4/6 flex-col items-center justify-between px-4 py-2">
        <div className="p-2 text-center">
          <h2 className="text-4xl font-bold text-yellow-500 dark:text-neutral-500">
            Create track through forms with a certain Gold and experience
          </h2>
        </div>
      </section>

      <section className="flex w-3/6 flex-row items-center justify-between px-4 py-2">
        <div className="p-2">
          <h2 className="text-2xl font-bold">Tasks</h2>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-400">
              <p className="text-base">Create new Task</p>
            </Button>
          </DialogTrigger>
          <DialogContent className="border bg-white p-8 text-black">
            <DialogHeader>
              <DialogTitle className="flex w-full justify-center text-2xl font-bold">
                Create new Task
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="w-full space-y-4 p-3">
              <div>
                <Label className="mb-2 block text-gray-700">Name Task</Label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">Description</Label>
                <Textarea
                  placeholder="Description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Gold:</Label>
                  <Input
                    type="number"
                    placeholder="Gold"
                    value={createForm.gold}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        gold: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">
                    Experience:
                  </Label>
                  <Input
                    type="number"
                    placeholder="Experience"
                    value={createForm.experience}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        experience: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="btn-success w-full">
                Confirm
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="flex w-4/6 flex-col space-y-2 border-2 border-black px-4 py-2 dark:border-white">
        <div className="flex w-full items-center overflow-x-scroll rounded-sm">
          <Table className="w-full text-md shadow-md">
            <TableHeader className="border-b-2 border-black text-black dark:text-yellow-500">
              <TableRow>
                <TableHead className="p-3 px-5 text-left">Task Name</TableHead>
                <TableHead className="p-3 px-5 text-left">
                  Description
                </TableHead>
                <TableHead className="p-3 px-5 text-left">Gold</TableHead>
                <TableHead className="p-3 px-5 text-left">Experience</TableHead>
                <TableHead className="p-3 px-5 text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="space-y-2 border-b text-neutral-800 dark:text-neutral-200">
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="p-3 px-5 text-left">
                    {task.name}
                  </TableCell>
                  <TableCell className="p-3 px-5 text-left">
                    {task.description}
                  </TableCell>
                  <TableCell className="p-3 px-5 text-left">
                    {task.gold}
                  </TableCell>
                  <TableCell className="p-3 px-5 text-left">
                    {task.experience}
                  </TableCell>
                  <TableCell className="flex justify-center gap-2 p-3">
                    <Button
                      variant="destructive"
                      className="btn-error"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <span className="icon-[mi--delete]" />
                    </Button>
                    <Button
                      variant="default"
                      className="btn-info"
                      onClick={() => openEditModal(task)}
                    >
                      <span className="icon-[material-symbols--edit]" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="border bg-white p-8 text-black">
            <DialogHeader>
              <DialogTitle className="flex w-full justify-center text-2xl font-bold">
                Edit task
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTask} className="w-full space-y-4 p-3">
              <div>
                <Label className="mb-2 block text-gray-700">Name Task:</Label>
                <Input
                  type="text"
                  placeholder="Name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div>
                <Label className="mb-2 block text-gray-700">Description:</Label>
                <Textarea
                  placeholder="Description task"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  className="w-full bg-white"
                  required
                />
              </div>
              <div className="flex flex-row gap-4">
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">Gold:</Label>
                  <Input
                    type="number"
                    placeholder="Gold"
                    value={editForm.gold}
                    onChange={(e) =>
                      setEditForm({ ...editForm, gold: Number(e.target.value) })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label className="mb-2 block text-gray-700">
                    Experience:
                  </Label>
                  <Input
                    type="number"
                    placeholder="Experience"
                    value={editForm.experience}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        experience: Number(e.target.value),
                      })
                    }
                    className="w-full bg-white"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="btn-success w-full">
                Confirm
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
