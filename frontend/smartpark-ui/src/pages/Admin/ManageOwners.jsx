import { useEffect, useState } from 'react'
import userService from '../../services/userService'

export default function ManageOwners() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getByRole(1)
      .then(setOwners)
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    const { isActive } = await userService.toggleActive(id)
    setOwners(o => o.map(x => x.id === id ? { ...x, isActive } : x))
  }

  if (loading) return <div style={page}><p>Loading...</p></div>

  return (
    <div style={page}>
      <h2 style={heading}>Manage Parking Owners</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>{owners.length} owner(s) registered</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={table}>
          <thead>
            <tr style={theadRow}>
              {['ID', 'Name', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                <th key={h} style={th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {owners.map(o => (
              <tr key={o.id} style={tr}>
                <td style={td}>{o.userID}</td>
                <td style={td}>{o.firstName} {o.lastName}</td>
                <td style={td}>{o.email}</td>
                <td style={td}>{o.phoneNumber}</td>
                <td style={td}>{new Date(o.createdDate).toLocaleDateString()}</td>
                <td style={td}>
                  <span style={{ ...badge, background: o.isActive ? '#e6f4ea' : '#fce8e6', color: o.isActive ? '#137333' : '#c5221f' }}>
                    {o.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={td}>
                  <button style={{ ...btn, background: o.isActive ? '#d93025' : '#1a73e8' }} onClick={() => toggle(o.id)}>
                    {o.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {owners.length === 0 && <p style={{ textAlign: 'center', color: '#666', padding: '32px' }}>No parking owners found.</p>}
      </div>
    </div>
  )
}

const page    = { padding: '32px 24px', maxWidth: '1000px', margin: '0 auto' }
const heading = { color: '#1a73e8', marginBottom: '8px' }
const table   = { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
const theadRow = { background: '#f1f3f4' }
const th      = { padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', color: '#444', borderBottom: '1px solid #e8eaed' }
const tr      = { borderBottom: '1px solid #f1f3f4' }
const td      = { padding: '12px 16px', fontSize: '0.9rem', color: '#333' }
const badge   = { padding: '3px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }
const btn     = { padding: '5px 12px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' }
