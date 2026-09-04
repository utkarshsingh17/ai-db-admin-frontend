import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAdmin, RequireAuth } from './auth/RequireAuth'
import { AppShell } from './components/AppShell'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DatabasesPage } from './pages/DatabasesPage'
import { DatabaseDetailPage } from './pages/DatabaseDetailPage'
import { RecommendationsPage } from './pages/RecommendationsPage'
import { RecommendationDetailPage } from './pages/RecommendationDetailPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { SqlEditorPage } from './pages/SqlEditorPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to="/databases" replace />} />
                <Route path="/databases" element={<DatabasesPage />} />
                <Route path="/databases/:id" element={<DatabaseDetailPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/recommendations/:id" element={<RecommendationDetailPage />} />
                <Route path="/audit-log" element={<AuditLogPage />} />
                <Route path="/sql-editor" element={<SqlEditorPage />} />
                <Route
                  path="/users"
                  element={
                    <RequireAdmin>
                      <UsersPage />
                    </RequireAdmin>
                  }
                />
                <Route path="*" element={<Navigate to="/databases" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  )
}

export default App
