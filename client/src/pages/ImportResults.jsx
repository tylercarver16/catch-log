import { useLocation, useNavigate, Link } from 'react-router-dom';
import { fmtDt } from '../utils.js';

export default function ImportResults() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    navigate('/import');
    return null;
  }

  const { saved, total, results } = state;
  const failed = results.filter(r => !r.success);
  const succeeded = results.filter(r => r.success);

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h4 className="fw-bold mb-1">{saved} catch{saved !== 1 ? 'es' : ''} saved from {total} photo{total !== 1 ? 's' : ''}</h4>

      {failed.length > 0 && (
        <div className="mt-3">
          <h6 className="text-danger">Failed</h6>
          {failed.map((r, i) => (
            <div key={i} className="d-flex align-items-start gap-2 mb-1">
              <span className="badge bg-danger">fail</span>
              <div>
                <span className="fw-semibold">{r.name}</span>
                <span className="text-muted ms-2 small">{r.error}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {succeeded.length > 0 && (
        <div className="mt-3">
          <h6 className="text-success">Imported</h6>
          {succeeded.map((r, i) => (
            <div key={i} className="d-flex align-items-start gap-2 mb-2">
              <span className="badge bg-success">ok</span>
              <div className="flex-grow-1">
                <span className="fw-semibold">{r.name}</span>
                {r.extra_names?.length > 0 && (
                  <span className="badge bg-secondary ms-2">+{r.extra_names.length} grouped</span>
                )}
                {r.catch && (
                  <div className="text-muted small">
                    {fmtDt(r.catch.photo_taken_at)}
                    {r.catch.location_name && ` · ${r.catch.location_name}`}
                    {r.catch.temp != null && ` · ${Math.round(r.catch.temp)}°F`}
                  </div>
                )}
              </div>
              {r.catch && (
                <Link to={`/catch/${r.catch.id}`} className="btn btn-sm btn-outline-secondary">View</Link>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="d-flex gap-2 mt-4">
        <Link to="/" className="btn btn-teal">Go to Log</Link>
        <Link to="/import" className="btn btn-outline-secondary">Import More</Link>
      </div>
    </div>
  );
}
