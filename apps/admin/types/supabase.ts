export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      Bundles: {
        Row: {
          aesthetics: string
          bundle_description: string
          bundle_size: string
          created_at: string
          fashion_dislikes: string | null
          id: string
          images: string[] | null
          length: string
          link_input: string
          other_aesthetics: string | null
          status: Database["public"]["Enums"]["Status"]
          top_size: string
          updated_at: string
          user_id: string | null
          waist: string
        }
        Insert: {
          aesthetics: string
          bundle_description: string
          bundle_size: string
          created_at?: string
          fashion_dislikes?: string | null
          id: string
          images?: string[] | null
          length: string
          link_input: string
          other_aesthetics?: string | null
          status?: Database["public"]["Enums"]["Status"]
          top_size: string
          updated_at: string
          user_id?: string | null
          waist: string
        }
        Update: {
          aesthetics?: string
          bundle_description?: string
          bundle_size?: string
          created_at?: string
          fashion_dislikes?: string | null
          id?: string
          images?: string[] | null
          length?: string
          link_input?: string
          other_aesthetics?: string | null
          status?: Database["public"]["Enums"]["Status"]
          top_size?: string
          updated_at?: string
          user_id?: string | null
          waist?: string
        }
        Relationships: [
          {
            foreignKeyName: "Bundles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          }
        ]
      }
      Orders: {
        Row: {
          awb: string | null
          breadth: string | null
          courier: Database["public"]["Enums"]["COURIER"]
          created_at: string
          height: string | null
          id: string
          images: string[] | null
          instagram_post_urls: string[] | null
          length: string | null
          prebook: boolean
          price: number
          shipping_cost: number | null
          status: Database["public"]["Enums"]["Status"]
          updated_at: string
          user_id: string | null
          weight: string | null
        }
        Insert: {
          awb?: string | null
          breadth?: string | null
          courier?: Database["public"]["Enums"]["COURIER"]
          created_at?: string
          height?: string | null
          id: string
          images?: string[] | null
          instagram_post_urls?: string[] | null
          length?: string | null
          prebook?: boolean
          price?: number
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["Status"]
          updated_at: string
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          awb?: string | null
          breadth?: string | null
          courier?: Database["public"]["Enums"]["COURIER"]
          created_at?: string
          height?: string | null
          id?: string
          images?: string[] | null
          instagram_post_urls?: string[] | null
          length?: string | null
          prebook?: boolean
          price?: number
          shipping_cost?: number | null
          status?: Database["public"]["Enums"]["Status"]
          updated_at?: string
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users"
            referencedColumns: ["id"]
          }
        ]
      }
      Otp: {
        Row: {
          email: string
          expires: string
          id: string
          order_id: string
          otp: string
        }
        Insert: {
          email: string
          expires: string
          id: string
          order_id?: string
          otp: string
        }
        Update: {
          email?: string
          expires?: string
          id?: string
          order_id?: string
          otp?: string
        }
        Relationships: []
      }
      Pickups: {
        Row: {
          id: string
          order_id: string[] | null
          ordersId: string | null
          pickup_date: string
          pickup_id: number
          pickup_location: string
        }
        Insert: {
          id: string
          order_id?: string[] | null
          ordersId?: string | null
          pickup_date: string
          pickup_id: number
          pickup_location: string
        }
        Update: {
          id?: string
          order_id?: string[] | null
          ordersId?: string | null
          pickup_date?: string
          pickup_id?: number
          pickup_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "Pickups_ordersId_fkey"
            columns: ["ordersId"]
            isOneToOne: false
            referencedRelation: "Orders"
            referencedColumns: ["id"]
          }
        ]
      }
      Posts: {
        Row: {
          caption: string
          created_at: string
          id: string
          post_created_at: string
          post_link: string
          slides: string[] | null
          updated_at: string
        }
        Insert: {
          caption: string
          created_at?: string
          id: string
          post_created_at: string
          post_link: string
          slides?: string[] | null
          updated_at: string
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          post_created_at?: string
          post_link?: string
          slides?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      Users: {
        Row: {
          city: string
          country: string
          created_at: string
          email: string
          house_number: string
          id: string
          instagram_username: string
          landmark: string | null
          locality: string
          name: string
          phone_no: string
          pincode: string
          state: string
          updated_at: string
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          email: string
          house_number: string
          id: string
          instagram_username: string
          landmark?: string | null
          locality: string
          name: string
          phone_no: string
          pincode: string
          state: string
          updated_at: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          email?: string
          house_number?: string
          id?: string
          instagram_username?: string
          landmark?: string | null
          locality?: string
          name?: string
          phone_no?: string
          pincode?: string
          state?: string
          updated_at?: string
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
      COURIER:
        | "DEFAULT"
        | "INDIA_POST"
        | "ECOM_EXPRESS"
        | "XPRESSBEES"
        | "DELHIVERY"
        | "DTDC"
        | "OTHER"
      Size: "SMALL" | "MEDIUM" | "LARGE"
      Status:
        | "PENDING"
        | "ACCEPTED"
        | "SHIPPED"
        | "DELIVERED"
        | "CANCELLED"
        | "MANIFESTED"
        | "HOLD"
        | "RTO"
        | "OUT_FOR_DELIVERY"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
