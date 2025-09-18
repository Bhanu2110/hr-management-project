import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Form16Management } from "@/components/form16/Form16Management";
import { Form16Download } from "@/components/form16/Form16Download";

const Form16 = () => {
  const { isAdmin } = useAuth();

  // Mock employee data for admin view
  const mockEmployees = [
    {
      id: "1",
      employee_id: "EMP001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@company.com",
      department: "Engineering",
      position: "Software Developer",
    },
    {
      id: "2",
      employee_id: "EMP002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@company.com",
      department: "Marketing",
      position: "Marketing Manager",
    },
  ];

  if (isAdmin) {
    return (
      <AppLayout>
        <Form16Management employees={mockEmployees} />
      </AppLayout>
    );
  }

  // For employees, show only the Form 16 download component with sidebar
  return (
    <AppLayout>
      <Form16Download />
    </AppLayout>
  );
};

export default Form16;