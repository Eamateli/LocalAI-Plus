export function trackError(error: Error, context?: any) {
    if (import.meta.env.PROD) {
      // Send to your error tracking service
      console.error('Error tracked:', { error, context });
    }
  }