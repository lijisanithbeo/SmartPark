import { useEffect, useState } from 'react'
import userService from '../../services/userService'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getByRole(2)
      .then(setUsers)
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (id) => {
    const { isActive } = await userService.toggleActive(id)
    setUsers(u => u.map(x => x.id === id ? { ...x, isActive } : x))
  }

  if (loading) return <div style={page}><p>Loading...</p></div>

  return (
    <div style={page}>
      <h2 style={heading}>Manage Customers</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>{users.length} customer(s) registered</p>
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
            {users.map(u => (
              <tr key={u.id} style={tr}>
                <td style={td}>{u.userID}</td>
                <td style={td}>{u.firstName} {u.lastName}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.phoneNumber}</td>
                <td style={td}>{new Date(u.createdDate).toLocaleDateString()}</td>
                <td style={td}>
                  <span style={{ ...badge, background: u.isActive ? '#e6f4ea' : '#fce8e6', color: u.isActive ? '#137333' : '#c5221f' }}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={td}>
                  <button style={{ ...btn, background: u.isActive ? '#d93025' : '#1a73e8' }} onClick={() => toggle(u.id)}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p style={{ textAlign: 'center', color: '#666', padding: '32px' }}>No customers found.</p>}
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
