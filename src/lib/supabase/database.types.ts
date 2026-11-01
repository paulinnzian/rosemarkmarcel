
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "admin_users": {
                  Row: {
                    "created_at": string,"email": string,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"role"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"click_events": {
                  Row: {
                    "campaign": string | null,"country": string | null,"device": string | null,"id": number,"kind": string,"occurred_at": string,"path": string,"source": string | null,"target": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "campaign"?: string | null,"country"?: string | null,"device"?: string | null,"id"?: never,"kind": string,"occurred_at"?: string,"path"?: string,"source"?: string | null,"target"?: string | null
                  }
                  Update: {
                    "campaign"?: string | null,"country"?: string | null,"device"?: string | null,"id"?: never,"kind"?: string,"occurred_at"?: string,"path"?: string,"source"?: string | null,"target"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"contact_channels": {
                  Row: {
                    "created_at": string,"display": string,"id": string,"label": string,"note": string | null,"position": number,"prefilled_message": string | null,"type": string,"updated_at": string,"updated_by": string | null,"value": string,"visible": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"display": string,"id"?: string,"label": string,"note"?: string | null,"position"?: number,"prefilled_message"?: string | null,"type": string,"updated_at"?: string,"updated_by"?: string | null,"value": string,"visible"?: boolean
                  }
                  Update: {
                    "created_at"?: string,"display"?: string,"id"?: string,"label"?: string,"note"?: string | null,"position"?: number,"prefilled_message"?: string | null,"type"?: string,"updated_at"?: string,"updated_by"?: string | null,"value"?: string,"visible"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"donation_settings": {
                  Row: {
                    "button_label": string,"disabled_modal": NonNullable<Json>,"enabled": boolean,"floating_label": string,"id": number,"payment_url": string | null,"texts": NonNullable<Json>,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "button_label": string,"disabled_modal"?: NonNullable<Json>,"enabled"?: boolean,"floating_label": string,"id"?: number,"payment_url"?: string | null,"texts"?: NonNullable<Json>,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "button_label"?: string,"disabled_modal"?: NonNullable<Json>,"enabled"?: boolean,"floating_label"?: string,"id"?: number,"payment_url"?: string | null,"texts"?: NonNullable<Json>,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"link_checks": {
                  Row: {
                    "checked_at": string,"http_status": number | null,"label": string,"status": string,"url": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checked_at"?: string,"http_status"?: number | null,"label": string,"status": string,"url": string
                  }
                  Update: {
                    "checked_at"?: string,"http_status"?: number | null,"label"?: string,"status"?: string,"url"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_content": {
                  Row: {
                    "concept_name": string,"creator_name": string,"id": number,"photo_alt": string,"photo_height": number | null,"photo_path": string | null,"photo_width": number | null,"role_line": string,"sections": NonNullable<Json>,"tagline": string,"updated_at": string,"updated_by": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "concept_name": string,"creator_name": string,"id"?: number,"photo_alt": string,"photo_height"?: number | null,"photo_path"?: string | null,"photo_width"?: number | null,"role_line": string,"sections"?: NonNullable<Json>,"tagline": string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "concept_name"?: string,"creator_name"?: string,"id"?: number,"photo_alt"?: string,"photo_height"?: number | null,"photo_path"?: string | null,"photo_width"?: number | null,"role_line"?: string,"sections"?: NonNullable<Json>,"tagline"?: string,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"social_links": {
                  Row: {
                    "action_label": string,"created_at": string,"fallback_label": string | null,"fallback_sublabel": string | null,"followers": number | null,"followers_updated_at": string | null,"handle": string,"id": string,"network": string,"position": number,"sync_mode": string,"updated_at": string,"updated_by": string | null,"url": string,"visible": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "action_label": string,"created_at"?: string,"fallback_label"?: string | null,"fallback_sublabel"?: string | null,"followers"?: number | null,"followers_updated_at"?: string | null,"handle": string,"id"?: string,"network": string,"position"?: number,"sync_mode"?: string,"updated_at"?: string,"updated_by"?: string | null,"url": string,"visible"?: boolean
                  }
                  Update: {
                    "action_label"?: string,"created_at"?: string,"fallback_label"?: string | null,"fallback_sublabel"?: string | null,"followers"?: number | null,"followers_updated_at"?: string | null,"handle"?: string,"id"?: string,"network"?: string,"position"?: number,"sync_mode"?: string,"updated_at"?: string,"updated_by"?: string | null,"url"?: string,"visible"?: boolean
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "click_daily": {
                  Row: {
                    "day": string | null,"kind": string,"target": string | null,"total": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"click_daily_detail": {
                  Row: {
                    "country": string | null,"day": string | null,"device": string | null,"kind": string,"target": string | null,"total": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"visit_sources": {
                  Row: {
                    "campaign": string | null,"day": string | null,"source": string | null,"total": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_owner":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
