// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
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
            foreignKeyName: "avaliacao_acompanhamentos_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_acompanhamentos_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
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
            foreignKeyName: "avaliacao_history_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacao_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          avaliador_id: string | null
          created_at: string
          data_avaliacao: string | null
          data_reavaliacao: string | null
          desafio_zander_ativado_em: string | null
          desafio_zander_enviado_em: string | null
          desafio_zander_status: string
          evo_id: string | null
          id: string
          is_pre_avaliacao: boolean
          nao_cliente: boolean
          nome_cliente: string
          objectives: string[] | null
          periodo_treino: string | null
          professor_id: string | null
          respostas: Json | null
          status: Database["public"]["Enums"]["avaliacao_status"] | null
          telefone_cliente: string | null
        }
        Insert: {
          avaliador_id?: string | null
          created_at?: string
          data_avaliacao?: string | null
          data_reavaliacao?: string | null
          desafio_zander_ativado_em?: string | null
          desafio_zander_enviado_em?: string | null
          desafio_zander_status?: string
          evo_id?: string | null
          id?: string
          is_pre_avaliacao?: boolean
          nao_cliente?: boolean
          nome_cliente: string
          objectives?: string[] | null
          periodo_treino?: string | null
          professor_id?: string | null
          respostas?: Json | null
          status?: Database["public"]["Enums"]["avaliacao_status"] | null
          telefone_cliente?: string | null
        }
        Update: {
          avaliador_id?: string | null
          created_at?: string
          data_avaliacao?: string | null
          data_reavaliacao?: string | null
          desafio_zander_ativado_em?: string | null
          desafio_zander_enviado_em?: string | null
          desafio_zander_status?: string
          evo_id?: string | null
          id?: string
          is_pre_avaliacao?: boolean
          nao_cliente?: boolean
          nome_cliente?: string
          objectives?: string[] | null
          periodo_treino?: string | null
          professor_id?: string | null
          respostas?: Json | null
          status?: Database["public"]["Enums"]["avaliacao_status"] | null
          telefone_cliente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_messages: {
        Row: {
          created_at: string
          file_name: string | null
          file_url: string | null
          hidden_from_library: boolean
          id: string
          message: string
          priority: string
          sender_id: string
          target_role: string
          title: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          hidden_from_library?: boolean
          id?: string
          message: string
          priority?: string
          sender_id: string
          target_role: string
          title: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          hidden_from_library?: boolean
          id?: string
          message?: string
          priority?: string
          sender_id?: string
          target_role?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
            foreignKeyName: "links_avaliacao_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
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
      message_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          template: string
          title: string
          updated_at: string
          variables: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          template: string
          title: string
          updated_at?: string
          variables: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          template?: string
          title?: string
          updated_at?: string
          variables?: string
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
            foreignKeyName: "notifications_bulk_message_id_fkey"
            columns: ["bulk_message_id"]
            isOneToOne: false
            referencedRelation: "bulk_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      professor_change_requests: {
        Row: {
          avaliacao_id: string
          created_at: string
          id: string
          professor_id: string
          status: string
        }
        Insert: {
          avaliacao_id: string
          created_at?: string
          id?: string
          professor_id: string
          status?: string
        }
        Update: {
          avaliacao_id?: string
          created_at?: string
          id?: string
          professor_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professor_change_requests_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professor_change_requests_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reavaliacoes: {
        Row: {
          avaliacao_original_id: string
          created_at: string
          data_reavaliacao: string
          evolucao: Json | null
          id: string
          respostas_novas: Json
        }
        Insert: {
          avaliacao_original_id: string
          created_at?: string
          data_reavaliacao: string
          evolucao?: Json | null
          id?: string
          respostas_novas: Json
        }
        Update: {
          avaliacao_original_id?: string
          created_at?: string
          data_reavaliacao?: string
          evolucao?: Json | null
          id?: string
          respostas_novas?: Json
        }
        Relationships: [
          {
            foreignKeyName: "reavaliacoes_avaliacao_original_id_fkey"
            columns: ["avaliacao_original_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          ativo: boolean
          email: string
          foto_url: string | null
          id: string
          nome: string
          pending_role: Database["public"]["Enums"]["user_role"] | null
          pending_roles: string[] | null
          periodo: string | null
          periodos: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          roles: string[] | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          email: string
          foto_url?: string | null
          id: string
          nome: string
          pending_role?: Database["public"]["Enums"]["user_role"] | null
          pending_roles?: string[] | null
          periodo?: string | null
          periodos?: string[] | null
          role: Database["public"]["Enums"]["user_role"]
          roles?: string[] | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          pending_role?: Database["public"]["Enums"]["user_role"] | null
          pending_roles?: string[] | null
          periodo?: string | null
          periodos?: string[] | null
          role?: Database["public"]["Enums"]["user_role"]
          roles?: string[] | null
          telefone?: string | null
        }
        Relationships: []
      }
      video_automations_config: {
        Row: {
          created_at: string
          dias_trigger: number
          id: string
          is_active: boolean | null
          message_template: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          dias_trigger: number
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          dias_trigger?: number
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      videos_agendados: {
        Row: {
          avaliacao_id: string
          created_at: string
          data_envio: string | null
          dias_apos_avaliacao: number
          error_reason: string | null
          id: string
          status: string
          url_google_drive: string | null
          video_id_google_drive: string | null
        }
        Insert: {
          avaliacao_id: string
          created_at?: string
          data_envio?: string | null
          dias_apos_avaliacao: number
          error_reason?: string | null
          id?: string
          status?: string
          url_google_drive?: string | null
          video_id_google_drive?: string | null
        }
        Update: {
          avaliacao_id?: string
          created_at?: string
          data_envio?: string | null
          dias_apos_avaliacao?: number
          error_reason?: string | null
          id?: string
          status?: string
          url_google_drive?: string | null
          video_id_google_drive?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_agendados_avaliacao_id_fkey"
            columns: ["avaliacao_id"]
            isOneToOne: false
            referencedRelation: "avaliacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_completely: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      reset_user_password: { Args: { p_email: string }; Returns: undefined }
      send_bulk_message: {
        Args: {
          p_file_name?: string
          p_file_url?: string
          p_message: string
          p_priority?: string
          p_target_roles: string[]
          p_title: string
        }
        Returns: undefined
      }
      send_internal_communication: {
        Args: {
          p_file_name?: string
          p_file_url?: string
          p_message: string
          p_priority?: string
          p_target_roles: string[]
          p_target_users: string[]
          p_title: string
        }
        Returns: undefined
      }
    }
    Enums: {
      avaliacao_status: "pendente" | "em_progresso" | "concluido"
      user_role:
        | "coordenador"
        | "professor"
        | "avaliador"
        | "fisioterapeuta"
        | "nutricionista"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      avaliacao_status: ["pendente", "em_progresso", "concluido"],
      user_role: [
        "coordenador",
        "professor",
        "avaliador",
        "fisioterapeuta",
        "nutricionista",
      ],
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
//   avaliador_id: uuid (nullable)
//   nome_cliente: text (not null)
//   telefone_cliente: text (nullable)
//   data_avaliacao: date (nullable)
//   data_reavaliacao: date (nullable)
//   periodo_treino: text (nullable)
//   objectives: _text (nullable)
//   respostas: jsonb (nullable)
//   status: avaliacao_status (nullable, default: 'pendente'::avaliacao_status)
//   created_at: timestamp with time zone (not null, default: now())
//   professor_id: uuid (nullable)
//   evo_id: text (nullable)
//   is_pre_avaliacao: boolean (not null, default: false)
//   desafio_zander_status: text (not null, default: 'nenhum'::text)
//   desafio_zander_ativado_em: timestamp with time zone (nullable)
//   desafio_zander_enviado_em: timestamp with time zone (nullable)
//   nao_cliente: boolean (not null, default: false)
// Table: bulk_messages
//   id: uuid (not null, default: gen_random_uuid())
//   sender_id: uuid (not null)
//   target_role: text (not null)
//   title: text (not null)
//   message: text (not null)
//   priority: text (not null, default: 'normal'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   file_url: text (nullable)
//   file_name: text (nullable)
//   hidden_from_library: boolean (not null, default: false)
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
// Table: message_templates
//   id: text (not null)
//   title: text (not null)
//   template: text (not null)
//   variables: text (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   is_active: boolean (not null, default: true)
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
// Table: professor_change_requests
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   professor_id: uuid (not null)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: reavaliacoes
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_original_id: uuid (not null)
//   data_reavaliacao: date (not null)
//   respostas_novas: jsonb (not null)
//   evolucao: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   role: user_role (not null)
//   nome: text (not null)
//   telefone: text (nullable)
//   periodo: text (nullable)
//   foto_url: text (nullable)
//   pending_role: user_role (nullable)
//   roles: _text (nullable, default: '{}'::text[])
//   periodos: _text (nullable, default: '{}'::text[])
//   ativo: boolean (not null, default: true)
//   pending_roles: _text (nullable, default: '{}'::text[])
// Table: video_automations_config
//   id: uuid (not null, default: gen_random_uuid())
//   dias_trigger: integer (not null)
//   video_url: text (nullable)
//   message_template: text (nullable, default: 'Olá {{nome}}, tudo bem? Conforme o seu planejamento, aqui está o seu vídeo de hoje: {{link_video}}'::text)
//   is_active: boolean (nullable, default: true)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: videos_agendados
//   id: uuid (not null, default: gen_random_uuid())
//   avaliacao_id: uuid (not null)
//   dias_apos_avaliacao: integer (not null)
//   url_google_drive: text (nullable)
//   status: text (not null, default: 'pendente'::text)
//   data_envio: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   error_reason: text (nullable)
//   video_id_google_drive: text (nullable)

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
//   FOREIGN KEY avaliacoes_avaliador_id_fkey: FOREIGN KEY (avaliador_id) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY avaliacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY avaliacoes_professor_id_fkey: FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE SET NULL
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
// Table: message_templates
//   PRIMARY KEY message_templates_pkey: PRIMARY KEY (id)
// Table: notifications
//   FOREIGN KEY notifications_bulk_message_id_fkey: FOREIGN KEY (bulk_message_id) REFERENCES bulk_messages(id) ON DELETE CASCADE
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
// Table: professor_change_requests
//   FOREIGN KEY professor_change_requests_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY professor_change_requests_pkey: PRIMARY KEY (id)
//   FOREIGN KEY professor_change_requests_professor_id_fkey: FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
//   CHECK professor_change_requests_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'aprovado'::text, 'rejeitado'::text])))
// Table: reavaliacoes
//   FOREIGN KEY reavaliacoes_avaliacao_original_id_fkey: FOREIGN KEY (avaliacao_original_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY reavaliacoes_pkey: PRIMARY KEY (id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: video_automations_config
//   UNIQUE video_automations_config_dias_trigger_key: UNIQUE (dias_trigger)
//   PRIMARY KEY video_automations_config_pkey: PRIMARY KEY (id)
// Table: videos_agendados
//   FOREIGN KEY videos_agendados_avaliacao_id_fkey: FOREIGN KEY (avaliacao_id) REFERENCES avaliacoes(id) ON DELETE CASCADE
//   PRIMARY KEY videos_agendados_pkey: PRIMARY KEY (id)
//   CHECK videos_agendados_status_check: CHECK ((status = ANY (ARRAY['pendente'::text, 'enviado'::text])))

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
//   Policy "Allow select for authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Authenticated users can read all avaliacoes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Avaliadores can insert avaliacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('avaliador'::text = ANY (users.roles)))))
//   Policy "Avaliadores can update avaliacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('avaliador'::text = ANY (users.roles)))))
//   Policy "Coordinators have full access to avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//   Policy "Professors can insert pre-evaluations" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('professor'::text = ANY (users.roles))))) AND (is_pre_avaliacao = true))
//   Policy "Professors can update assigned avaliacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('professor'::text = ANY (users.roles))))) AND (professor_id = auth.uid()))
//   Policy "Users can manage their own avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (avaliador_id = auth.uid())
//     WITH CHECK: (avaliador_id = auth.uid())
// Table: bulk_messages
//   Policy "Users can insert bulk messages" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = sender_id)
//   Policy "Users can view bulk messages" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = sender_id) OR (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles))))))
// Table: evaluations
//   Policy "Users can manage their own evaluations" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: links_avaliacao
//   Policy "Coordinators can view all links" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//   Policy "Fisio and Nutri can view all links" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND (users.roles && ARRAY['fisioterapeuta'::text, 'nutricionista'::text]))))
//   Policy "Professors can view all links" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('professor'::text = ANY (users.roles)))))
//   Policy "Users can manage links of their avaliacoes" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM avaliacoes   WHERE ((avaliacoes.id = links_avaliacao.avaliacao_id) AND (avaliacoes.avaliador_id = auth.uid()))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM avaliacoes   WHERE ((avaliacoes.id = links_avaliacao.avaliacao_id) AND (avaliacoes.avaliador_id = auth.uid()))))
// Table: medicamentos
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: message_templates
//   Policy "authenticated_select_templates" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "coordenador_insert_templates" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//   Policy "coordenador_update_templates" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//     WITH CHECK: true
// Table: notifications
//   Policy "Coordinators can view all notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
//   Policy "System can insert notifications" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can update their own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "Users can view their own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
// Table: professor_change_requests
//   Policy "authenticated_insert" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (professor_id = auth.uid())
//   Policy "authenticated_select" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "coordenador_update" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
// Table: reavaliacoes
//   Policy "Allow insert for authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Allow select for authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: users
//   Policy "Coordinators can delete users" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users users_1   WHERE ((users_1.id = auth.uid()) AND ('coordenador'::text = ANY (users_1.roles)))))
//   Policy "Coordinators can insert users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM users users_1   WHERE ((users_1.id = auth.uid()) AND ('coordenador'::text = ANY (users_1.roles)))))
//   Policy "Coordinators can update users" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users users_1   WHERE ((users_1.id = auth.uid()) AND ('coordenador'::text = ANY (users_1.roles)))))
//   Policy "Users can insert themselves" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = id)
//   Policy "Users can read all users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Users can update themselves" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
// Table: video_automations_config
//   Policy "Coordinators can manage video configs" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))
// Table: videos_agendados
//   Policy "Coordinators can manage scheduled videos" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM users   WHERE ((users.id = auth.uid()) AND ('coordenador'::text = ANY (users.roles)))))

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
//     -- Só distribui se for uma avaliação real (não pré-avaliação) e se não tiver professor
//     IF NEW.is_pre_avaliacao = false AND NEW.professor_id IS NULL AND NEW.periodo_treino IS NOT NULL THEN
//       -- Tenta encontrar um professor que tenha o período correspondente nos seus periodos E ESTEJA ATIVO
//       -- Filtro adicional: exclui sumariamente perfis que possuam a role de 'coordenador'
//       SELECT u.id INTO selected_prof_id
//       FROM public.users u
//       LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//       WHERE 'professor' = ANY(u.roles) 
//         AND NOT ('coordenador' = ANY(u.roles))
//         AND NEW.periodo_treino = ANY(u.periodos) 
//         AND u.ativo = true
//       GROUP BY u.id
//       ORDER BY COUNT(a.id) ASC
//       LIMIT 1;
//   
//       -- Se não encontrar por período, pega qualquer professor ativo com menos avaliações
//       IF selected_prof_id IS NULL THEN
//         SELECT u.id INTO selected_prof_id
//         FROM public.users u
//         LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//         WHERE 'professor' = ANY(u.roles) 
//           AND NOT ('coordenador' = ANY(u.roles))
//           AND u.ativo = true
//         GROUP BY u.id
//         ORDER BY COUNT(a.id) ASC
//         LIMIT 1;
//       END IF;
//   
//       NEW.professor_id := selected_prof_id;
//     END IF;
//   
//     -- Define status inicial se estiver nulo (mesmo para pré-avaliação, garantindo a exibição correta no painel do professor)
//     IF NEW.status IS NULL THEN
//       NEW.status := 'pendente';
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION delete_user_completely(uuid)
//   CREATE OR REPLACE FUNCTION public.delete_user_completely(target_user_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_av RECORD;
//     selected_prof_id UUID;
//   BEGIN
//     IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND 'coordenador' = ANY(roles)) THEN
//       RAISE EXCEPTION 'Apenas coordenadores podem excluir usuários do sistema.';
//     END IF;
//   
//     -- Redistribute professor's avaliacoes
//     FOR v_av IN SELECT * FROM public.avaliacoes WHERE professor_id = target_user_id AND status IN ('pendente', 'em_progresso') LOOP
//       selected_prof_id := NULL;
//       
//       -- Tenta encontrar professor pelo mesmo periodo
//       IF v_av.periodo_treino IS NOT NULL THEN
//         SELECT u.id INTO selected_prof_id
//         FROM public.users u
//         LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//         WHERE 'professor' = ANY(u.roles) 
//           AND v_av.periodo_treino = ANY(u.periodos) 
//           AND u.ativo = true 
//           AND u.id != target_user_id
//         GROUP BY u.id
//         ORDER BY COUNT(a.id) ASC
//         LIMIT 1;
//       END IF;
//   
//       -- Se não encontrar no mesmo periodo, busca o com menor carga
//       IF selected_prof_id IS NULL THEN
//         SELECT u.id INTO selected_prof_id
//         FROM public.users u
//         LEFT JOIN public.avaliacoes a ON a.professor_id = u.id AND a.status IN ('pendente', 'em_progresso')
//         WHERE 'professor' = ANY(u.roles) 
//           AND u.ativo = true 
//           AND u.id != target_user_id
//         GROUP BY u.id
//         ORDER BY COUNT(a.id) ASC
//         LIMIT 1;
//       END IF;
//   
//       -- Atualiza
//       IF selected_prof_id IS NOT NULL THEN
//         UPDATE public.avaliacoes SET professor_id = selected_prof_id WHERE id = v_av.id;
//       ELSE
//         UPDATE public.avaliacoes SET professor_id = NULL WHERE id = v_av.id;
//       END IF;
//     END LOOP;
//   
//     -- Remove from auth.users (cascades to public.users but preserves evaluations)
//     DELETE FROM auth.users WHERE id = target_user_id;
//   END;
//   $function$
//   
// FUNCTION force_uppercase_names()
//   CREATE OR REPLACE FUNCTION public.force_uppercase_names()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     IF TG_TABLE_NAME = 'users' THEN
//       IF NEW.nome IS NOT NULL THEN
//         NEW.nome := UPPER(NEW.nome);
//       END IF;
//     ELSIF TG_TABLE_NAME = 'avaliacoes' THEN
//       IF NEW.nome_cliente IS NOT NULL THEN
//         NEW.nome_cliente := UPPER(NEW.nome_cliente);
//       END IF;
//     ELSIF TG_TABLE_NAME = 'evaluations' THEN
//       IF NEW.client_name IS NOT NULL THEN
//         NEW.client_name := UPPER(NEW.client_name);
//       END IF;
//     END IF;
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
//   DECLARE
//     v_roles text[];
//     v_periodos text[];
//   BEGIN
//     IF NEW.raw_user_meta_data->>'nome' IS NOT NULL THEN
//       
//       -- Trata o array de roles do metadado JSON
//       IF NEW.raw_user_meta_data->'roles' IS NOT NULL AND jsonb_array_length(NEW.raw_user_meta_data->'roles') > 0 THEN
//         SELECT array_agg(x::text) INTO v_roles FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'roles') x;
//       ELSIF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
//         v_roles := ARRAY[NEW.raw_user_meta_data->>'role'];
//       ELSE
//         v_roles := ARRAY['professor'];
//       END IF;
//   
//       -- Trata o array de periodos
//       IF NEW.raw_user_meta_data->'periodos' IS NOT NULL AND jsonb_array_length(NEW.raw_user_meta_data->'periodos') > 0 THEN
//         SELECT array_agg(x::text) INTO v_periodos FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'periodos') x;
//       ELSE
//         v_periodos := '{}'::text[];
//       END IF;
//   
//       INSERT INTO public.users (id, email, nome, telefone, role, roles, periodo, periodos)
//       VALUES (
//         NEW.id,
//         NEW.email,
//         NEW.raw_user_meta_data->>'nome',
//         NEW.raw_user_meta_data->>'telefone',
//         (v_roles[1])::public.user_role,
//         v_roles,
//         NEW.raw_user_meta_data->>'periodo',
//         v_periodos
//       )
//       ON CONFLICT (id) DO UPDATE SET
//         periodo = EXCLUDED.periodo,
//         periodos = EXCLUDED.periodos,
//         roles = EXCLUDED.roles,
//         nome = EXCLUDED.nome,
//         telefone = EXCLUDED.telefone;
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
// FUNCTION log_new_client_history()
//   CREATE OR REPLACE FUNCTION public.log_new_client_history()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//     DECLARE
//       v_role text;
//       v_nome text;
//       v_first_name text;
//       current_user_id UUID := auth.uid();
//     BEGIN
//       IF current_user_id IS NOT NULL THEN
//         SELECT role::text, nome INTO v_role, v_nome
//         FROM public.users
//         WHERE id = current_user_id;
//   
//         v_first_name := split_part(v_nome, ' ', 1);
//   
//         INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//         VALUES (
//           NEW.id,
//           current_user_id,
//           'CREATED',
//           'Cliente adicionado pelo ' || COALESCE(v_role, 'sistema') || ' ' || COALESCE(v_first_name, ''),
//           jsonb_build_object('is_pre_avaliacao', NEW.is_pre_avaliacao)
//         );
//       ELSE
//         INSERT INTO public.avaliacao_history (avaliacao_id, user_id, action_type, description, metadata)
//         VALUES (
//           NEW.id,
//           NULL,
//           'CREATED',
//           'Cliente adicionado pelo sistema',
//           jsonb_build_object('is_pre_avaliacao', NEW.is_pre_avaliacao)
//         );
//       END IF;
//       RETURN NEW;
//     END;
//     $function$
//   
// FUNCTION notify_desafio_zander_activation()
//   CREATE OR REPLACE FUNCTION public.notify_desafio_zander_activation()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.desafio_zander_status = 'ativo' AND OLD.desafio_zander_status != 'ativo' AND NEW.professor_id IS NOT NULL THEN
//           INSERT INTO public.notifications (user_id, title, message, type)
//           VALUES (
//               NEW.professor_id,
//               'Novo Aluno #DesafioZander',
//               'O cliente ' || NEW.nome_cliente || ' foi marcado como participante do #DesafioZander. Por favor, priorize a montagem do treino.',
//               'system'
//           );
//       END IF;
//       RETURN NEW;
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
// FUNCTION prevent_role_update()
//   CREATE OR REPLACE FUNCTION public.prevent_role_update()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Permite se for o superusuário/sistema (auth.uid nulo)
//     IF auth.uid() IS NULL THEN
//       RETURN NEW;
//     END IF;
//   
//     -- Permite se quem está alterando for um coordenador
//     IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'coordenador') THEN
//       RETURN NEW;
//     END IF;
//   
//     -- Se não for coordenador e estiver tentando alterar o próprio cargo, reverte a alteração
//     -- mas permite que outras colunas (nome, telefone, pending_role) sejam atualizadas
//     IF NEW.role IS DISTINCT FROM OLD.role THEN
//       NEW.role = OLD.role;
//     END IF;
//   
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION reset_desafio_on_concluido()
//   CREATE OR REPLACE FUNCTION public.reset_desafio_on_concluido()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.status = 'concluido' AND OLD.status IS DISTINCT FROM 'concluido' THEN
//           NEW.desafio_zander_status := 'nenhum';
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION reset_user_password(text)
//   CREATE OR REPLACE FUNCTION public.reset_user_password(p_email text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     v_user_id uuid;
//   BEGIN
//     SELECT id INTO v_user_id FROM auth.users WHERE email = lower(trim(p_email));
//     
//     IF v_user_id IS NOT NULL THEN
//       UPDATE auth.users
//       SET 
//         encrypted_password = extensions.crypt('teste1234', extensions.gen_salt('bf', 10)),
//         updated_at = NOW(),
//         email_confirmed_at = COALESCE(email_confirmed_at, NOW())
//       WHERE id = v_user_id;
//     ELSE
//       RAISE EXCEPTION 'Usuário não encontrado com este e-mail.';
//     END IF;
//   END;
//   $function$
//   
// FUNCTION schedule_videos_for_avaliacao()
//   CREATE OR REPLACE FUNCTION public.schedule_videos_for_avaliacao()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Insert into videos_agendados for each active config
//     -- Avoid duplicates by checking if it already exists
//     INSERT INTO public.videos_agendados (avaliacao_id, dias_apos_avaliacao, status)
//     SELECT NEW.id, dias_trigger, 'pendente'
//     FROM public.video_automations_config
//     WHERE is_active = true
//       AND NOT EXISTS (
//         SELECT 1 FROM public.videos_agendados 
//         WHERE avaliacao_id = NEW.id AND dias_apos_avaliacao = public.video_automations_config.dias_trigger
//       );
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION send_bulk_message(text[], text, text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.send_bulk_message(p_target_roles text[], p_title text, p_message text, p_priority text DEFAULT 'normal'::text, p_file_url text DEFAULT NULL::text, p_file_name text DEFAULT NULL::text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_sender_id UUID;
//       v_bulk_id UUID;
//   BEGIN
//       v_sender_id := auth.uid();
//   
//       IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND 'coordenador' = ANY(roles)) THEN
//         RAISE EXCEPTION 'Apenas coordenadores podem enviar comunicados.';
//       END IF;
//   
//       INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority, file_url, file_name)
//       VALUES (v_sender_id, array_to_string(p_target_roles, ', '), p_title, p_message, p_priority, p_file_url, p_file_name)
//       RETURNING id INTO v_bulk_id;
//   
//       IF 'todos' = ANY(p_target_roles) THEN
//         INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//         SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id FROM public.users WHERE id != v_sender_id;
//       ELSE
//         INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//         SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
//         FROM public.users
//         WHERE roles && p_target_roles AND id != v_sender_id;
//       END IF;
//   END;
//   $function$
//   
// FUNCTION send_internal_communication(text[], uuid[], text, text, text, text, text)
//   CREATE OR REPLACE FUNCTION public.send_internal_communication(p_target_roles text[], p_target_users uuid[], p_title text, p_message text, p_priority text DEFAULT 'normal'::text, p_file_url text DEFAULT NULL::text, p_file_name text DEFAULT NULL::text)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_sender_id UUID;
//       v_bulk_id UUID;
//       v_role_text text;
//   BEGIN
//       v_sender_id := auth.uid();
//   
//       IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_sender_id AND ativo = true) THEN
//         RAISE EXCEPTION 'Apenas usuários ativos podem enviar comunicados.';
//       END IF;
//   
//       v_role_text := array_to_string(p_target_roles, ', ');
//       IF array_length(p_target_users, 1) > 0 THEN
//         IF v_role_text = '' THEN
//           v_role_text := 'usuarios_especificos';
//         ELSE
//           v_role_text := v_role_text || ', usuarios_especificos';
//         END IF;
//       END IF;
//   
//       INSERT INTO public.bulk_messages (sender_id, target_role, title, message, priority, file_url, file_name)
//       VALUES (v_sender_id, COALESCE(NULLIF(v_role_text, ''), 'nenhum'), p_title, p_message, p_priority, p_file_url, p_file_name)
//       RETURNING id INTO v_bulk_id;
//   
//       -- Insert for roles
//       IF array_length(p_target_roles, 1) > 0 THEN
//         IF 'todos' = ANY(p_target_roles) THEN
//           INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//           SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id 
//           FROM public.users 
//           WHERE id != v_sender_id;
//         ELSE
//           INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//           SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
//           FROM public.users
//           WHERE (roles && p_target_roles OR role::text = ANY(p_target_roles))
//             AND id != v_sender_id;
//         END IF;
//       END IF;
//   
//       -- Insert for specific users
//       IF array_length(p_target_users, 1) > 0 THEN
//         INSERT INTO public.notifications (user_id, title, message, type, priority, bulk_message_id)
//         SELECT id, p_title, p_message, 'message', p_priority, v_bulk_id
//         FROM public.users
//         WHERE id = ANY(p_target_users) AND id != v_sender_id
//         AND NOT EXISTS (
//           SELECT 1 FROM public.notifications n 
//           WHERE n.user_id = public.users.id AND n.bulk_message_id = v_bulk_id
//         );
//       END IF;
//   END;
//   $function$
//   
// FUNCTION set_desafio_zander_activation_date()
//   CREATE OR REPLACE FUNCTION public.set_desafio_zander_activation_date()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       IF NEW.desafio_zander_status = 'ativo' AND OLD.desafio_zander_status != 'ativo' THEN
//           NEW.desafio_zander_ativado_em = NOW();
//           -- Força o status para pendente para garantir que o professor tenha que concluir novamente o treino
//           NEW.status = 'pendente';
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: avaliacao_acompanhamentos
//   on_acompanhamento_change_log: CREATE TRIGGER on_acompanhamento_change_log AFTER INSERT OR UPDATE ON public.avaliacao_acompanhamentos FOR EACH ROW EXECUTE FUNCTION log_acompanhamento_changes()
// Table: avaliacoes
//   force_uppercase_avaliacoes: CREATE TRIGGER force_uppercase_avaliacoes BEFORE INSERT OR UPDATE OF nome_cliente ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION force_uppercase_names()
//   on_avaliacao_assigned: CREATE TRIGGER on_avaliacao_assigned AFTER INSERT ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION notify_professor_on_assignment()
//   on_avaliacao_created_assign_professor: CREATE TRIGGER on_avaliacao_created_assign_professor BEFORE INSERT OR UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION auto_assign_professor()
//   on_avaliacao_created_log: CREATE TRIGGER on_avaliacao_created_log AFTER INSERT ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION log_new_client_history()
//   on_avaliacao_created_schedule_videos: CREATE TRIGGER on_avaliacao_created_schedule_videos AFTER INSERT OR UPDATE OF status, data_avaliacao ON public.avaliacoes FOR EACH ROW WHEN ((new.data_avaliacao IS NOT NULL)) EXECUTE FUNCTION schedule_videos_for_avaliacao()
//   on_avaliacao_status_concluido: CREATE TRIGGER on_avaliacao_status_concluido BEFORE UPDATE OF status ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION reset_desafio_on_concluido()
//   on_avaliacao_update_log: CREATE TRIGGER on_avaliacao_update_log AFTER UPDATE ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION log_avaliacao_updates()
//   on_desafio_zander_activated: CREATE TRIGGER on_desafio_zander_activated AFTER UPDATE OF desafio_zander_status ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION notify_desafio_zander_activation()
//   on_desafio_zander_set_date: CREATE TRIGGER on_desafio_zander_set_date BEFORE UPDATE OF desafio_zander_status ON public.avaliacoes FOR EACH ROW EXECUTE FUNCTION set_desafio_zander_activation_date()
// Table: evaluations
//   force_uppercase_evaluations: CREATE TRIGGER force_uppercase_evaluations BEFORE INSERT OR UPDATE OF client_name ON public.evaluations FOR EACH ROW EXECUTE FUNCTION force_uppercase_names()
// Table: users
//   force_uppercase_users: CREATE TRIGGER force_uppercase_users BEFORE INSERT OR UPDATE OF nome ON public.users FOR EACH ROW EXECUTE FUNCTION force_uppercase_names()
//   trg_prevent_role_update: CREATE TRIGGER trg_prevent_role_update BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION prevent_role_update()

// --- INDEXES ---
// Table: avaliacao_history
//   CREATE INDEX idx_avaliacao_history_avaliacao_id ON public.avaliacao_history USING btree (avaliacao_id)
// Table: avaliacoes
//   CREATE INDEX idx_avaliacoes_evo_id ON public.avaliacoes USING btree (evo_id)
//   CREATE UNIQUE INDEX idx_unique_active_evo ON public.avaliacoes USING btree (evo_id) WHERE ((evo_id IS NOT NULL) AND (status = ANY (ARRAY['pendente'::avaliacao_status, 'em_progresso'::avaliacao_status])))
// Table: medicamentos
//   CREATE UNIQUE INDEX medicamentos_nome_key ON public.medicamentos USING btree (nome)
// Table: professor_change_requests
//   CREATE UNIQUE INDEX idx_prof_change_req_pendente ON public.professor_change_requests USING btree (avaliacao_id, professor_id) WHERE (status = 'pendente'::text)
// Table: video_automations_config
//   CREATE UNIQUE INDEX video_automations_config_dias_trigger_key ON public.video_automations_config USING btree (dias_trigger)
// Table: videos_agendados
//   CREATE UNIQUE INDEX videos_agendados_avaliacao_dias_key ON public.videos_agendados USING btree (avaliacao_id, dias_apos_avaliacao)

