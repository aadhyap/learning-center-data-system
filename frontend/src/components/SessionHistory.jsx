
import StudentTags from "./StudentTags";

function SessionHistory({ sessions = [] }) {
  return (
    <div className="session-list">

      {sessions.map((session) => (
        <div className="session-card" key={session.session_id}>

          <div className="session-date">
            {new Date(session.session_date).toLocaleDateString()}
          </div>

          {/* TAGS */}
          {session.tags?.length > 0 && (
            <div className="session-detail session-tags">
              <span className="detail-label">Session Tags</span>
              <StudentTags tags={session.tags} />
            </div>
          )}

          <div className="session-detail session-notes">
            <span className="detail-label">Notes</span>
            <p>{session.notes || "—"}</p>
          </div>

          <div className="session-detail session-next">
            <span className="detail-label">Next Session</span>
            <p>{session.next_session || "—"}</p>
          </div>

          <div className="session-detail session-achievements">
            <span className="detail-label">Achievements</span>
            <p>{session.achievements || "—"}</p>
          </div>

        </div>
      ))}

    </div>
  );
}

export default SessionHistory;
