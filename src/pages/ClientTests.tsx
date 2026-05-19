import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PSYCHOLOGICAL_TESTS } from '../data/tests';
import { getSeverityColor } from '../utils/scoring';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function ClientTests() {
  const { activeClient, navigate } = useApp();

  useEffect(() => {
    if (!activeClient) navigate('client-login');
  }, [activeClient]);

  if (!activeClient) return null;

  const assignedTests = PSYCHOLOGICAL_TESTS.filter((t) => activeClient.assignedTests.includes(t.id));
  const completedMap = new Map(activeClient.completedTests.map((r) => [r.testId, r]));
  const completedCount = assignedTests.filter((t) => completedMap.has(t.id)).length;
  const totalCount = assignedTests.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: G }}
          >
            {activeClient.name[0]}
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: TEXT }}>Сайн байна уу, {activeClient.name}!</h1>
            <p className="text-sm" style={{ color: MUTED }}>Сэтгэлзүйчийн хуваарилсан тестүүдийг бөглөнө үү</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress */}
        {totalCount > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-stone-100 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: TEXT }}>Явц</span>
              <span className="text-sm font-bold" style={{ color: G }}>{completedCount}/{totalCount} тест</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%`, backgroundColor: G }}
              />
            </div>
            {allDone && (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold" style={{ color: G }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Бүх тест амжилттай бөглөгдлөө!
              </div>
            )}
          </div>
        )}

        {/* Test list */}
        {assignedTests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-200">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="font-medium" style={{ color: TEXT }}>Одоогоор тест хуваарилагдаагүй байна</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Сэтгэлзүйчтэйгээ холбогдоно уу</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignedTests.map((test, idx) => {
              const result = completedMap.get(test.id);
              const isLocked = idx > 0 && !completedMap.has(assignedTests[idx - 1].id);

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-2xl border shadow-sm p-5 transition-all"
                  style={{ borderColor: result ? '#D1E4D8' : isLocked ? '#e7e5e4' : '#e7e5e4', opacity: isLocked ? 0.55 : 1 }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={result
                        ? { backgroundColor: '#D1E4D8', color: G }
                        : isLocked
                        ? { backgroundColor: '#f5f5f4', color: '#a8a29e' }
                        : { backgroundColor: '#E8F0EB', color: G }
                      }
                    >
                      {result ? '✓' : isLocked ? '🔒' : (idx + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ backgroundColor: '#E8F0EB', color: G }}
                        >
                          {test.shortName}
                        </span>
                        <span className="text-xs" style={{ color: MUTED }}>~{test.timeMinutes} мин</span>
                      </div>
                      <p className="font-semibold text-sm" style={{ color: TEXT }}>{test.name}</p>
                      {result && result.totalScore > 0 && (
                        <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${getSeverityColor(result.severity)}`}>
                          {result.interpretation}
                        </span>
                      )}
                      {result && result.totalScore === 0 && (
                        <span className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Бөглөгдсэн
                        </span>
                      )}
                    </div>
                    {!result && !isLocked && (
                      <button
                        onClick={() => navigate('test-taking', { selectedClientId: activeClient.id, selectedTestId: test.id })}
                        className="text-white px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
                        style={{ backgroundColor: G }}
                      >
                        Эхлэх
                      </button>
                    )}
                    {result && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#D1E4D8' }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button onClick={() => navigate('client-login')} className="text-sm hover:underline" style={{ color: MUTED }}>
            Гарах
          </button>
        </div>
      </div>
    </div>
  );
}
