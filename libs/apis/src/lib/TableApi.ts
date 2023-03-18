import { SupabaseClient } from '@supabase/supabase-js'

/**
 * This is the minimum expected calls for each api
 *
 * This includes shorthand versions of common calls
 *
 * example usage: await api.match(query).maybeSingle()
 * This the same as saying:
 * await api.fromTable.selectAll.match(query).maybeSingle()
 */

export default class TableApi<TableType> {
  constructor(private tableName: string, protected supabase: SupabaseClient) {}

  getTableName = () => this.tableName

  get fromTable() {
    return this.supabase.from<TableType>(this.getTableName())
  }

  get selectAll() {
    return this.fromTable.select('*')
  }

  get delete() {
    return this.fromTable.delete()
  }

  select = (columns = '*') => {
    return this.fromTable.select(columns)
  }

  update = (data: Partial<TableType>) => {
    return this.fromTable.update(data)
  }

  upsert = (data: Partial<TableType>) => {
    return this.fromTable.upsert(data)
  }

  match = (query: Partial<TableType>) => {
    return this.selectAll.match(query)
  }
}
