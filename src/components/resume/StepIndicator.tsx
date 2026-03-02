import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index < currentStep
                  ? "bg-success text-success-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`text-xs mt-2 text-center font-medium hidden sm:block ${
                index === currentStep ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-2 transition-all duration-300 ${
                index < currentStep ? "bg-success" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;
