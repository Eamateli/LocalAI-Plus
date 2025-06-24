const requiredEnvVars = ['VITE_API_URL'] as const;

export function validateEnv() {
  const missing = requiredEnvVars.filter(
    key => !import.meta.env[key]
  );
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
}

// Call in main.tsx before rendering
validateEnv();