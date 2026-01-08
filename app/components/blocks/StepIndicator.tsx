'use client';

import { ADD_BLOCK_STEPS } from '@/app/constants/block';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  completedSteps?: number[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  onStepClick,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <div className="w-full px-6 py-8 bg-white border-b border-gray-200">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-gray-600 ml-2 whitespace-nowrap">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      {/* Steps */}
      <div className="flex gap-4">
        {ADD_BLOCK_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = isCompleted || step.id < currentStep;

          return (
            <div
              key={step.id}
              className="flex-1 text-center"
            >
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={`w-full transition-all duration-200 ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                }`}
              >
                {/* Step Circle */}
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Title */}
                <h3
                  className={`text-sm font-semibold transition-colors ${
                    isCurrent ? 'text-gray-900' : 'text-gray-600'
                  }`}
                >
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs text-gray-500 mt-1 leading-tight hidden sm:block">
                  {step.description}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
