import { useState, type ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddEmployeeForm } from "./AddEmployeeForm";

interface AddEmployeeDialogProps {
  onEmployeeAdded: () => void;
  trigger?: ReactNode;
}

export function AddEmployeeDialog({ onEmployeeAdded, trigger }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onEmployeeAdded();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-gradient-primary hover:opacity-90 text-black shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Fill in the employee details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AddEmployeeForm 
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
