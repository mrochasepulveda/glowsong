import * as import_react from 'react';

import styles from './OnboardingProgress.module.css';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
  labels,
}: OnboardingProgressProps) {
  return (
    <div className={styles.wrapper} aria-label={`Paso ${currentStep} de ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <import_react.Fragment key={stepNum}>
            {/* Círculo del paso */}
            <div className={styles.stepCol}>
              <div
                className={`
                  ${styles.circle}
                  ${isCompleted ? styles.circleCompleted : ''}
                  ${isActive ? styles.circleActive : ''}
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <span className={styles.stepNum}>{stepNum}</span>
                )}
              </div>
              <span
                className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}
              >
                {labels[i]}
              </span>
            </div>

            {/* Línea conectora (después del paso, excepto el último) */}
            {stepNum < totalSteps && (
              <div
                className={`${styles.connector} ${isCompleted ? styles.connectorActive : ''}`}
              />
            )}
          </import_react.Fragment>
        );
      })}
    </div>
  );
}
