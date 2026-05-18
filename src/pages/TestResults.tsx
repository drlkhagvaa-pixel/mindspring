import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PSYCHOLOGICAL_TESTS } from '../data/tests';
import { getSeverityColor, getSeverityBorder, findRange, formatDate } from '../utils/scoring';

const G = '#4A7A56';
const BG = '#EDE9E1';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function TestResults() {
  const { activeClient, view, navigate } = useApp();

  const test = PSYCHOLOGICAL_TESTS.find((t) => t.id === view.selectedTestId);
  const result = activeClient?.completedTests.find((r) => r.testId === view.selectedTestId);

  useEffect(() => {
    if (!activeClient) navigate('psych-dashboard');
    else if (!test || !result) navigate('psych-client-detail', { selectedClientId: activeClient.id });
  }, [activeClient, test, result]);

  if (!activeClient || !test || !result) return null;

  const isTextTest = test.testType === 'text';
  const mainRange = findRange(test.ranges, result.totalScore);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      {/* Header */}
      <div className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('psych-client-detail', { selectedClientId: activeClient.id })}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: MUTED }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Буцах
          </button>
          <div className="text-center">
            <h1 className="font-bold" style={{ color: TEXT }}>{test.shortName} — Дүн</h1>
            <p className="text-xs" style={{ color: MUTED }}>{activeClient.name}</p>
          </div>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {isTextTest ? (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{test.name}</h2>
                <p className="text-sm" style={{ color: MUTED }}>{formatDate(result.completedAt)}</p>
              </div>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-purple-100 text-purple-700">
                Чанарын үнэлгээ
              </span>
            </div>
            <div className="space-y-4">
              {test.questions.map((question, idx) => {
                const answer = result.answers.find((a) => a.questionId === question.id);
                const text = answer?.textValue ?? '';
                return (
                  <div key={question.id} className="border-b border-stone-50 pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold mb-1" style={{ color: MUTED }}>{idx + 1}. {question.text}</p>
                    <p
                      className="text-sm pl-2 border-l-2"
                      style={{ color: text ? TEXT : '#d6d3d1', borderColor: text ? G : '#e7e5e4', fontStyle: text ? 'normal' : 'italic' }}
                    >
                      {text || 'Хариулт байхгүй'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Main score card */}
            <div className={`bg-white rounded-2xl shadow-sm border-2 ${getSeverityBorder(result.severity)} p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: TEXT }}>{test.name}</h2>
                  <p className="text-sm" style={{ color: MUTED }}>{formatDate(result.completedAt)}</p>
                </div>
                <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${getSeverityColor(result.severity)}`}>
                  {result.interpretation}
                </span>
              </div>

              {/* Score bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1" style={{ color: MUTED }}>
                  <span>Нийт оноо</span>
                  <span className="font-bold text-base" style={{ color: TEXT }}>{result.totalScore}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-4 relative overflow-hidden">
                  {test.ranges.map((range) => {
                    const max = test.ranges[test.ranges.length - 1].max;
                    const width = ((range.max - range.min + 1) / (max + 1)) * 100;
                    const left = (range.min / (max + 1)) * 100;
                    const colors: Record<string, string> = {
                      minimal: '#10B981', mild: '#F59E0B', moderate: '#F97316', severe: '#EF4444', extreme: '#991B1B',
                    };
                    return (
                      <div key={range.min} className="absolute top-0 h-full opacity-30"
                        style={{ left: `${left}%`, width: `${width}%`, backgroundColor: colors[range.severity] ?? '#9CA3AF' }} />
                    );
                  })}
                  <div
                    className="absolute top-0 left-0 h-full transition-all opacity-70"
                    style={{
                      width: `${Math.min(100, (result.totalScore / (test.ranges[test.ranges.length - 1].max || 100)) * 100)}%`,
                      backgroundColor:
                        result.severity === 'minimal' ? '#10B981' :
                        result.severity === 'mild' ? '#F59E0B' :
                        result.severity === 'moderate' ? '#F97316' :
                        result.severity === 'severe' ? '#EF4444' : '#991B1B',
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: MUTED }}>
                  <span>0</span>
                  <span>{test.ranges[test.ranges.length - 1].max}</span>
                </div>
              </div>

              {/* Ranges legend */}
              <div className="flex flex-wrap gap-2 mb-4">
                {test.ranges.map((range) => (
                  <span key={range.min}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      range.severity === result.severity
                        ? getSeverityColor(result.severity) + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {range.min}-{range.max}: {range.label}
                  </span>
                ))}
              </div>

              {mainRange && (
                <div className="space-y-3">
                  <div className="rounded-xl p-4" style={{ backgroundColor: '#F5F3EF' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: MUTED }}>Тайлбар</p>
                    <p className="text-sm" style={{ color: TEXT }}>{mainRange.description}</p>
                  </div>
                  {mainRange.recommendation && (
                    <div className="rounded-xl p-4" style={{ backgroundColor: '#E8F0EB' }}>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: G }}>Зөвлөмж</p>
                      <p className="text-sm" style={{ color: '#1C3D28' }}>{mainRange.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Subscale scores */}
            {test.subscales && test.subscales.length > 0 && Object.keys(result.subscaleScores).length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                <h3 className="font-bold mb-4" style={{ color: TEXT }}>Дэд хэмжилтийн дүн</h3>
                <div className="space-y-4">
                  {test.subscales.map((subscale) => {
                    const subScore = result.subscaleScores[subscale.id];
                    if (subScore === undefined) return null;
                    const subRange = findRange(subscale.ranges ?? [], subScore);
                    const maxScore = subscale.ranges?.length ? subscale.ranges[subscale.ranges.length - 1].max : 20;
                    return (
                      <div key={subscale.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: TEXT }}>{subscale.name}</span>
                          <div className="flex items-center gap-2">
                            {subRange && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityColor(subRange.severity)}`}>
                                {subRange.label}
                              </span>
                            )}
                            <span className="text-sm font-bold" style={{ color: TEXT }}>{subScore}</span>
                          </div>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(100, (subScore / (maxScore || 30)) * 100)}%`,
                              backgroundColor:
                                subRange?.severity === 'minimal' ? '#10B981' :
                                subRange?.severity === 'mild' ? '#F59E0B' :
                                subRange?.severity === 'moderate' ? '#F97316' :
                                subRange?.severity === 'severe' ? '#EF4444' : '#991B1B',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Answer summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
              <h3 className="font-bold mb-4" style={{ color: TEXT }}>Хариултуудын хураангуй</h3>
              {result.answers.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: MUTED }}>
                  Хариултын мэдээлэл байхгүй байна. Тестийг дахин бөглүүлнэ үү.
                </p>
              ) : test.testType === 'image-choice' ? (
                <div className="grid grid-cols-1 gap-3">
                  {test.questions.map((question, idx) => {
                    const answer = result.answers.find((a) => a.questionId === question.id);
                    const answerOption = test.answerOptions.find((o) => o.value === answer?.value);
                    return (
                      <div key={question.id} className="flex gap-3 items-start p-3 rounded-xl border border-stone-100 bg-stone-50">
                        <span className="text-xs font-bold w-5 flex-shrink-0 pt-1" style={{ color: MUTED }}>{idx + 1}</span>
                        {question.imageUrl && (
                          <img
                            src={question.imageUrl}
                            alt={`Зураг ${idx + 1}`}
                            className="w-16 h-14 object-contain rounded-lg flex-shrink-0 bg-white border border-stone-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className="block text-xs font-semibold px-2.5 py-1.5 rounded-lg text-center"
                            style={answer === undefined
                              ? { backgroundColor: '#f5f5f4', color: '#a8a29e' }
                              : { backgroundColor: '#E8F0EB', color: G }
                            }
                          >
                            {answerOption ? answerOption.label : '—'}
                          </span>
                          {answer?.textValue && (
                            <p className="text-xs mt-1.5 px-1 italic" style={{ color: MUTED }}>
                              "{answer.textValue}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {test.questions.map((question, idx) => {
                    const answer = result.answers.find((a) => a.questionId === question.id);
                    const answerOption = test.answerOptions.find((o) => o.value === answer?.value);
                    const subscale = test.subscales?.find((s) => s.questionIds.includes(question.id));
                    return (
                      <div key={question.id} className="flex gap-3 items-start py-2 border-b border-stone-50 last:border-0">
                        <span className="text-xs font-bold w-6 flex-shrink-0 pt-0.5" style={{ color: MUTED }}>{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: TEXT }}>{question.text}</p>
                          {subscale && <span className="text-xs" style={{ color: MUTED }}>{subscale.name}</span>}
                        </div>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg flex-shrink-0"
                          style={answer === undefined
                            ? { backgroundColor: '#f5f5f4', color: '#a8a29e' }
                            : { backgroundColor: '#E8F0EB', color: G }
                          }
                        >
                          {answerOption ? answerOption.label : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {test.disclaimer && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <p className="text-sm text-red-800 font-medium">⚠️ {test.disclaimer}</p>
          </div>
        )}

        <div className="rounded-xl p-4" style={{ backgroundColor: '#FEF9EC', border: '1px solid #FDE68A' }}>
          <p className="text-xs text-amber-800">
            <strong>Анхаар:</strong> Энэхүү тестийн дүн нь мэргэжлийн оношилгоог орлохгүй. Зөвхөн мэргэжлийн сэтгэлзүйч, эмч л эцсийн дүгнэлт гаргана.
          </p>
        </div>
      </div>
    </div>
  );
}
