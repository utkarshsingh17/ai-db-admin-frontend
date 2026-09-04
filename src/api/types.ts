// Mirrors ai.utkarsh.db_admin_assisstant.infrastructure.web.dto.* exactly.

export interface ApiError {
  code: string
  message: string
  details: string[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  error: ApiError | null
  timestamp: string
}

export interface AuthResponseDto {
  accessToken: string
  tokenType: string
}

export interface MonitoredDatabaseDto {
  id: string
  name: string
  engine: string
  jdbcUrl: string
  username: string
  enabled: boolean
  createdAt: string
}

export interface MetricSnapshotDto {
  activeConnections: number | null
  maxConnections: number | null
  cacheHitRatio: number | null
  lockWaitCount: number | null
  capturedAt: string
}

export interface SlowQueryEventDto {
  id: string
  normalizedQuery: string
  calls: number
  meanExecTimeMs: number
  totalExecTimeMs: number
  capturedAt: string
}

export type RecommendationType = 'INDEX' | 'CONFIG_CHANGE' | 'QUERY_REWRITE' | 'MANUAL_SQL' | 'AI_QUERY'

export type RecommendationStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'APPLYING'
  | 'APPLIED'
  | 'ALREADY_EXISTS'
  | 'FAILED'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface RecommendationDto {
  id: string
  databaseId: string
  type: RecommendationType
  status: RecommendationStatus
  riskLevel: RiskLevel
  title: string
  explanation: string
  proposedSql: string
  targetObject: string | null
  failureReason: string | null
  appliedAt: string | null
  createdAt: string
}

export interface AuditLogEntryDto {
  id: string
  actor: string
  action: string
  entityType: string
  entityId: string
  payload: string | null
  occurredAt: string
}

export type AdminRole = 'DB_ADMIN' | 'DB_VIEWER'

export interface AdminUserDto {
  id: string
  email: string
  role: AdminRole
  enabled: boolean
  createdAt: string
}

export interface QueryResultDto {
  columns: string[]
  rows: (string | null)[][]
  rowCount: number
  truncated: boolean
  executionTimeMs: number
}

export interface ColumnSchemaDto {
  name: string
  dataType: string
  nullable: boolean
  primaryKey: boolean
}

export interface TableSchemaDto {
  name: string
  columns: ColumnSchemaDto[]
}

export interface ForeignKeySchemaDto {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
}

export interface DatabaseSchemaDto {
  tables: TableSchemaDto[]
  foreignKeys: ForeignKeySchemaDto[]
}

export interface AiQuerySubmissionDto {
  sql: string | null
  explanation: string
  recommendationId: string | null
}

export interface RecommendationApplyResponseDto {
  recommendation: RecommendationDto
  queryResult: QueryResultDto | null
  optimizationRecommendationId: string | null
}

export interface SensitiveColumnDto {
  id: string
  tableName: string
  columnName: string
  createdAt: string
}
