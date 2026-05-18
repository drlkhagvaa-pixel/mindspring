import { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { PSYCHOLOGICAL_TESTS } from '../data/tests';
import { calculateScore } from '../utils/scoring';

const G = '#4A7A56';
const TEXT = '#1C2B1A';
const MUTED = '#6B7B69';

export default function TestTaking() {
  const { activeClient, view, saveTestResult, navigate } = useApp();
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [textAnswers, setTextAnswers] = useState<{ [questionId: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const test = PSYCHOLOGICAL_TESTS.find((t) => t.id === view.selectedTestId);
  const isTextTest = test?.testType === 'text';
  const isImageTest = test?.testType === 'image-choice';

  useEffect(() => {
    if (!test || !activeClient) {
      navigate('client-tests', { selectedClientId: activeClient?.id });
    }
  }, [test, activeClient]);

  if (!test || !activeClient) return null;

  const QUESTIONS_PER_PAGE = 1;
  const pages = [];
  for (let i = 0; i < test.questions.length; i += QUESTIONS_PER_PAGE) {
    pages.push(test.questions.slice(i, i + QUESTIONS_PER_PAGE));
  }

  const currentQuestions = pages[currentPage] ?? [];
  const totalAnswered = isTextTest
    ? Object.values(textAnswers).filter((v) => v.trim().length > 0).length
    : Object.keys(answers).length;
  const totalQuestions = test.questions.length;
  const allAnswered = isTextTest
    ? currentQuestions.every((q) => (textAnswers[q.id] ?? '').trim().length > 0) && totalAnswered === totalQuestions
    : totalAnswered === totalQuestions;
  const currentPageAnswered = isTextTest
    ? currentQuestions.every((q) => (textAnswers[q.id] ?? '').trim().length > 0)
    : currentQuestions.every((q) => q.id in answers);
  const isLastPage = currentPage === pages.length - 1;

  function setAnswer(questionId: string, value: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit() {
    setSaveError(null);
    setSaving(true);

    let result;
    if (isTextTest) {
      const answerArray = test!.questions.map((q) => ({ questionId: q.id, textValue: textAnswers[q.id] ?? '' }));
      result = { testId: test!.id, answers: answerArray, subscaleScores: {}, totalScore: 0, interpretation: 'Чанарын үнэлгээ', severity: 'minimal' as const, completedAt: new Date().toISOString() };
    } else {
      const answerArray = Object.entries(answers).map(([questionId, value]) => ({
        questionId,
        value,
        ...(isImageTest && textAnswers[questionId] ? { textValue: textAnswers[questionId] } : {}),
      }));
      const scored = calculateScore(test!, answerArray);
      result = { testId: test!.id, ...scored, completedAt: new Date().toISOString() };
    }

    const err = await saveTestResult(activeClient!.id, result);
    setSaving(false);
    if (err) { setSaveError(err); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#EDE9E1' }}>
        <div className="bg-white rounded-2xl shadow-sm p-10 max-w-md w-full text-center border border-stone-100">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#D1E4D8' }}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: G }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: TEXT }}>Амжилттай!</h2>
          <p className="mb-1" style={{ color: MUTED }}>{test.name}</p>
          <p className="text-sm mb-8" style={{ color: MUTED }}>Таны хариултыг хадгаллаа. Сэтгэлзүйч дүнг нь харах болно.</p>
          <button
            onClick={() => navigate('client-tests', { selectedClientId: activeClient.id })}
            className="w-full text-white py-3 rounded-xl font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: G }}
          >
            Тестүүд рүү буцах
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Fixed progress header */}
      <div className="sticky top-0 bg-white border-b border-stone-100 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: '#E8F0EB', color: G }}
            >
              {test.shortName}
            </span>
            <span className="text-sm" style={{ color: MUTED }}>
              Асуулт {currentPage + 1}/{pages.length}
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all"
              style={{ width: `${((currentPage + 1) / pages.length) * 100}%`, backgroundColor: G }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Instructions (first page only) */}
        {currentPage === 0 && (
          <div className="rounded-xl p-4 mb-6 border" style={{ backgroundColor: '#E8F0EB', borderColor: '#D1E4D8' }}>
            <p className="text-sm font-medium" style={{ color: '#1C3D28' }}>{test.instructions}</p>
            {test.disclaimer && (
              <p className="text-xs text-red-700 mt-2 font-medium">⚠️ {test.disclaimer}</p>
            )}
          </div>
        )}

        {/* Questions */}
        <div className="space-y-5">
          {currentQuestions.map((question, qi) => {
            const globalIndex = currentPage * QUESTIONS_PER_PAGE + qi + 1;
            return (
              <div key={question.id} className="bg-white rounded-xl border border-stone-100 shadow-sm p-5">
                {question.imageUrl && (
                  <div className="rounded-xl overflow-hidden mb-4 flex items-center justify-center bg-stone-50" style={{ minHeight: 180 }}>
                    <img
                      src={question.imageUrl}
                      alt={`Зураг ${globalIndex}`}
                      className="max-h-72 max-w-full object-contain"
                    />
                  </div>
                )}
                <p className="font-medium mb-4" style={{ color: TEXT }}>
                  <span className="font-bold mr-2" style={{ color: G }}>{globalIndex}.</span>
                  {question.text}
                </p>
                {isTextTest ? (
                  <textarea
                    value={textAnswers[question.id] ?? ''}
                    onChange={(e) => setTextAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                    placeholder="Энд бичнэ үү..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl text-sm outline-none resize-none transition-colors"
                    style={{ color: TEXT }}
                    onFocus={(e) => (e.target.style.borderColor = G)}
                    onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {test.answerOptions.map((opt) => {
                      const isSelected = answers[question.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setAnswer(question.id, opt.value);
                            if (!isTextTest && !isImageTest && !isLastPage) {
                              setTimeout(() => setCurrentPage((p) => p + 1), 180);
                            }
                          }}
                          className="px-4 py-3 rounded-xl text-sm text-left transition-all border-2"
                          style={isSelected
                            ? { borderColor: G, backgroundColor: '#E8F0EB', color: '#1C3D28' }
                            : { borderColor: '#e7e5e4', color: TEXT }
                          }
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors flex items-center justify-center"
                              style={isSelected
                                ? { borderColor: G, backgroundColor: G }
                                : { borderColor: '#d6d3d1' }
                              }
                            >
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            {opt.label}
                          </div>
                        </button>
                      );
                    })}
                    {isImageTest && (
                      <div className="mt-2">
                        <p className="text-xs mb-1.5 font-medium" style={{ color: MUTED }}>Бусад / Нэмэлт тайлбар (заавал биш):</p>
                        <textarea
                          value={textAnswers[question.id] ?? ''}
                          onChange={(e) => setTextAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
                          placeholder="Өөр зүйл харсан бол бичнэ үү..."
                          rows={2}
                          className="w-full px-4 py-3 border-2 border-stone-100 rounded-xl text-sm outline-none resize-none transition-colors"
                          style={{ color: TEXT }}
                          onFocus={(e) => (e.target.style.borderColor = G)}
                          onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {currentPage > 0 && (
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex-1 py-3 border border-stone-200 rounded-xl font-medium transition-colors hover:bg-stone-50 text-sm"
              style={{ color: TEXT }}
            >
              ← Өмнөх
            </button>
          )}
          {!isLastPage ? (
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!currentPageAnswered}
              className="flex-1 text-white py-3 rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm"
              style={{ backgroundColor: G }}
            >
              Дараах →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered || saving}
              className="flex-1 text-white py-3 rounded-xl font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity text-sm"
              style={{ backgroundColor: G }}
            >
              {saving ? 'Хадгалж байна...' : 'Дуусгах ✓'}
            </button>
          )}
        </div>

        {saveError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center">
            Хадгалахад алдаа гарлаа: {saveError}
          </div>
        )}
      </div>
    </div>
  );
}
