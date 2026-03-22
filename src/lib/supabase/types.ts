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
      avaliacao_acompanhamentos: {
        Row: {
          autor_id: string
          avaliacao_id: string
          concluido: boolean
          concluido_em: string | null
          created_at: string
          id: string
          observacao: string
          prazo: string | null
        }
        Insert: {
          autor_id: string
          avaliacao_id: string
          concluido?: boolean
          concluido_em?: string | null
          created_at?: string
          id?: string
          observacao: string
          prazo?: string | null
        }
        Update: {
          autor_id?: string
          avaliacao_id?: string
          concluido?: boolean
          concluido_em?: string | null
          created_at?: string
          id?: string
          observacao?: string
          prazo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'avaliacao_acompanhamentos_autor_id_fkey'
            columns: ['autor_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacao_acompanhamentos_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
        ]
      }
      avaliacao_history: {
        Row: {
          action_type: string
          avaliacao_id: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          avaliacao_id: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          avaliacao_id?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'avaliacao_history_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'avaliacao_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliador_id: string
          created_at: string
          data_avaliacao: string
          data_reavaliacao: string
          evo_id: string | null
          id: string
          is_pre_avaliacao: boolean
          nome_cliente: string
          objectives: string[] | null
          periodo_treino: string | null
          professor_id: string | null
          respostas: Json | null
          status: Database['public']['Enums']['avaliacao_status'] | null
          telefone_cliente: string | null
        }
        Insert: {
          avaliador_id?: string
          created_at?: string
          data_avaliacao: string
          data_reavaliacao: string
          evo_id?: string | null
          id?: string
          is_pre_avaliacao?: boolean
          nome_cliente: string
          objectives?: string[] | null
          periodo_treino?: string | null
          professor_id?: string | null
          respostas?: Json | null
          status?: Database['public']['Enums']['avaliacao_status'] | null
          telefone_cliente?: string | null
        }
        Update: {
          avaliador_id?: string
          created_at?: string
          data_avaliacao?: string
          data_reavaliacao?: string
          evo_id?: string | null
          id?: string
          is_pre_avaliacao?: boolean
          nome_cliente?: string
          objectives?: string[] | null
          periodo_treino?: string | null
          professor_id?: string | null
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
          {
            foreignKeyName: 'avaliacoes_professor_id_fkey'
            columns: ['professor_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      bulk_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          sender_id: string
          target_role: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          sender_id: string
          target_role: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          sender_id?: string
          target_role?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bulk_messages_sender_id_fkey'
            columns: ['sender_id']
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
          relatorio_pdf_url: string | null
        }
        Insert: {
          anamnese_url?: string | null
          avaliacao_id: string
          bia_url?: string | null
          id?: string
          mapeamento_dor_url?: string | null
          mapeamento_sintomas_url?: string | null
          my_score_url?: string | null
          relatorio_pdf_url?: string | null
        }
        Update: {
          anamnese_url?: string | null
          avaliacao_id?: string
          bia_url?: string | null
          id?: string
          mapeamento_dor_url?: string | null
          mapeamento_sintomas_url?: string | null
          my_score_url?: string | null
          relatorio_pdf_url?: string | null
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
          verified: boolean
        }
        Insert: {
          acao_principal: string
          id?: string
          nome: string
          verified?: boolean
        }
        Update: {
          acao_principal?: string
          id?: string
          nome?: string
          verified?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          bulk_message_id: string | null
          created_at: string
          id: string
          is_archived: boolean
          is_read: boolean
          message: string
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          bulk_message_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message: string
          priority?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          bulk_message_id?: string | null
          created_at?: string
          id?: string
          is_archived?: boolean
          is_read?: boolean
          message?: string
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_bulk_message_id_fkey'
            columns: ['bulk_message_id']
            isOneToOne: false
            referencedRelation: 'bulk_messages'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          email: string
          foto_url: string | null
          id: string
          nome: string
          periodo: string | null
          role: Database['public']['Enums']['user_role']
          telefone: string | null
        }
        Insert: {
          email: string
          foto_url?: string | null
          id: string
          nome: string
          periodo?: string | null
          role: Database['public']['Enums']['user_role']
          telefone?: string | null
        }
        Update: {
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          periodo?: string | null
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
      send_bulk_message: {
        Args: {
          p_message: string
          p_priority?: string
          p_target_roles: string[]
          p_title: string
        }
        Returns: undefined
      }
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
// Table: avaliacao_acompanhamentos
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   autor_id: uuid (not null)
//   observacao: text (not null)
//   prazo: date (nullable)
//   concluido: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   concluido_em: timestamp with time zone (nullable)
// Table: avaliacao_history
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   user_id: uuid (nullable)
//   action_type: text (not null)
//   description: text (not null)
//   metadata: jsonb (nullable, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: now())
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
//   professor_id: uuid (nullable)
//   evo_id: text (nullable)
//   is_pre_avaliacao: boolean (not null, default: false)
// Table: bulk_messages
//   id: uuid (not null, default: gen_random_uuid())
//   sender_id: uuid (not null)
//   target_role: text (not null)
//   title: text (not null)
//   message: text (not null)
//   priority: text (not null, default: 'normal'::text)
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
//   relatorio_pdf_url: text (nullable)
// Table: medicamentos
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (not null)
//   acao_principal: text (not null)
//   verified: boolean (not null, default: false)
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   type: text (not null, default: 'system'::text)
//   is_read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   is_archived: boolean (not null, default: false)
//   priority: text (not null, default: 'normal'::text)
//   bulk_message_id: uuid (nullable)
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   role: user_role (not null)
//   nome: text (not null)
//   telefone: text (nullable)
//   periodo: text (nullable)
//   foto_url: text (nullable)

// --- CONSTRAINTS ---
// Table: avaliacao_acompanhamentos
//   FOREIGN KEY avaliacao_acompanhamentos_autor_id_fkey: FOREIGN KEY (autor_id) REFERENCES users(id) ON DELETE CASCADE
//   FOREIGN KEY avaliacao_acompanhamentos_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacao_acompanhamentos_pkey: PRIMARY KEY (id)
// Table: avaliacao_history
//   FOREIGN KEY avaliacao_history_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacao_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY avaliacao_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
// Table: avaliacoes
//   FOREIGN KEY avaliacoes_avaliador_id_fkey: FOREIGN KEY (avaliador_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY avaliacoes_professor_id_fkey: FOREIGN KEY (professor_id) REFERENCES users(id)
// Table: bulk_messages
//   PRIMARY KEY bulk_messages_pkey: PRIMARY KEY (id)
//   FOREIGN KEY bulk_messages_sender_id_fkey: FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
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
// Table: notifications
//   FOREIGN KEY notifications_bulk_message_id_fkey: FOREIGN KEY (bulk_message_id) REFERENCES bulk_messages(id) ON DELETE CASCADE
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: avaliacao_acompanhamentos
//   Policy "Allow insert for authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Allow select for authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow update for authenticated" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: avaliacao_history
//   Policy "Allow select for authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: avaliacoes
//   Policy "Avaliadores can insert avaliacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'avaliador'::user_role))))
//   Policy "Avaliadores can read all avaliacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'avaliador'::user_role))))
//   Policy "Avaliadores can update avaliacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'avaliador'::user_role))))
//   Policy "Coordinators have full access to avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
//   Policy "Everyone can view pre-evaluations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (is_pre_avaliacao = true)
//   Policy "Professors can insert pre-evaluations" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role)))) AND (is_pre_avaliacao = true))
//   Policy "Professors can update assigned avaliacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role)))) AND (professor_id = auth.uid()))
//   Policy "Professors can view assigned avaliacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'professor'::user_role)))) AND (professor_id = auth.uid()))
//   Policy "Users can manage their own avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (avaliador_id = auth.uid())
//     WITH CHECK: (avaliador_id = auth.uid())
// Table: bulk_messages
//   Policy "Coordinators can insert bulk messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
//   Policy "Coordinators can view all bulk messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.role = 'coordenador'::user_role))))
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
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: notifications
//   Policy "System can insert notifications" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can update their own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "Users can view their own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
// Table: users
//   Policy "Users can insert themselves" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can read all users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Users can update themselves" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)

// --- DATABASE FUNCTIONS ---
// FUNCTION auto_assign_professor()
//   CREATE OR REPLACE FUNCTION public.auto_assign_professor()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     selected_prof_id UUID;
//   BEGIN
//     -- Evaluation defaults to 'pendente' once saved by the evaluator
//     NEW.status := 'pendente';
//
//     IF NEW.professor_id IS NULL THEN
//       -- Find matching period with least workload
//       SELECT u.id INTO selected_prof_id
//       FROM public.users u
//       LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//       WHERE u.role = 'professor' AND u.periodo = NEW.periodo_treino
//       GROUP BY u.id
//       ORDER BY COUNT(a.id) ASC
//       LIMIT 1;
//
//       -- Fallback to any professor if no exact period match
//       IF selected_prof_id IS NULL THEN
//         SELECT u.id INTO selected_prof_id
//         FROM public.users u
//         LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//         WHERE u.role = 'professor'
//         GROUP BY u.id
//         ORDER BY COUNT(a.id) ASC
//         LIMIT 1;
//       END IF;
//
//       NEW.professor_id := selected_prof_id;
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION handle_new_user_custom()
//   CREATE OR REPLACE FUNCTION public.handle_new_user_custom()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
//       INSERT INTO public.users (id, email, nome, telefone, role, periodo)
//       VALUES (
//         NEW.id,
//         NEW.email,
//         NEW.raw_user_meta_data->>'nome',
//         NEW.raw_user_meta_data->>'telefone',
//         (NEW.raw_user_meta_data->>'role')::public.user_role,
//         NEW.raw_user_meta_data->>'periodo'
//       )
//       ON CONFLICT (id) DO UPDATE SET
//         periodo = EXCLUDED.periodo;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_acompanhamento_changes()
//   CREATE OR REPLACE FUNCTION public.log_acompanhamento_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     current_user_id UUID := auth.uid();
//   BEGIN
//     IF TG_OP = 'INSERT' THEN
//       INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//       VALUES (
//         NEW.avaliacao_id,
//         current_user_id,
//         'ACOMPANHAMENTO_ADDED',
//         'Nova observação ou tarefa adicionada',
//         jsonb_build_object('acompanhamento_id', NEW.id, 'prazo', NEW.prazo)
//       );
//     ELSIF TG_OP = 'UPDATE' THEN
//       IF OLD.concluido IS DISTINCT FROM NEW.concluido THEN
//         INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//         VALUES (
//           NEW.avaliacao_id,
//           current_user_id,
//           'ACOMPANHAMENTO_TOGGLED',
//           CASE WHEN NEW.concluido THEN 'Tarefa marcada como concluída' ELSE 'Tarefa reaberta' END,
//           jsonb_build_object('acompanhamento_id', NEW.id, 'concluido', NEW.concluido)
//         );
//       END IF;
//     END IF;
//     RETURN NULL;
//   END;
//   $function$
//
// FUNCTION log_avaliacao_updates()
//   CREATE OR REPLACE FUNCTION public.log_avaliacao_updates()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     current_user_id UUID := auth.uid();
//   BEGIN
//     IF OLD.status IS DISTINCT FROM NEW.status THEN
//       INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//       VALUES (
//         NEW.id,
//         current_user_id,
//         'STATUS_CHANGE',
//         'Status alterado de ' || COALESCE(OLD.status::text, 'nenhum') || ' para ' || COALESCE(NEW.status::text, 'nenhum'),
//         jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
//       );
//     END IF;
//
//     IF OLD.professor_id IS DISTINCT FROM NEW.professor_id AND NEW.professor_id IS NOT NULL THEN
//        INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//        VALUES (
//          NEW.id,
//          current_user_id,
//          'PROFESSOR_ASSIGNED',
//          'Professor atribuído para acompanhamento de treino',
//          jsonb_build_object('old_professor', OLD.professor_id, 'new_professor', NEW.professor_id)
//        );
//     END IF;
//
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION notify_professor_on_assignment()
//   CREATE OR REPLACE FUNCTION public.notify_professor_on_assignment()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF NEW.professor_id IS NOT NULL THEN
//       INSERT INTO public.notifications (user_id, title, message, type)
//       VALUES (
//         NEW.professor_id,
//         'Nova Avaliação Atribuída',
//         'O cliente ' || NEW.nome_cliente || ' foi atribuído a você para montagem do treino.',
//         'system'
//       );
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//
// FUNCTION send_bulk_message(text[], text, text, text)
//   CREATE OR REPLACE FUNCTION public.send_bulk_message(p_target_roles text[], p_title text, p_message text, p_priority text DEFAULT 'normal'::text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_sender_id UUID;
//     v_bulk_id UUID;
//   BEGIN
//     v_sender_id := auth.uid();
//
//     -- Verify caller is coordinator
//     IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND role = 'coordenador') THEN
//       RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
//     END IF;
//
//     -- Insert into bulk_messages (convert array to comma-separated string for display)
//     INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority)
//     VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority)
//     RETURNING id INTO v_bulk_id;
//
//     IF 'todos' = ANY(p_target_roles) THEN
//       -- Insert for everyone except the sender
//       INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//       SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
//     ELSE
//       -- Insert for specific roles
//       INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//       SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
//       FROM public.users
//       WHERE role::text = ANY(p_target_roles) AND id != v_sender_id;
//     END IF;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: avaliacao_acompanhamentos
//   on_acompanhamento_change_log: CREATE TRIGGER on_acompanhamento_change_log AFTER INSERT OR UPDATE ON public.avaliacao_acompanhamentos FOR EACH ROW EXECUTE FUNCTION log_acompanhamento_changes()
// Table: avaliacoes
//   on_avaliacao_assigned: CREATE TRIGGER on_avaliacao_assigned AFTER INSERT ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION notify_professor_on_assignment()
//   on_avaliacao_created_assign_professor: CREATE TRIGGER on_avaliacao_created_assign_professor BEFORE INSERT ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION auto_assign_professor()
//   on_avaliacao_update_log: CREATE TRIGGER on_avaliacao_update_log AFTER UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION log_avaliacao_updates()

// --- INDEXES ---
// Table: avaliacao_history
//   CREATE INDEX idx_avaliacao_history_avaliacao_id ON public.avaliacao_history USING btree (avaliacao_id)
// Table: avaliacoes
//   CREATE INDEX idx_avaliacoes_evo_id ON public.avaliacoes USING btree (evo_id)
// Table: medicamentos
//   CREATE UNIQUE INDEX medicamentos_nome_key ON public.medicamentos USING btree (nome)
