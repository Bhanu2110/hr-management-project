import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditEmployeeForm } from "./EditEmployeeForm";
import { Employee } from "@/services/api";

interface EditEmployeeDialogProps {
  employee: Employee;
  onEmployeeUpdated: () => void;
  trigger?: React.ReactNode;
}

export function EditEmployeeDialog({ employee, onEmployeeUpdated, trigger }: EditEmployeeDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onEmployeeUpdated();
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {trigger || defaultTrigger}
      </div>
      <DialogContent className="w-[90vw] max-w-[1400px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update the employee details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <EditEmployeeForm
            employee={employee}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
