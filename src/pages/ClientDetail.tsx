import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PSYCHOLOGICAL_TESTS } from '../data/tests';
import { getSeverityColor, formatDate } from '../utils/scoring';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function ClientDetail() {
  const { activeClient, navigate, regenerateCode, refreshClients } = useApp();

  useEffect(() => {
    if (!activeClient) navigate('psych-dashboard');
    else refreshClients();
  }, []);

  if (!activeClient) return null;

  const assignedTests = PSYCHOLOGICAL_TESTS.filter((t) => activeClient.assignedTests.includes(t.id));
  const completedMap = new Map(activeClient.completedTests.map((r) => [r.testId, r]));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('psych-dashboard')}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: MUTED }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>
          <button
            onClick={() => navigate('psych-assign-tests', { selectedClientId: activeClient.id })}
            className="text-white px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: G }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Тест хуваарилах
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Client info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl"
                style={{ backgroundColor: G }}
              >
                {activeClient.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: TEXT }}>{activeClient.name}</h1>
                <p style={{ color: MUTED }}>
                  {activeClient.age} нас ·{' '}
                  {activeClient.gender === 'male' ? 'Эрэгтэй' : activeClient.gender === 'female' ? 'Эмэгтэй' : 'Бусад'}
                </p>
                {activeClient.email && <p className="text-sm" style={{ color: MUTED }}>{activeClient.email}</p>}
                {activeClient.phone && <p className="text-sm" style={{ color: MUTED }}>{activeClient.phone}</p>}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs mb-1" style={{ color: MUTED }}>Нэвтрэх код</p>
              <span
                className="font-mono text-2xl font-bold px-4 py-2 rounded-xl tracking-widest inline-block"
                style={{ color: G, backgroundColor: '#E8F0EB' }}
              >
                {activeClient.accessCode}
              </span>
              <br />
              <button
                onClick={() => regenerateCode(activeClient.id)}
                className="text-xs mt-2 hover:underline transition-colors"
                style={{ color: MUTED }}
              >
                Код шинэчлэх
              </button>
            </div>
          </div>
          {activeClient.notes && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-xs mb-1" style={{ color: MUTED }}>Тэмдэглэл</p>
              <p className="text-sm" style={{ color: TEXT }}>{activeClient.notes}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-stone-100 text-xs" style={{ color: MUTED }}>
            Бүртгэсэн: {formatDate(activeClient.createdAt)}
          </div>
        </div>

        {/* Assigned tests */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: TEXT }}>
            Хуваарилсан тестүүд ({assignedTests.length})
          </h2>
          {assignedTests.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-stone-200 p-8 text-center">
              <svg className="w-10 h-10 text-stone-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm" style={{ color: MUTED }}>Тест хуваарилагдаагүй байна.</p>
              <button
                onClick={() => navigate('psych-assign-tests', { selectedClientId: activeClient.id })}
                className="mt-3 text-sm font-medium hover:underline"
                style={{ color: G }}
              >
                Тест хуваарилах
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedTests.map((test) => {
                const result = completedMap.get(test.id);
                return (
                  <div
                    key={test.id}
                    className="bg-white rounded-xl border border-stone-100 shadow-sm p-5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                        style={result
                          ? { backgroundColor: '#D1E4D8', color: G }
                          : { backgroundColor: '#f5f5f4', color: '#a8a29e' }
                        }
                      >
                        {result ? '✓' : '○'}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: TEXT }}>{test.name}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{test.shortName} · {test.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {result ? (
                        <>
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSeverityColor(result.severity)}`}>
                            {result.interpretation}
                          </span>
                          <button
                            onClick={() => navigate('psych-view-results', { selectedClientId: activeClient.id, selectedTestId: test.id })}
                            className="text-sm font-medium hover:underline"
                            style={{ color: G }}
                          >
                            Дүн харах
                          </button>
                        </>
                      ) : (
                        <span className="text-xs italic" style={{ color: MUTED }}>Хүлээгдэж буй</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
