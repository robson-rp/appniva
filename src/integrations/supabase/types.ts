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
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_table: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string | null
          target_user_id?: string | null
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
      exchange_rate_alerts: {
        Row: {
          alert_direction: string
          base_currency: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered_at: string | null
          target_currency: string
          threshold_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_direction: string
          base_currency?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          target_currency?: string
          threshold_rate: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_direction?: string
          base_currency?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          target_currency?: string
          threshold_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          base_currency: string
          created_at: string
          fetched_at: string
          id: string
          rate: number
          source: string | null
          target_currency: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          fetched_at?: string
          id?: string
          rate: number
          source?: string | null
          target_currency: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          fetched_at?: string
          id?: string
          rate?: number
          source?: string | null
          target_currency?: string
        }
        Relationships: []
      }
      financial_products: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          institution_name: string
          interest_rate_annual: number | null
          is_active: boolean | null
          max_amount: number | null
          min_amount: number
          name: string
          product_type: Database["public"]["Enums"]["financial_product_type"]
          requirements: Json | null
          term_max_days: number | null
          term_min_days: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          institution_name: string
          interest_rate_annual?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name: string
          product_type: Database["public"]["Enums"]["financial_product_type"]
          requirements?: Json | null
          term_max_days?: number | null
          term_min_days?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          institution_name?: string
          interest_rate_annual?: number | null
          is_active?: boolean | null
          max_amount?: number | null
          min_amount?: number
          name?: string
          product_type?: Database["public"]["Enums"]["financial_product_type"]
          requirements?: Json | null
          term_max_days?: number | null
          term_min_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      financial_scores: {
        Row: {
          created_at: string
          criteria_json: Json
          generated_at: string
          id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          criteria_json?: Json
          generated_at?: string
          id?: string
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          criteria_json?: Json
          generated_at?: string
          id?: string
          score?: number
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
      inflation_rates: {
        Row: {
          annual_rate: number
          country: string
          created_at: string
          id: string
          month: string
          monthly_rate: number | null
          source: string | null
        }
        Insert: {
          annual_rate: number
          country?: string
          created_at?: string
          id?: string
          month: string
          monthly_rate?: number | null
          source?: string | null
        }
        Update: {
          annual_rate?: number
          country?: string
          created_at?: string
          id?: string
          month?: string
          monthly_rate?: number | null
          source?: string | null
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
      kixikila_contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          kixikila_id: string
          member_id: string
          notes: string | null
          paid_at: string
          round_number: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          kixikila_id: string
          member_id: string
          notes?: string | null
          paid_at?: string
          round_number: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kixikila_id?: string
          member_id?: string
          notes?: string | null
          paid_at?: string
          round_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "kixikila_contributions_kixikila_id_fkey"
            columns: ["kixikila_id"]
            isOneToOne: false
            referencedRelation: "kixikilas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kixikila_contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "kixikila_members"
            referencedColumns: ["id"]
          },
        ]
      }
      kixikila_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_creator: boolean
          kixikila_id: string
          name: string
          order_number: number
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_creator?: boolean
          kixikila_id: string
          name: string
          order_number: number
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_creator?: boolean
          kixikila_id?: string
          name?: string
          order_number?: number
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kixikila_members_kixikila_id_fkey"
            columns: ["kixikila_id"]
            isOneToOne: false
            referencedRelation: "kixikilas"
            referencedColumns: ["id"]
          },
        ]
      }
      kixikilas: {
        Row: {
          contribution_amount: number
          created_at: string
          currency: string
          current_round: number
          description: string | null
          frequency: string
          id: string
          name: string
          start_date: string
          status: string
          total_members: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contribution_amount: number
          created_at?: string
          currency?: string
          current_round?: number
          description?: string | null
          frequency: string
          id?: string
          name: string
          start_date: string
          status?: string
          total_members?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contribution_amount?: number
          created_at?: string
          currency?: string
          current_round?: number
          description?: string | null
          frequency?: string
          id?: string
          name?: string
          start_date?: string
          status?: string
          total_members?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      participant_group_members: {
        Row: {
          created_at: string
          email: string | null
          group_id: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          group_id: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          group_id?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "participant_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "participant_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_groups: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_requests: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          requested_amount: number
          requested_term_days: number | null
          response_notes: string | null
          status: Database["public"]["Enums"]["product_request_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          requested_amount: number
          requested_term_days?: number | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["product_request_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          requested_amount?: number
          requested_term_days?: number | null
          response_notes?: string | null
          status?: Database["public"]["Enums"]["product_request_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "financial_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_suspended: boolean
          monthly_income: number | null
          name: string
          onboarding_completed: boolean | null
          primary_currency: string | null
          suspended_at: string | null
          suspended_by: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_suspended?: boolean
          monthly_income?: number | null
          name: string
          onboarding_completed?: boolean | null
          primary_currency?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_suspended?: boolean
          monthly_income?: number | null
          name?: string
          onboarding_completed?: boolean | null
          primary_currency?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          account_id: string
          amount: number
          category_id: string | null
          cost_center_id: string | null
          created_at: string
          description: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          last_executed_at: string | null
          next_execution_date: string
          start_date: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_date: string
          start_date?: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category_id?: string | null
          cost_center_id?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          next_execution_date?: string
          start_date?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_cost_center_id_fkey"
            columns: ["cost_center_id"]
            isOneToOne: false
            referencedRelation: "cost_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      remittances: {
        Row: {
          amount_received: number
          amount_sent: number
          created_at: string
          currency_from: string
          currency_to: string
          exchange_rate: number
          fee: number
          id: string
          notes: string | null
          recipient_name: string
          recipient_phone: string | null
          sender_country: string
          sender_name: string
          service_provider: string
          status: string
          transfer_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_received: number
          amount_sent: number
          created_at?: string
          currency_from: string
          currency_to?: string
          exchange_rate: number
          fee?: number
          id?: string
          notes?: string | null
          recipient_name: string
          recipient_phone?: string | null
          sender_country: string
          sender_name: string
          service_provider: string
          status?: string
          transfer_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_received?: number
          amount_sent?: number
          created_at?: string
          currency_from?: string
          currency_to?: string
          exchange_rate?: number
          fee?: number
          id?: string
          notes?: string | null
          recipient_name?: string
          recipient_phone?: string | null
          sender_country?: string
          sender_name?: string
          service_provider?: string
          status?: string
          transfer_date?: string
          updated_at?: string
          user_id?: string
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
      school_fee_templates: {
        Row: {
          amount: number
          created_at: string
          currency: string
          education_level: string
          fee_type: string
          id: string
          is_recurring: boolean
          name: string
          notes: string | null
          school_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          education_level: string
          fee_type: string
          id?: string
          is_recurring?: boolean
          name: string
          notes?: string | null
          school_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          education_level?: string
          fee_type?: string
          id?: string
          is_recurring?: boolean
          name?: string
          notes?: string | null
          school_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      school_fees: {
        Row: {
          academic_year: string
          account_id: string | null
          amount: number
          created_at: string
          currency: string
          due_date: string
          education_level: string
          fee_type: string
          id: string
          notes: string | null
          paid: boolean
          paid_date: string | null
          payment_proof_url: string | null
          school_name: string
          student_name: string
          term: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_year: string
          account_id?: string | null
          amount: number
          created_at?: string
          currency?: string
          due_date: string
          education_level: string
          fee_type: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_date?: string | null
          payment_proof_url?: string | null
          school_name: string
          student_name: string
          term?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_year?: string
          account_id?: string | null
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string
          education_level?: string
          fee_type?: string
          id?: string
          notes?: string | null
          paid?: boolean
          paid_date?: string | null
          payment_proof_url?: string | null
          school_name?: string
          student_name?: string
          term?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_fees_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      split_expense_participants: {
        Row: {
          amount_owed: number
          amount_paid: number
          created_at: string
          email: string | null
          expense_id: string
          id: string
          is_creator: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          amount_owed: number
          amount_paid?: number
          created_at?: string
          email?: string | null
          expense_id: string
          id?: string
          is_creator?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          amount_owed?: number
          amount_paid?: number
          created_at?: string
          email?: string | null
          expense_id?: string
          id?: string
          is_creator?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_expense_participants_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "split_expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      split_expense_payment_history: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          participant_id: string
          payment_date: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          participant_id: string
          payment_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          participant_id?: string
          payment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "split_expense_payment_history_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "split_expense_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      split_expenses: {
        Row: {
          category: string | null
          created_at: string
          creator_id: string
          currency: string
          description: string
          expense_date: string
          id: string
          is_settled: boolean
          receipt_url: string | null
          share_token: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          creator_id: string
          currency?: string
          description: string
          expense_date?: string
          id?: string
          is_settled?: boolean
          receipt_url?: string | null
          share_token?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          creator_id?: string
          currency?: string
          description?: string
          expense_date?: string
          id?: string
          is_settled?: boolean
          receipt_url?: string | null
          share_token?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_id: string | null
          alert_days_before: number
          amount: number
          billing_cycle: string
          category_id: string | null
          color: string | null
          created_at: string
          currency: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          last_alert_sent_at: string | null
          name: string
          next_renewal_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          alert_days_before?: number
          amount: number
          billing_cycle: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          last_alert_sent_at?: string | null
          name: string
          next_renewal_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          alert_days_before?: number
          amount?: number
          billing_cycle?: string
          category_id?: string | null
          color?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          last_alert_sent_at?: string | null
          name?: string
          next_renewal_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
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
      transaction_tags: {
        Row: {
          created_at: string | null
          id: string
          tag_id: string
          transaction_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tag_id: string
          transaction_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tag_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
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
      financial_product_type:
        | "term_deposit"
        | "insurance"
        | "microcredit"
        | "fund"
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
      product_request_status: "pending" | "approved" | "rejected" | "cancelled"
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
      financial_product_type: [
        "term_deposit",
        "insurance",
        "microcredit",
        "fund",
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
      product_request_status: ["pending", "approved", "rejected", "cancelled"],
      reconciliation_status: ["matched", "mismatched", "pending"],
      transaction_type: ["income", "expense", "transfer"],
    },
  },
} as const
