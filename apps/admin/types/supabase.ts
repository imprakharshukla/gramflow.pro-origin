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
          price: number
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
          price?: number
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
          price?: number
          status?: Database["public"]["Enums"]["Status"]
          updated_at?: string
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Orders_user_id_fkey"
            columns: ["user_id"]
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
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
