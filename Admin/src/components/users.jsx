import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInterviews, setUserInterviews] = useState(null);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:8000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminEmail');
    navigate('/');
  };

  const navigateToApiUsage = () => {
    navigate('/api-usage');
  };

  const fetchUserInterviews = async (clerkId) => {
    setInterviewLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:8000/api/users/${clerkId}/interviews`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInterviews(response.data);
    } catch (error) {
      console.error('Error fetching user interviews:', error);
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    fetchUserInterviews(user.clerkId);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserInterviews(null);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading users...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.logo}>WACE</h1>
          <span style={styles.headerTag}>Admin Panel</span>
        </div>
        <div style={styles.headerRight}>
          <button onClick={navigateToApiUsage} style={styles.apiUsageBtn}>
            API Usage
          </button>
          <span style={styles.adminEmail}>{localStorage.getItem('adminEmail')}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        <h2 style={styles.title}>Users</h2>
        
        
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>First Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Interviews Done</th>
                <th style={styles.th}>Joined</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={styles.tableRow}>
                  <td style={styles.td}>{user.firstName || 'N/A'}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={styles.planBadge(user.subscriptionPlan)}>
                      {user.subscriptionPlan}
                    </span>
                  </td>
                  <td style={styles.td}>{user.interviewsCompleted || 0}</td>
                  <td style={styles.td}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => handleViewUser(user)}
                      style={styles.viewBtn}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedUser && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>User Details</h2>
              <button onClick={closeModal} style={styles.closeBtn}>×</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.userInfo}>
                <h3 style={styles.sectionTitle}>Profile</h3>
                <div style={styles.infoGrid}>
                  <p><span style={styles.infoLabel}>Name:</span> {selectedUser.firstName} {selectedUser.lastName}</p>
                  <p><span style={styles.infoLabel}>Email:</span> {selectedUser.email}</p>
                  <p><span style={styles.infoLabel}>Plan:</span> <span style={styles.planBadge(selectedUser.subscriptionPlan)}>{selectedUser.subscriptionPlan}</span></p>
                  <p><span style={styles.infoLabel}>Interviews:</span> {selectedUser.interviewsCompleted || 0}</p>
                </div>
              </div>

              {userInterviews && (
                <div style={styles.paymentsSection}>
                  <h3 style={styles.sectionTitle}>Purchased Plans</h3>
                  {userInterviews.payments.length > 0 ? (
                    <div style={styles.paymentsList}>
                      {userInterviews.payments.map((payment, index) => (
                        <div key={index} style={styles.paymentCard}>
                          <div style={styles.paymentHeader}>
                            <span style={styles.planName}>{payment.plan}</span>
                            <span style={styles.paymentStatus}>{payment.status}</span>
                          </div>
                          <div style={styles.paymentDetails}>
                            <span>Allowed: <strong>{payment.interviewsAllowed}</strong></span>
                            <span>Used: <strong>{payment.interviewsUsed}</strong></span>
                            <span>Remaining: <strong>{payment.remaining}</strong></span>
                            <span>Purchased: <strong>{new Date(payment.purchasedAt).toLocaleDateString()}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.noData}>No purchased plans</p>
                  )}
                </div>
              )}

              {userInterviews && (
                <div style={styles.interviewsSection}>
                  <h3 style={styles.sectionTitle}>Interview History ({userInterviews.interviews.length})</h3>
                  {interviewLoading ? (
                    <p style={styles.noData}>Loading interviews...</p>
                  ) : userInterviews.interviews.length > 0 ? (
                    <div style={styles.interviewsList}>
                      {userInterviews.interviews.map((interview) => (
                        <div key={interview.id} style={styles.interviewCard}>
                          <div style={styles.interviewHeader}>
                            <span style={styles.jobRole}>{interview.jobRole}</span>
                            <span style={styles.interviewStatus(interview.status)}>
                              {interview.status}
                            </span>
                          </div>
                          <div style={styles.interviewDetails}>
                            <span><span style={styles.infoLabel}>Plan:</span> {interview.plan}</span>
                            <span><span style={styles.infoLabel}>Score:</span> {interview.totalScore || 'Pending'}</span>
                            <span><span style={styles.infoLabel}>Date:</span> {new Date(interview.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={styles.noData}>No interviews yet</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#000000'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #333',
    background: '#0a0a0a'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#EFBF04',
    letterSpacing: '3px'
  },
  headerTag: {
    fontSize: '12px',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: '2px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  adminEmail: {
    color: '#888888',
    fontSize: '14px'
  },
  logoutBtn: {
    padding: '10px 20px',
    background: 'transparent',
    color: '#EFBF04',
    border: '1px solid #EFBF04',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  apiUsageBtn: {
    padding: '10px 20px',
    background: '#EFBF04',
    color: '#000000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  content: {
    padding: '40px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#EFBF04',
    marginBottom: '24px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#000000'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #333',
    borderTop: '3px solid #EFBF04',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#888888',
    marginTop: '16px'
  },
  tableContainer: {
    background: '#1a1a1a',
    borderRadius: '12px',
    border: '1px solid #333',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#0a0a0a'
  },
  th: {
    padding: '18px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#EFBF04',
    borderBottom: '1px solid #333',
    fontSize: '14px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  tableRow: {
    borderBottom: '1px solid #333'
  },
  td: {
    padding: '18px',
    color: '#cccccc',
    fontSize: '15px'
  },
  planBadge: (plan) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    background: plan === 'premium' ? '#EFBF04' : plan === 'standard' ? '#333333' : '#222222',
    color: plan === 'premium' ? '#000000' : plan === 'standard' ? '#EFBF04' : '#cccccc'
  }),
  viewBtn: {
    padding: '8px 16px',
    background: '#EFBF04',
    color: '#000000',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: '#1a1a1a',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    border: '1px solid #333'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '1px solid #333'
  },
  modalTitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#EFBF04'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#666666',
    lineHeight: 1
  },
  modalBody: {
    padding: '24px'
  },
  userInfo: {
    marginBottom: '24px'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  infoLabel: {
    color: '#888888',
    marginRight: '8px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#EFBF04',
    marginBottom: '16px'
  },
  paymentsSection: {
    marginBottom: '24px'
  },
  paymentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  paymentCard: {
    padding: '16px',
    background: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  paymentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  planName: {
    fontWeight: '700',
    color: '#EFBF04',
    textTransform: 'uppercase'
  },
  paymentStatus: {
    fontSize: '12px',
    color: '#16a34a',
    background: 'rgba(22, 163, 74, 0.1)',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  paymentDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    fontSize: '14px',
    color: '#888888'
  },
  interviewsSection: {
    marginBottom: '20px'
  },
  interviewsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  interviewCard: {
    padding: '16px',
    background: '#0a0a0a',
    borderRadius: '8px',
    border: '1px solid #333'
  },
  interviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  jobRole: {
    fontWeight: '600',
    color: '#ffffff'
  },
  interviewStatus: (status) => ({
    fontSize: '12px',
    padding: '4px 10px',
    borderRadius: '4px',
    textTransform: 'capitalize',
    background: status === 'completed' || status === 'evaluated' ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 191, 4, 0.1)',
    color: status === 'completed' || status === 'evaluated' ? '#16a34a' : '#EFBF04'
  }),
  interviewDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    fontSize: '14px',
    color: '#888888'
  },
  noData: {
    color: '#666666',
    fontStyle: 'italic'
  }
};

export default UsersPage;