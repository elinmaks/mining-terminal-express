export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      balance: {
        Row: {
          amount: number | null
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balance_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          block_number: number
          created_at: string | null
          difficulty: number | null
          hash: string
          id: string
          miner_profile_id: string | null
          reward: number | null
          size: number | null
          transactions: number | null
        }
        Insert: {
          block_number: number
          created_at?: string | null
          difficulty?: number | null
          hash: string
          id?: string
          miner_profile_id?: string | null
          reward?: number | null
          size?: number | null
          transactions?: number | null
        }
        Update: {
          block_number?: number
          created_at?: string | null
          difficulty?: number | null
          hash?: string
          id?: string
          miner_profile_id?: string | null
          reward?: number | null
          size?: number | null
          transactions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blocks_miner_profile_id_fkey"
            columns: ["miner_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      energy: {
        Row: {
          current_energy: number
          id: string
          last_update: string | null
          max_energy: number
          profile_id: string
          recovery_rate: number
        }
        Insert: {
          current_energy?: number
          id?: string
          last_update?: string | null
          max_energy?: number
          profile_id: string
          recovery_rate?: number
        }
        Update: {
          current_energy?: number
          id?: string
          last_update?: string | null
          max_energy?: number
          profile_id?: string
          recovery_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "energy_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_history: {
        Row: {
          action_type: string
          amount: number | null
          created_at: string | null
          description: string | null
          id: string
          profile_id: string
        }
        Insert: {
          action_type: string
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id: string
        }
        Update: {
          action_type?: string
          amount?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mining_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mining_sessions: {
        Row: {
          average_hashrate: number | null
          created_at: string | null
          end_time: string | null
          id: string
          profile_id: string
          start_time: string
          total_hashes: number | null
        }
        Insert: {
          average_hashrate?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          profile_id: string
          start_time?: string
          total_hashes?: number | null
        }
        Update: {
          average_hashrate?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          profile_id?: string
          start_time?: string
          total_hashes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mining_sessions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
          user_id: number
          username: string | null
        }
        Insert: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id: number
          username?: string | null
        }
        Update: {
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
          user_id?: number
          username?: string | null
        }
        Relationships: []
      }
      shares: {
        Row: {
          amount: number
          block_id: string
          created_at: string | null
          difficulty: number
          id: string
          profile_id: string
        }
        Insert: {
          amount?: number
          block_id: string
          created_at?: string | null
          difficulty: number
          id?: string
          profile_id: string
        }
        Update: {
          amount?: number
          block_id?: string
          created_at?: string | null
          difficulty?: number
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shares_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shares_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stars: {
        Row: {
          amount: number
          id: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          id?: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          id?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stars_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stars_history: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          operation_type: string
          profile_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          operation_type: string
          profile_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          operation_type?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stars_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      top_miners: {
        Row: {
          best_hashrate: number | null
          id: string
          profile_id: string | null
          rank: number | null
          total_blocks_mined: number | null
          total_reward: number | null
          updated_at: string | null
        }
        Insert: {
          best_hashrate?: number | null
          id?: string
          profile_id?: string | null
          rank?: number | null
          total_blocks_mined?: number | null
          total_reward?: number | null
          updated_at?: string | null
        }
        Update: {
          best_hashrate?: number | null
          id?: string
          profile_id?: string | null
          rank?: number | null
          total_blocks_mined?: number | null
          total_reward?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "top_miners_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      verify_telegram_user: {
        Args: {
          user_id: number
          first_name: string
          last_name: string
          username: string
        }
        Returns: string
      }
    }
    Enums: {
      mining_event_type:
        | "block_mined"
        | "session_started"
        | "session_ended"
        | "reward_received"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
