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
      cosecheros: {
        Row: {
          id: string
          nombre: string
          documento: string
          telefono: string
          estado: 'activo' | 'inactivo'
          password_hash: string | null
          primer_ingreso: boolean
          acepta_tratamiento_datos: boolean
          fecha_aceptacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          documento: string
          telefono: string
          estado?: 'activo' | 'inactivo'
          acepta_tratamiento_datos?: boolean
          fecha_aceptacion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          documento?: string
          telefono?: string
          estado?: 'activo' | 'inactivo'
          acepta_tratamiento_datos?: boolean
          fecha_aceptacion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      lotes: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          hectareas: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          hectareas: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          hectareas?: number
          created_at?: string
          updated_at?: string
        }
      }
      pesajes: {
        Row: {
          id: string
          cosechero_id: string
          lote_id: string | null
          kilos_bruto: number
          descuento: number
          kilos_neto: number
          precio_kilo: number
          total_pagar: number
          fecha_pesaje: string
          created_at: string
        }
        Insert: {
          id?: string
          cosechero_id: string
          lote_id?: string | null
          kilos_bruto: number
          descuento: number
          kilos_neto: number
          precio_kilo: number
          total_pagar: number
          fecha_pesaje?: string
          created_at?: string
        }
        Update: {
          id?: string
          cosechero_id?: string
          lote_id?: string | null
          kilos_bruto?: number
          descuento?: number
          kilos_neto?: number
          precio_kilo?: number
          total_pagar?: number
          fecha_pesaje?: string
          created_at?: string
        }
      }
      adelantos: {
        Row: {
          id: string
          cosechero_id: string
          monto: number
          fecha_adelanto: string
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cosechero_id: string
          monto: number
          fecha_adelanto?: string
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cosechero_id?: string
          monto?: number
          fecha_adelanto?: string
          nota?: string | null
          created_at?: string
        }
      }
      pagos: {
        Row: {
          id: string
          cosechero_id: string
          monto: number
          fecha_pago: string
          nota: string | null
          created_at: string
        }
        Insert: {
          id?: string
          cosechero_id: string
          monto: number
          fecha_pago?: string
          nota?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          cosechero_id?: string
          monto?: number
          fecha_pago?: string
          nota?: string | null
          created_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          email: string
          nombre: string
          rol: 'admin' | 'supervisor' | 'usuario' | 'ayudante'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre: string
          rol?: 'admin' | 'supervisor' | 'usuario' | 'ayudante'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          rol?: 'admin' | 'supervisor' | 'usuario' | 'ayudante'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
