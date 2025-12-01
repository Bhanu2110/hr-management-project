// Compensation Record Selector Component
// Add this to the Generate Salary Slip dialog in SalaryManagement.tsx

// 1. Add these state variables after line 86:
const [compensationRecords, setCompensationRecords] = useState<Array<{ id: string; ctc: number; effective_date: string }>>([]);
const [selectedCompensation, setSelectedCompensation] = useState<string>("");

// 2. Add this useEffect after the fetchEmployees useEffect (around line 132):
// Fetch compensation records when employee is selected
useEffect(() => {
    const fetchCompensationRecords = async () => {
        if (!selectedEmployee) {
            setCompensationRecords([]);
            setSelectedCompensation("");
            return;
        }

        try {
            const employee = dbEmployees.find(emp => emp.employee_id === selectedEmployee);
            if (!employee) return;

            const { data, error } = await supabase
                .from('employee_compensation' as any)
                .select('id, ctc, effective_date')
                .eq('employee_id', employee.id)
                .order('effective_date', { ascending: false });

            if (error) throw error;
            setCompensationRecords(data || []);
        } catch (error) {
            console.error('Error fetching compensation records:', error);
            toast.error('Failed to load compensation records');
        }
    };

    fetchCompensationRecords();
}, [selectedEmployee, dbEmployees]);

// 3. Add this useEffect to auto-populate month/year:
// Auto-populate month/year when compensation is selected
useEffect(() => {
    if (!selectedCompensation) return;

    const compensation = compensationRecords.find(c => c.id === selectedCompensation);
    if (compensation) {
        const effectiveDate = new Date(compensation.effective_date);
        const month = effectiveDate.getMonth() + 1; // JavaScript months are 0-indexed
        const year = effectiveDate.getFullYear();

        setFormData(prev => ({
            ...prev,
            month,
            year,
        }));
    }
}, [selectedCompensation, compensationRecords]);

// 4. Add this UI component in the dialog after the employee selector (around line 708):
{
    compensationRecords.length > 0 && (
        <div className="space-y-2">
            <Label htmlFor="compensation">Select Compensation Record</Label>
            <Select value={selectedCompensation} onValueChange={setSelectedCompensation}>
                <SelectTrigger>
                    <SelectValue placeholder="Choose compensation record" />
                </SelectTrigger>
                <SelectContent>
                    {compensationRecords.map((comp) => {
                        const date = new Date(comp.effective_date);
                        const monthName = MONTHS.find(m => m.value === date.getMonth() + 1)?.label || '';
                        return (
                            <SelectItem key={comp.id} value={comp.id}>
                                ₹{comp.ctc.toLocaleString('en-IN')} - {monthName} {date.getFullYear()}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        </div>
    )
}

// 5. Make Month and Year fields read-only when compensation is selected:
// Replace the Month select (around line 710) with:
<div className="space-y-2">
  <Label htmlFor="month">Month</Label>
  <Select
    value={formData.month?.toString()}
    onValueChange={(value) => setFormData(prev => ({ ...prev, month: Number(value) }))}
    disabled={!!selectedCompensation}
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {MONTHS.map((month) => (
        <SelectItem key={month.value} value={month.value.toString()}>
          {month.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  {selectedCompensation && (
    <p className="text-xs text-muted-foreground">
      Auto-filled from compensation effective date
    </p>
  )}
</div>

// Replace the Year input (around line 732) with:
<div className="space-y-2">
  <Label htmlFor="year">Year</Label>
  <Input
    id="year"
    type="number"
    value={formData.year || 2024}
    onChange={(e) => setFormData(prev => ({ ...prev, year: Number(e.target.value) }))}
    disabled={!!selectedCompensation}
  />
  {selectedCompensation && (
    <p className="text-xs text-muted-foreground">
      Auto-filled from compensation effective date
    </p>
  )}
</div>
