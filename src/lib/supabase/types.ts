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
          file_category: string | null
          file_name: string | null
          file_url: string | null
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
          file_category?: string | null
          file_name?: string | null
          file_url?: string | null
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
          file_category?: string | null
          file_name?: string | null
          file_url?: string | null
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
          status: Database['public']['Enums']['avaliacao_status'] | null
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
          status?: Database['public']['Enums']['avaliacao_status'] | null
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
      internal_chats: {
        Row: {
          avaliacao_id: string | null
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_read: boolean
          message: string
          receiver_id: string | null
          sender_id: string
          target_role: string | null
        }
        Insert: {
          avaliacao_id?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message: string
          receiver_id?: string | null
          sender_id: string
          target_role?: string | null
        }
        Update: {
          avaliacao_id?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_read?: boolean
          message?: string
          receiver_id?: string | null
          sender_id?: string
          target_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'internal_chats_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'internal_chats_receiver_id_fkey'
            columns: ['receiver_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'internal_chats_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
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
            foreignKeyName: 'professor_change_requests_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'professor_change_requests_professor_id_fkey'
            columns: ['professor_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
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
            foreignKeyName: 'reavaliacoes_avaliacao_original_id_fkey'
            columns: ['avaliacao_original_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
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
          pending_role: Database['public']['Enums']['user_role'] | null
          pending_roles: string[] | null
          periodo: string | null
          periodos: string[] | null
          role: Database['public']['Enums']['user_role']
          roles: string[] | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          email: string
          foto_url?: string | null
          id: string
          nome: string
          pending_role?: Database['public']['Enums']['user_role'] | null
          pending_roles?: string[] | null
          periodo?: string | null
          periodos?: string[] | null
          role: Database['public']['Enums']['user_role']
          roles?: string[] | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          email?: string
          foto_url?: string | null
          id?: string
          nome?: string
          pending_role?: Database['public']['Enums']['user_role'] | null
          pending_roles?: string[] | null
          periodo?: string | null
          periodos?: string[] | null
          role?: Database['public']['Enums']['user_role']
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
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          dias_trigger: number
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          dias_trigger?: number
          id?: string
          is_active?: boolean | null
          message_template?: string | null
          title?: string
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
            foreignKeyName: 'videos_agendados_avaliacao_id_fkey'
            columns: ['avaliacao_id']
            isOneToOne: false
            referencedRelation: 'avaliacoes'
            referencedColumns: ['id']
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
      import_aluno_csv_safely: {
        Args: {
          p_evo_id: string
          p_nome_cliente: string
          p_professor_id: string
          p_telefone_cliente: string
        }
        Returns: Json
      }
      mark_chat_messages_as_read: {
        Args: {
          p_contact_id: string
          p_contact_name?: string
          p_contact_type: string
          p_user_id: string
        }
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
      upsert_aluno_dialog: {
        Args: {
          p_evo_id: string
          p_nome_cliente: string
          p_professor_id: string
          p_telefone_cliente: string
        }
        Returns: Json
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
