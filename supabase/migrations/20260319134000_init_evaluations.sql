CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  evaluator_name TEXT NOT NULL,
  evaluation_date DATE NOT NULL,
  reevaluation_date DATE NOT NULL,
  preferred_time TEXT,
  objectives TEXT[],
  main_objective TEXT,
  target_date DATE,
  training_frequency TEXT,
  activity_level TEXT,
  practice_time TEXT,
  modalities TEXT,
  nutritional_status JSONB,
  meals_per_day TEXT,
  sleep_hours TEXT,
  supplements JSONB,
  medications JSONB,
  allergies JSONB,
  intolerances JSONB,
  smoking JSONB,
  alcohol TEXT,
  health_exams JSONB,
  diabetes BOOLEAN DEFAULT FALSE,
  hypertension BOOLEAN DEFAULT FALSE,
  respiratory_pathology BOOLEAN DEFAULT FALSE,
  cardio_pathology JSONB,
  surgeries JSONB,
  pains JSONB,
  available_days TEXT[],
  session_duration TEXT,
  enjoys_training TEXT[],
  dislikes_looking_at TEXT[],
  dislikes_training TEXT[],
  favorite_exercises TEXT,
  hated_exercises TEXT,
  discovery_source TEXT,
  health_insurance JSONB,
  emergency_contact TEXT,
  final_observations TEXT,
  client_links JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,

  CONSTRAINT check_evaluator_name CHECK (evaluator_name IN ('Carlos Falaschi', 'Milena Bonifácio', 'Roberto Fernandes'))
);

ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own evaluations" ON evaluations
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, recovery_token, 
    email_change_token_new, email_change, email_change_token_current, 
    phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'admin@zander.com',
    crypt('Zander123!', gen_salt('bf')), NOW(), NOW(), NOW(),
    '{"provider": "email", "providers": ["email"]}', '{"name": "Administrador Zander"}',
    false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', ''
  );
END $$;
