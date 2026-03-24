import { z } from 'zod'

export const evaluationSchema = z.object({
  evo_id: z.string().optional(),
  nome_cliente: z.string().min(2, 'Obrigatório'),
  telefone_cliente: z.string().min(8, 'Obrigatório'),
  data_avaliacao: z.date({ required_error: 'Obrigatório' }),
  data_reavaliacao: z.date(),
  periodo_treino: z.string().optional(),
  objectives: z.array(z.string()).default([]),

  data_nascimento: z.date().optional().nullable(),
  gender: z.string().optional(),

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

  hemodynamics: z
    .object({
      systolic_bp: z.string().optional(),
      diastolic_bp: z.string().optional(),
      heart_rate: z.string().optional(),
    })
    .optional(),

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

  anthropometry: z
    .object({
      weight: z.string().optional(),
      height: z.string().optional(),
      shoulders: z.string().optional(),
      chest: z.string().optional(),
      waist: z.string().optional(),
      abdomen: z.string().optional(),
      hips: z.string().optional(),
      right_arm_relaxed: z.string().optional(),
      right_arm_flexed: z.string().optional(),
      right_forearm: z.string().optional(),
      left_arm_relaxed: z.string().optional(),
      left_arm_flexed: z.string().optional(),
      left_forearm: z.string().optional(),
      right_thigh: z.string().optional(),
      right_calf: z.string().optional(),
      left_thigh: z.string().optional(),
      left_calf: z.string().optional(),
    })
    .optional(),

  vo2_test: z
    .object({
      enabled: z.boolean().default(false),
      bpm: z.number().optional(),
      beats_15s: z.number().optional(),
      vo2_max: z.string().optional(),
      classification: z.string().optional(),
    })
    .optional(),

  final_observations: z.string().optional(),
  professor_observations: z.string().optional(),
  emergency_contact: z.string().optional(),

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
