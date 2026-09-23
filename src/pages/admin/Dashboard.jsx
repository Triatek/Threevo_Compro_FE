import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Card from '../../components/admin/Card'
import LeadsChart from '../../components/admin/LeadsChart'
import Seo from '../../components/ui/Seo'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/states'
import { useFetch } from '../../hooks/useFetch'
import { formatDateTime } from '../../lib/format'
import { adminPaths } from '../../routes/paths'

const LEAD_STATUS_LABEL = {
  NEW: 'Baru',
  CONTACTED: 'Dihubungi',
  CLOSED: 'Selesai',
}

/** Angka besar dengan rinciannya; bukan grafik, karena yang dibaca satu nilai. */
function StatTile({ label, value, breakdown }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-ink-900">{value}</p>

      {breakdown && (
        <dl className="mt-4 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
          {breakdown.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <dt className="text-ink-500">{row.label}</dt>
              <dd className="font-medium tabular-nums text-ink-800">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function LeadStatusBadge({ status }) {
  const isNew = status === 'NEW'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
        isNew ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-ink-200 text-ink-600'
      }`}
    >
      {isNew && <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-600" />}
      {LEAD_STATUS_LABEL[status] ?? status}
    </span>
  )
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch('/admin/dashboard')

  return (
    <>
      <Seo title="Dasbor Admin" noIndex />

      <AdminPageHeader
        title="Dasbor"
        description="Ringkasan konten dan prospek yang masuk ke Threevo."
      />

      {loading && <LoadingState />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <StatTile
              label="Total lead"
              value={data.leads.total}
              breakdown={[
                { label: LEAD_STATUS_LABEL.NEW, value: data.leads.NEW },
                { label: LEAD_STATUS_LABEL.CONTACTED, value: data.leads.CONTACTED },
                { label: LEAD_STATUS_LABEL.CLOSED, value: data.leads.CLOSED },
              ]}
            />

            <StatTile
              label="Total artikel"
              value={data.articles.total}
              breakdown={[
                { label: 'Terbit', value: data.articles.PUBLISHED },
                { label: 'Draf', value: data.articles.DRAFT },
              ]}
            />
          </div>

          <Card title="Lead masuk per hari">
            <LeadsChart data={data.leadsLast30Days} />
          </Card>

          <Card title="Lead terbaru">
            {data.recentLeads.length === 0 ? (
              <EmptyState
                title="Belum ada lead"
                description="Kiriman dari formulir kontak akan muncul di sini."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-ink-500">
                        <th scope="col" className="border-b border-ink-200 px-5 py-3 font-medium">
                          Nama
                        </th>
                        <th scope="col" className="border-b border-ink-200 px-5 py-3 font-medium">
                          Layanan
                        </th>
                        <th scope="col" className="border-b border-ink-200 px-5 py-3 font-medium">
                          Status
                        </th>
                        <th scope="col" className="border-b border-ink-200 px-5 py-3 font-medium">
                          Masuk
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.recentLeads.map((lead) => (
                        <tr key={lead.id} className="align-top">
                          <td className="border-b border-ink-100 px-5 py-3">
                            <span className="block font-medium text-ink-900">{lead.name}</span>
                            <span className="block text-xs text-ink-500">{lead.email}</span>
                            {lead.company && (
                              <span className="block text-xs text-ink-500">{lead.company}</span>
                            )}
                          </td>
                          <td className="border-b border-ink-100 px-5 py-3 text-ink-600">
                            {lead.serviceInterest || '—'}
                          </td>
                          <td className="border-b border-ink-100 px-5 py-3">
                            <LeadStatusBadge status={lead.status} />
                          </td>
                          <td className="border-b border-ink-100 px-5 py-3 text-ink-600">
                            {formatDateTime(lead.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-4">
                  <Link
                    to={adminPaths.leads}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
                  >
                    Lihat semua lead
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
