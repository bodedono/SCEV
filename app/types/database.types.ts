// Tipo genérico para o Supabase funcionar sem tipos gerados do schema.
// Para gerar tipos precisos: npx supabase gen types typescript --project-id <id> > app/types/database.types.ts

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
