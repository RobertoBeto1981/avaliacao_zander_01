// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      avaliacoes: {
        Row: {
          avaliador_id: string
          created_at: string
          data_avaliacao: string
          data_reavaliacao: string
          id: string
          nome_cliente: string
          objectives: string[] | null
          periodo_treino: string | null
          respostas: Json | null
          status: Database['public']['Enums']['avaliacao_status'] | null
          telefone_cliente: string | null
        }
        Insert: {
          avaliador_id?: string
          created_at?: string
          data_avaliacao: string
          data_reavaliacao: string
          id?: string
          nome_cliente: string
          objectives?: string[] | null
          periodo_treino?: string | null
          respostas?: Json | null
          status?: Database['public']['Enums']['avaliacao_status'] | null
          telefone_cliente?: string | null
        }
        Update: {
          avaliador_id?: string
          created_at?: string
          data_avaliacao?: string
          data_reavaliacao?: string
          id?: string
          nome_cliente?: string
          objectives?: string[] | null
          periodo_treino?: string | null
          respostas?: Json | null
          status?: Database['public']['Enums']['avaliacao_status'] | null
          telefone_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'avaliacoes_avaliador_id_fkey'
            columns: ['avaliador_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      evaluations: {
        Row: {
          activity_level: string | null
          alcohol: string | null
          allergies: Json | null
          available_days: string[] | null
          cardio_pathology: Json | null
          client_links: Json | null
          client_name: string
          created_at: string
          diabetes: boolean | null
          discovery_source: string | null
          dislikes_looking_at: string[] | null
          dislikes_training: string[] | null
          emergency_contact: string | null
          enjoys_training: string[] | null
          evaluation_date: string
          evaluator_name: string
          favorite_exercises: string | null
          final_observations: string | null
          hated_exercises: string | null
          health_exams: Json | null
          health_insurance: Json | null
          hypertension: boolean | null
          id: string
          intolerances: Json | null
          main_objective: string | null
          meals_per_day: string | null
          medications: Json | null
          modalities: string | null
          nutritional_status: Json | null
          objectives: string[] | null
          pains: Json | null
          practice_time: string | null
          preferred_time: string | null
          reevaluation_date: string
          respiratory_pathology: boolean | null
          session_duration: string | null
          sleep_hours: string | null
          smoking: Json | null
          supplements: Json | null
          surgeries: Json | null
          target_date: string | null
          training_frequency: string | null
          user_id: string
        }
        Insert: {
          activity_level?: string | null
          alcohol?: string | null
          allergies?: Json | null
          available_days?: string[] | null
          cardio_pathology?: Json | null
          client_links?: Json | null
          client_name: string
          created_at?: string
          diabetes?: boolean | null
          discovery_source?: string | null
          dislikes_looking_at?: string[] | null
          dislikes_training?: string[] | null
          emergency_contact?: string | null
          enjoys_training?: string[] | null
          evaluation_date: string
          evaluator_name: string
          favorite_exercises?: string | null
          final_observations?: string | null
          hated_exercises?: string | null
          health_exams?: Json | null
          health_insurance?: Json | null
          hypertension?: boolean | null
          id?: string
          intolerances?: Json | null
          main_objective?: string | null
          meals_per_day?: string | null
          medications?: Json | null
          modalities?: string | null
          nutritional_status?: Json | null
          objectives?: string[] | null
          pains?: Json | null
          practice_time?: string | null
          preferred_time?: string | null
          reevaluation_date: string
          respiratory_pathology?: boolean | null
          session_duration?: string | null
          sleep_hours?: string | null
          smoking?: Json | null
          supplements?: Json | null
          surgeries?: Json | null
          target_date?: string | null
          training_frequency?: string | null
          user_id?: string
        }
        Update: {
          activity_level?: string | null
          alcohol?: string | null
          allergies?: Json | null
          available_days?: string[] | null
          cardio_pathology?: Json | null
          client_links?: Json | null
          client_name?: string
          created_at?: string
          diabetes?: boolean | null
          discovery_source?: string | null
          dislikes_looking_at?: string[] | null
          dislikes_training?: string[] | null
          emergency_contact?: string | null
          enjoys_training?: string[] | null
          evaluation_date?: string
          evaluator_name?: string
          favorite_exercises?: string | null
          final_observations?: string | null
          hated_exercises?: string | null
          health_exams?: Json | null
          health_insurance?: Json | null
          hypertension?: boolean | null
          id?: string
          intolerances?: Json | null
          main_objective?: string | null
          meals_per_day?: string | null
          medications?: Json | null
          modalities?: string | null
          nutritional_status?: Json | null
          objectives?: string[] | null
          pains?: Json | null
          practice_time?: string | null
          preferred_time?: string | null
          reevaluation_date?: string
          respiratory_pathology?: boolean | null
          session_duration?: string | null
          sleep_hours?: string | null
          smoking?: Json | null
          supplements?: Json | null
          surgeries?: Json | null
          target_date?: string | null
          training_frequency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      links_avaliacao: {
        Row: {
          anamnese_url: string | null
          avaliacao_id: string
          bia_url: string | null
          id: string
          mapeamento_dor_url: string | null
          mapeamento_sintomas_url: string | null
          my_score_url: string | null
        }
        Insert: {
          anamnese_url?: string | null
          avaliacao_id: string
          bia_url?: string | null
          id?: string
          mapeamento_dor_url?: string | null
          mapeamento_sintomas_url?: string | null
          my_score_url?: string | null
        }
        Update: {
          anamnese_url?: string | null
          avaliacao_id?: string
          bia_url?: string | null
          id?: string
          mapeamento_dor_url?: string | null
          mapeamento_sintomas_url?: string | null
          my_score_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'links_avaliacao_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
        ]
      }
      medicamentos: {
        Row: {
          acao_principal: string
          id: string
          nome: string
        }
        Insert: {
          acao_principal: string
          id?: string
          nome: string
        }
        Update: {
          acao_principal?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          email: string
          id: string
          nome: string
          role: Database['public']['Enums']['user_role']
          telefone: string | null
        }
        Insert: {
          email: string
          id: string
          nome: string
          role: Database['public']['Enums']['user_role']
          telefone?: string | null
        }
        Update: {
          email?: string
          id?: string
          nome?: string
          role?: Database['public']['Enums']['user_role']
          telefone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      avaliacao_status: 'pendente' | 'em_progresso' | 'concluido'
      user_role: 'coordenador' | 'professor' | 'avaliador' | 'fisioterapeuta' | 'nutricionista'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      avaliacao_status: ['pendente', 'em_progresso', 'concluido'],
      user_role: ['coordenador', 'professor', 'avaliador', 'fisioterapeuta', 'nutricionista'],
    },
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: avaliacoes
//   id: uuid (not null, default: gen_random_uuid())
//   avaliador_id: uuid (not null, default: auth.uid())
//   nome_cliente: text (not null)
//   telefone_cliente: text (nullable)
//   data_avaliacao: date (not null)
//   data_reavaliacao: date (not null)
//   periodo_treino: text (nullable)
//   objectives: _text (nullable)
//   respostas: jsonb (nullable)
//   status: avaliacao_status (nullable, default: 'concluido'::avaliacao_status)
//   created_at: timestamp with time zone (not null, default: now())
// Table: evaluations
//   id: uuid (not null, default: gen_random_uuid())
//   client_name: text (not null)
//   evaluator_name: text (not null)
//   evaluation_date: date (not null)
//   reevaluation_date: date (not null)
//   preferred_time: text (nullable)
//   objectives: _text (nullable)
//   main_objective: text (nullable)
//   target_date: date (nullable)
//   training_frequency: text (nullable)
//   activity_level: text (nullable)
//   practice_time: text (nullable)
//   modalities: text (nullable)
//   nutritional_status: jsonb (nullable)
//   meals_per_day: text (nullable)
//   sleep_hours: text (nullable)
//   supplements: jsonb (nullable)
//   medications: jsonb (nullable)
//   allergies: jsonb (nullable)
//   intolerances: jsonb (nullable)
//   smoking: jsonb (nullable)
//   alcohol: text (nullable)
//   health_exams: jsonb (nullable)
//   diabetes: boolean (nullable, default: false)
//   hypertension: boolean (nullable, default: false)
//   respiratory_pathology: boolean (nullable, default: false)
//   cardio_pathology: jsonb (nullable)
//   surgeries: jsonb (nullable)
//   pains: jsonb (nullable)
//   available_days: _text (nullable)
//   session_duration: text (nullable)
//   enjoys_training: _text (nullable)
//   dislikes_looking_at: _text (nullable)
//   dislikes_training: _text (nullable)
//   favorite_exercises: text (nullable)
//   hated_exercises: text (nullable)
//   discovery_source: text (nullable)
//   health_insurance: jsonb (nullable)
//   emergency_contact: text (nullable)
//   final_observations: text (nullable)
//   client_links: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   user_id: uuid (not null, default: auth.uid())
// Table: links_avaliacao
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   anamnese_url: text (nullable)
//   mapeamento_sintomas_url: text (nullable)
//   mapeamento_dor_url: text (nullable)
//   bia_url: text (nullable)
//   my_score_url: text (nullable)
// Table: medicamentos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   acao_principal: text (not null)
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   role: user_role (not null)
//   nome: text (not null)
//   telefone: text (nullable)

// --- CONSTRAINTS ---
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_avaliador_id_fkey: FOREIGN KEY (avaliador_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
// Table: evaluations
//   CHECK check_evaluator_name: CHECK ((evaluator_name = ANY (ARRAY['Carlos Falaschi'::text, 'Milena Bonifácio'::text, 'Roberto Fernandes'::text])))
//   PRIMARY KEY evaluations_pkey: PRIMARY KEY (id)
//   FOREIGN KEY evaluations_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: links_avaliacao
//   FOREIGN KEY links_avaliacao_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY links_avaliacao_pkey: PRIMARY KEY (id)
// Table: medicamentos
//   UNIQUE medicamentos_nome_key: UNIQUE (nome)
//   PRIMARY KEY medicamentos_pkey: PRIMARY KEY (id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: avaliacoes
//   Policy "Coordinators can view all avaliacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
//   Policy "Professors can update avaliacoes status" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role))))
//   Policy "Professors can view all avaliacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role))))
//   Policy "Users can manage their own avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = avaliador_id)
//     WITH CHECK: (auth.uid() = avaliador_id)
// Table: evaluations
//   Policy "Users can manage their own evaluations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: links_avaliacao
//   Policy "Coordinators can view all links" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
//   Policy "Professors can view all links" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role))))
//   Policy "Users can manage links of their avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM avaliacoes   WHERE ((avaliacoes.id = links_avaliacao.avaliacao_id) AND (avaliacoes.avaliador_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM avaliacoes   WHERE ((avaliacoes.id = links_avaliacao.avaliacao_id) AND (avaliacoes.avaliador_id = auth.uid()))))
// Table: medicamentos
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: users
//   Policy "Users can insert themselves" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can read all users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Users can update themselves" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)

// --- DATABASE FUNCTIONS ---
// FUNCTION handle_new_user_custom()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
//       INSERT INTO public.users (id, email, nome, telefone, role)
//       VALUES (
//         NEW.id,
//         NEW.email,
//         NEW.raw_user_meta_data->>'nome',
//         NEW.raw_user_meta_data->>'telefone',
//         (NEW.raw_user_meta_data->>'role')::user_role
//       );
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: medicamentos
//   CREATE UNIQUE INDEX medicamentos_nome_key ON public.medicamentos USING btree (nome)
