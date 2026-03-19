import { z } from 'zod'
import { EVALUATORS } from '@/constants/options'

export const evaluationSchema = z.object({
  client_name: z.string().min(2, 'Obrigatório'),
  evaluator_name: z.enum(EVALUATORS, { required_error: 'Obrigatório' }),
  evaluation_date: z.date({ required_error: 'Obrigatório' }),
  reevaluation_date: z.date(),
  preferred_time: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  main_objective: z.string().optional(),
  target_date: z.date().optional().nullable(),
  training_frequency: z.string().optional(),
  activity_level: z.string().optional(),
  practice_time: z.string().optional(),
  modalities: z.string().optional(),
  nutritional_status: z
    .object({ choice: z.string().optional(), reason: z.string().optional() })
    .optional(),
  meals_per_day: z.string().optional(),
  sleep_hours: z.string().optional(),
  supplements: z
    .object({ choice: z.boolean().default(false), list: z.string().optional() })
    .optional(),
  medications: z
    .object({ choice: z.boolean().default(false), list: z.string().optional() })
    .optional(),
  allergies: z
    .object({ choice: z.boolean().default(false), list: z.string().optional() })
    .optional(),
  intolerances: z
    .object({ choices: z.array(z.string()).default([]), list: z.string().optional() })
    .optional(),
  smoking: z
    .object({ choice: z.boolean().default(false), amount: z.string().optional() })
    .optional(),
  alcohol: z.string().optional(),
  health_exams: z
    .object({ choice: z.string().optional(), notes: z.string().optional() })
    .optional(),
  diabetes: z.boolean().default(false),
  hypertension: z.boolean().default(false),
  respiratory_pathology: z.boolean().default(false),
  cardio_pathology: z
    .object({ choice: z.boolean().default(false), list: z.string().optional() })
    .optional(),
  surgeries: z
    .object({ choice: z.boolean().default(false), list: z.string().optional() })
    .optional(),
  pains: z
    .object({ choice: z.boolean().default(false), observation: z.string().optional() })
    .optional(),
  available_days: z.array(z.string()).default([]),
  session_duration: z.string().optional(),
  enjoys_training: z.array(z.string()).default([]),
  dislikes_looking_at: z.array(z.string()).default([]),
  dislikes_training: z.array(z.string()).default([]),
  favorite_exercises: z.string().optional(),
  hated_exercises: z.string().optional(),
  discovery_source: z.string().optional(),
  health_insurance: z
    .object({ choice: z.string().optional(), other: z.string().optional() })
    .optional(),
  emergency_contact: z.string().optional(),
  final_observations: z.string().optional(),
  client_links: z
    .object({
      symptoms: z.string().optional(),
      pain: z.string().optional(),
      bia: z.string().optional(),
      myscore: z.string().optional(),
    })
    .optional(),
})

export type EvaluationFormValues = z.infer<typeof evaluationSchema>
