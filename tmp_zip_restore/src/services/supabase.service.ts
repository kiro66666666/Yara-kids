
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public supabase: SupabaseClient;

  // Credenciais fornecidas
  private supabaseUrl = 'https://dkhkvdaydvjjkquvzhit.supabase.co';
  private supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraGt2ZGF5ZHZqamtxdXZ6aGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMjk4MTgsImV4cCI6MjA4NjcwNTgxOH0.-MsZ6nqqFZp2z2Joa__fIiLNWJV18DDxx-zmZvhwh2w';

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  // --- STORAGE (Imagens) ---

  async uploadImage(file: File, folder: string = 'products'): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { data, error } = await this.supabase.storage
        .from('images') // Nome do Bucket criado no painel
        .upload(fileName, file);

      if (error) {
        console.error('Erro no upload:', error);
        return null;
      }

      // Gerar URL pública
      const { data: publicUrlData } = this.supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.error('Erro exceção upload:', e);
      return null;
    }
  }

  // --- DATABASE (Dados) ---

  async getAll(table: string) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*');
    if (error) throw error;
    return data;
  }

  async getById(table: string, id: string) {
    const { data, error } = await this.supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async insert(table: string, payload: any) {
    // Remove campos undefined para evitar erro do Supabase
    const cleanPayload = JSON.parse(JSON.stringify(payload));
    
    const { data, error } = await this.supabase
      .from(table)
      .insert(cleanPayload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(table: string, id: string, payload: any) {
    const cleanPayload = JSON.parse(JSON.stringify(payload));

    const { data, error } = await this.supabase
      .from(table)
      .update(cleanPayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async delete(table: string, id: string) {
    const { error } = await this.supabase
      .from(table)
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}
