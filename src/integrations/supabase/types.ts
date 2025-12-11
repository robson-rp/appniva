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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string | null
          currency: string
          current_balance: number
          id: string
          initial_balance: number
          institution_name: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          institution_name?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string | null
          currency?: string
          current_balance?: number
          id?: string
          initial_balance?: number
          institution_name?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_reconciliations: {
        Row: {
          account_id: string
          created_at: string
          external_amount: number
          external_date: string | null
          external_description: string | null
          id: string
          status: Database["public"]["Enums"]["reconciliation_status"]
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          external_amount: number
          external_date?: string | null
          external_description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["reconciliation_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          external_amount?: number
          external_date?: string | null
          external_description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["reconciliation_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_reconciliations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_reconciliations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      bond_otnrs: {
        Row: {
          coupon_frequency: Database["public"]["Enums"]["coupon_frequency"]
          coupon_rate_annual: number
          custodian_institution: string | null
          face_value_per_unit: number
          id: string
          investment_id: string
          isin: string | null
          quantity: number
        }
        Insert: {
          coupon_frequency?: Database["public"]["Enums"]["coupon_frequency"]
          coupon_rate_annual: number
          custodian_institution?: string | null
          face_value_per_unit: number
          id?: string
          investment_id: string
          isin?: string | null
          quantity?: number
        }
        Update: {
          coupon_frequency?: Database["public"]["Enums"]["coupon_frequency"]
          coupon_rate_annual?: number
          custodian_institution?: string | null
          face_value_per_unit?: number
          id?: string
          investment_id?: string
          isin?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "bond_otnrs_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount_limit: number
          category_id: string
          created_at: string | null
          id: string
          month: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_limit: number
          category_id: string
          created_at?: string | null
          id?: string
          month: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_limit?: number
          category_id?: string
          created_at?: string | null
          id?: string
          month?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["category_type"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      category_prediction_logs: {
        Row: {
          accepted: boolean | null
          confidence: number
          created_at: string
          description: string
          id: string
          predicted_category_id: string | null
          transaction_id: string | null
        }
        Insert: {
          accepted?: boolean | null
          confidence: number
          created_at?: string
          description: string
          id?: string
          predicted_category_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          accepted?: boolean | null
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          predicted_category_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "category_prediction_logs_predicted_category_id_fkey"
            columns: ["predicted_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_prediction_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_center_budgets: {
        Row: {
          alert_threshold: number | null
          amount_limit: number
          cost_center_id: string
          created_at: string | null
          id: string
          month: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_threshold?: number | null
          amount_limit: number
          cost_center_id: string
          created_at?: string | null
          id?: string
          month: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_threshold?: number | null
          amount_limit?: number
          cost_center_id?: string
          created_at?: string | null
          id?: string
          month?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_center_budgets_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      cost_centers: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          type: Database["public"]["Enums"]["cost_center_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: Database["public"]["Enums"]["cost_center_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: Database["public"]["Enums"]["cost_center_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          amount: number
          created_at: string | null
          debt_id: string
          id: string
          notes: string | null
          payment_date: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          debt_id: string
          id?: string
          notes?: string | null
          payment_date?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          debt_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      debts: {
        Row: {
          created_at: string | null
          currency: string
          current_balance: number
          id: string
          installment_amount: number
          installment_frequency: Database["public"]["Enums"]["installment_frequency"]
          institution: string | null
          interest_rate_annual: number
          name: string
          next_payment_date: string | null
          notes: string | null
          principal_amount: number
          status: Database["public"]["Enums"]["debt_status"]
          type: Database["public"]["Enums"]["debt_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          current_balance: number
          id?: string
          installment_amount: number
          installment_frequency?: Database["public"]["Enums"]["installment_frequency"]
          institution?: string | null
          interest_rate_annual?: number
          name: string
          next_payment_date?: string | null
          notes?: string | null
          principal_amount: number
          status?: Database["public"]["Enums"]["debt_status"]
          type?: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          current_balance?: number
          id?: string
          installment_amount?: number
          installment_frequency?: Database["public"]["Enums"]["installment_frequency"]
          institution?: string | null
          interest_rate_annual?: number
          name?: string
          next_payment_date?: string | null
          notes?: string | null
          principal_amount?: number
          status?: Database["public"]["Enums"]["debt_status"]
          type?: Database["public"]["Enums"]["debt_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goal_contributions: {
        Row: {
          amount: number
          created_at: string | null
          goal_id: string
          id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          goal_id: string
          id?: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          goal_id?: string
          id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          currency: string
          current_saved_amount: number | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          current_saved_amount?: number | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          target_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          current_saved_amount?: number | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number
          target_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      insights: {
        Row: {
          generated_at: string | null
          id: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_read: boolean | null
          message: string
          title: string
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          insight_type: Database["public"]["Enums"]["insight_type"]
          is_read?: boolean | null
          message: string
          title: string
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          insight_type?: Database["public"]["Enums"]["insight_type"]
          is_read?: boolean | null
          message?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          institution_name: string | null
          investment_type: Database["public"]["Enums"]["investment_type"]
          maturity_date: string | null
          name: string
          notes: string | null
          principal_amount: number
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string
          id?: string
          institution_name?: string | null
          investment_type: Database["public"]["Enums"]["investment_type"]
          maturity_date?: string | null
          name: string
          notes?: string | null
          principal_amount: number
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          institution_name?: string | null
          investment_type?: Database["public"]["Enums"]["investment_type"]
          maturity_date?: string | null
          name?: string
          notes?: string | null
          principal_amount?: number
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          monthly_income: number | null
          name: string
          onboarding_completed: boolean | null
          primary_currency: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          monthly_income?: number | null
          name: string
          onboarding_completed?: boolean | null
          primary_currency?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          monthly_income?: number | null
          name?: string
          onboarding_completed?: boolean | null
          primary_currency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scenarios: {
        Row: {
          created_at: string | null
          exchange_rate_projection: number | null
          future_expenses: Json | null
          id: string
          inflation_rate: number
          investment_return_rate: number
          monthly_expense_estimate: number
          monthly_income_estimate: number
          name: string
          notes: string | null
          salary_increase_rate: number
          time_horizon_years: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exchange_rate_projection?: number | null
          future_expenses?: Json | null
          id?: string
          inflation_rate?: number
          investment_return_rate?: number
          monthly_expense_estimate?: number
          monthly_income_estimate?: number
          name: string
          notes?: string | null
          salary_increase_rate?: number
          time_horizon_years?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exchange_rate_projection?: number | null
          future_expenses?: Json | null
          id?: string
          inflation_rate?: number
          investment_return_rate?: number
          monthly_expense_estimate?: number
          monthly_income_estimate?: number
          name?: string
          notes?: string | null
          salary_increase_rate?: number
          time_horizon_years?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      term_deposits: {
        Row: {
          auto_renew: boolean | null
          id: string
          interest_payment_frequency: Database["public"]["Enums"]["interest_payment_frequency"]
          interest_rate_annual: number
          investment_id: string
          tax_rate: number | null
          term_days: number
        }
        Insert: {
          auto_renew?: boolean | null
          id?: string
          interest_payment_frequency?: Database["public"]["Enums"]["interest_payment_frequency"]
          interest_rate_annual: number
          investment_id: string
          tax_rate?: number | null
          term_days: number
        }
        Update: {
          auto_renew?: boolean | null
          id?: string
          interest_payment_frequency?: Database["public"]["Enums"]["interest_payment_frequency"]
          interest_rate_annual?: number
          investment_id?: string
          tax_rate?: number | null
          term_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "term_deposits_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          cost_center_id: string | null
          created_at: string | null
          currency: string
          date: string
          description: string | null
          id: string
          related_account_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string
          date?: string
          description?: string | null
          id?: string
          related_account_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string | null
          currency?: string
          date?: string
          description?: string | null
          id?: string
          related_account_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_related_account_id_fkey"
            columns: ["related_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_documents: {
        Row: {
          created_at: string
          extracted_data: Json | null
          file_type: string
          file_url: string
          id: string
          original_filename: string | null
          processed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          extracted_data?: Json | null
          file_type: string
          file_url: string
          id?: string
          original_filename?: string | null
          processed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          extracted_data?: Json | null
          file_type?: string
          file_url?: string
          id?: string
          original_filename?: string | null
          processed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      account_type: "bank" | "wallet" | "cash" | "other"
      app_role: "admin" | "user"
      category_type: "expense" | "income"
      cost_center_type: "income_center" | "expense_center"
      coupon_frequency: "semiannual" | "annual"
      debt_status: "active" | "closed"
      debt_type:
        | "personal"
        | "mortgage"
        | "car"
        | "credit_card"
        | "student"
        | "other"
      goal_status: "in_progress" | "completed" | "cancelled"
      insight_type:
        | "high_expense"
        | "budget_overrun"
        | "savings_opportunity"
        | "goal_progress"
        | "investment_maturity"
      installment_frequency: "monthly" | "quarterly" | "semiannual" | "annual"
      interest_payment_frequency:
        | "monthly"
        | "quarterly"
        | "semiannual"
        | "at_maturity"
      investment_type:
        | "term_deposit"
        | "bond_otnr"
        | "fund"
        | "real_estate"
        | "equity"
        | "other"
      reconciliation_status: "matched" | "mismatched" | "pending"
      transaction_type: "income" | "expense" | "transfer"
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
      account_type: ["bank", "wallet", "cash", "other"],
      app_role: ["admin", "user"],
      category_type: ["expense", "income"],
      cost_center_type: ["income_center", "expense_center"],
      coupon_frequency: ["semiannual", "annual"],
      debt_status: ["active", "closed"],
      debt_type: [
        "personal",
        "mortgage",
        "car",
        "credit_card",
        "student",
        "other",
      ],
      goal_status: ["in_progress", "completed", "cancelled"],
      insight_type: [
        "high_expense",
        "budget_overrun",
        "savings_opportunity",
        "goal_progress",
        "investment_maturity",
      ],
      installment_frequency: ["monthly", "quarterly", "semiannual", "annual"],
      interest_payment_frequency: [
        "monthly",
        "quarterly",
        "semiannual",
        "at_maturity",
      ],
      investment_type: [
        "term_deposit",
        "bond_otnr",
        "fund",
        "real_estate",
        "equity",
        "other",
      ],
      reconciliation_status: ["matched", "mismatched", "pending"],
      transaction_type: ["income", "expense", "transfer"],
    },
  },
} as const
