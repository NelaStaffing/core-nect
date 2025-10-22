import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/lib/auth";
import { UserCircle, Briefcase, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type RoleOption = Exclude<UserRole, 'admin'>;

const roleOptions: { value: RoleOption; label: string; icon: any; description: string }[] = [
  {
    value: 'employee',
    label: 'Employee',
    icon: UserCircle,
    description: 'Standard employee access',
  },
  {
    value: 'manager',
    label: 'Manager',
    icon: Briefcase,
    description: 'Team management access',
  },
  {
    value: 'company',
    label: 'Company',
    icon: Building2,
    description: 'Company-wide admin access',
  },
];

interface FormData {
  role: RoleOption | null;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
  companyName?: string;
  contractType?: string;
  dateStarted?: string;
  jobTitle?: string;
}

export default function CreateUserForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    role: null,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyId: '',
    companyName: '',
    contractType: '',
    dateStarted: '',
    jobTitle: '',
  });

  const handleRoleSelect = (role: RoleOption) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // TODO: Implement user creation
    console.log('Creating user:', formData);
  };

  const canProceed = () => {
    if (step === 2) {
      const baseFields = formData.firstName && formData.lastName && formData.email && formData.password;
      if (formData.role === 'employee' || formData.role === 'manager') {
        return baseFields && formData.companyId && formData.contractType && formData.dateStarted && formData.jobTitle;
      }
      if (formData.role === 'company') {
        return baseFields && formData.companyName;
      }
      return baseFields;
    }
    return false;
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Create New User</h2>
        <p className="text-muted-foreground">
          {step === 1 ? 'Select the role for the new user' : 'Fill in the user details'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-medium",
            step === 1 ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            1
          </div>
          <div className="w-16 h-0.5 bg-muted" />
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-medium",
            step === 2 ? "bg-primary text-primary-foreground" : "bg-muted"
          )}>
            2
          </div>
        </div>
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-3">
          {roleOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleRoleSelect(option.value)}
                className={cn(
                  "p-6 border-2 rounded-lg transition-all hover:border-primary hover:shadow-md",
                  "flex flex-col items-center text-center gap-3",
                  formData.role === option.value ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <Icon className="h-12 w-12 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">{option.label}</h3>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: User Information */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Company Selection for Employee and Manager */}
          {(formData.role === 'employee' || formData.role === 'manager') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company-1">Acme Corporation</SelectItem>
                    <SelectItem value="company-2">Tech Innovations Inc</SelectItem>
                    <SelectItem value="company-3">Global Solutions Ltd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional fields shown when company is selected */}
              {formData.companyId && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="contractType">Contract Type</Label>
                    <Select value={formData.contractType} onValueChange={(value) => handleInputChange('contractType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contract type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="full-time">Full Time</SelectItem>
                        <SelectItem value="part-time">Part Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dateStarted">Date Started</Label>
                      <Input
                        id="dateStarted"
                        type="date"
                        value={formData.dateStarted}
                        onChange={(e) => handleInputChange('dateStarted', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={formData.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Company Name for Company Role */}
          {formData.role === 'company' && (
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Acme Corporation"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canProceed()}
              className="flex-1 flex items-center justify-center gap-2"
            >
              Create User
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
