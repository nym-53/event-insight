
import { useState } from 'react'
import './App.css'

type Page = 'dashboard' | 'events' | 'survey' | 'responses'


function App() {
  const [page, setPage] = useState<Page>('dashboard')

  type EventItem = {
    id: string
    name: string
    date: string
    description: string
  }

  const [events, setEvents] = useState<EventItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('eventInsightEvents') || '[]')
    } catch {
      return []
    }
  })

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventDescription, setEventDescription] = useState('')

  type QuestionType = 'single' | 'multiple' | 'rating' | 'text'

  type Question = {
    id: string
    eventId: string
    title: string
    type: QuestionType
    options: string[]
    required: boolean
  }

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('eventInsightQuestions') || '[]'
      )
    } catch {
      return []
    }
  })

  const [selectedEventId, setSelectedEventId] = useState('')
  const [questionTitle, setQuestionTitle] = useState('')
  const [questionType, setQuestionType] =
    useState<QuestionType>('single')
  const [questionOptions, setQuestionOptions] =
    useState('はい\nいいえ')
  const [questionRequired, setQuestionRequired] = useState(true)

  const addQuestion = () => {
    if (!selectedEventId || !questionTitle.trim()) {
      alert('イベントと質問文を入力してください')
      return
    }

    const options = questionOptions
      .split('\n')
      .map((option) => option.trim())
      .filter(Boolean)

    if (
      (questionType === 'single' || questionType === 'multiple') &&
      options.length < 2
    ) {
      alert('選択肢を2つ以上入力してください')
      return
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      eventId: selectedEventId,
      title: questionTitle.trim(),
      type: questionType,
      options:
        questionType === 'single' || questionType === 'multiple'
          ? options
          : questionType === 'rating'
            ? ['1', '2', '3', '4', '5']
            : [],
      required: questionRequired,
    }

    const updated = [...questions, newQuestion]
    setQuestions(updated)
    localStorage.setItem(
      'eventInsightQuestions',
      JSON.stringify(updated)
    )

    setQuestionTitle('')
    setQuestionOptions('はい\nいいえ')
  }

  const deleteQuestion = (id: string) => {
    if (!window.confirm('この質問を削除しますか？')) return

    const updated = questions.filter((q) => q.id !== id)
    setQuestions(updated)
    localStorage.setItem(
      'eventInsightQuestions',
      JSON.stringify(updated)
    )
  }
  
  type SurveyResponse = {
    id: string
    eventId: string
    answers: Record<string, string | string[]>
    createdAt: string
  }

  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('eventInsightResponses') || '[]'
      )
    } catch {
      return []
    }
  })

  const [responseEventId, setResponseEventId] = useState('')
  
  const [analysisEventId, setAnalysisEventId] = useState('')

  const [crossRowId, setCrossRowId] = useState('')
  const [crossColumnId, setCrossColumnId] = useState('')

  const analysisResponses = responses.filter(
    (response) => response.eventId === analysisEventId
  )

  const analysisQuestions = questions.filter(
    (question) => question.eventId === analysisEventId
  )

  const [answers, setAnswers] =
    useState<Record<string, string | string[]>>({})
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null)

  const responseQuestions = questions.filter(
    (q) => q.eventId === responseEventId
  )

  const saveResponse = () => {
    if (!responseEventId) {
      alert('イベントを選択してください')
      return
    }

    if (responseQuestions.length === 0) {
      alert('先にアンケートの質問を作成してください')
      return
    }

    const missing = responseQuestions.some((q) => {
      if (!q.required) return false
      const answer = answers[q.id]
      return !answer || (
        Array.isArray(answer) && answer.length === 0
      ) || (
        typeof answer === 'string' && !answer.trim()
      )
    })

    if (missing) {
      alert('必須の質問に回答してください')
      return
    }

    const updated: SurveyResponse[] = editingResponseId
      ? responses.map((response) =>
          response.id === editingResponseId
            ? { ...response, answers: { ...answers } }
            : response
        )
      : [
          ...responses,
          {
            id: crypto.randomUUID(),
            eventId: responseEventId,
            answers: { ...answers },
            createdAt: new Date().toISOString(),
          },
        ]

    setResponses(updated)
    localStorage.setItem('eventInsightResponses', JSON.stringify(updated))
    setAnswers({})
    setEditingResponseId(null)
    alert(editingResponseId ? '回答を更新しました！' : '回答を保存しました！')
  }


  const editResponse = (response: SurveyResponse) => {
    setResponseEventId(response.eventId)
    setAnswers({ ...response.answers })
    setEditingResponseId(response.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteResponse = (id: string) => {
    if (!window.confirm('この回答を削除しますか？この操作は取り消せません。')) return
    const updated = responses.filter((response) => response.id !== id)
    setResponses(updated)
    localStorage.setItem('eventInsightResponses', JSON.stringify(updated))
    if (editingResponseId === id) {
      setEditingResponseId(null)
      setAnswers({})
    }
  }

  const cancelEdit = () => {
    setEditingResponseId(null)
    setAnswers({})
  }


  const addEvent = () => {
    if (!eventName.trim() || !eventDate) {
      alert('イベント名と開催日を入力してください')
      return
    }

    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      name: eventName.trim(),
      date: eventDate,
      description: eventDescription.trim(),
    }

    const updated = [...events, newEvent]
    setEvents(updated)
    localStorage.setItem('eventInsightEvents', JSON.stringify(updated))

    setEventName('')
    setEventDate('')
    setEventDescription('')
  }

  const deleteEvent = (id: string) => {
    if (!window.confirm('このイベントを削除しますか？')) return

    const updated = events.filter((event) => event.id !== id)
    setEvents(updated)
    localStorage.setItem('eventInsightEvents', JSON.stringify(updated))
  }

  const exportCSV = () => {
    if (!responseEventId) {
      alert('イベントを選択してください')
      return
    }

    const event = events.find((e) => e.id === responseEventId)
    const eventResponses = responses.filter(
      (r) => r.eventId === responseEventId
    )
    const eventQuestions = questions.filter(
      (q) => q.eventId === responseEventId
    )

    if (eventResponses.length === 0) {
      alert('出力する回答がありません')
      return
    }

    const escapeCSV = (value: string) => {
      const safe = /^[=+\-@\t\r]/.test(value) ? "'" + value : value
      return '"' + safe.replace(/"/g, '""') + '"'
    }

    const headers = [
      '回答日時',
      ...eventQuestions.map((q) => q.title),
    ]

    const rows = eventResponses.map((response) => [
      response.createdAt,
      ...eventQuestions.map((q) => {
        const answer = response.answers[q.id]
        return Array.isArray(answer)
          ? answer.join('、')
          : answer || ''
      }),
    ])

    const csv = '\uFEFF' + [headers, ...rows]
      .map((row) => row.map((cell) => escapeCSV(String(cell))).join(','))
      .join('\r\n')

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${(event?.name || 'アンケート').replace(/[\\/:*?"<>|]/g, '_')}_回答データ.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const pages = [
    { id: 'dashboard', label: 'データ分析' },
    { id: 'events', label: 'イベント管理' },
    { id: 'survey', label: 'アンケート作成' },
{ id: 'responses', label: '回答入力' },

  ] as const

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Event Insight</h2>
        <p>イベント分析プラットフォーム</p>

        <nav>
          {pages.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header>
          <div>
            <span className="eyebrow">EVENT INSIGHT 3.0</span>
            <h1>
              {pages.find((item) => item.id === page)?.label}
            </h1>
          </div>
          <span className="status">開発中</span>
        </header>

        
{page === 'dashboard' && (
  <>
    <div className="stats">
      <div className="stat">
        <p>総回答数</p>
        <strong>{responses.length}</strong>
        <small>件</small>
      </div>
      <div className="stat">
        <p>登録イベント</p>
        <strong>{events.length}</strong>
        <small>件</small>
      </div>
      <div className="stat">
        <p>分析対象の回答数</p>
        <strong>{analysisResponses.length}</strong>
        <small>件</small>
      </div>
    </div>

    <section className="panel">
      <h2>アンケート分析</h2>

      <div className="event-form">
        <label>分析するイベント</label>
        <select
          value={analysisEventId}
          onChange={(e) => setAnalysisEventId(e.target.value)}
        >
          <option value="">イベントを選択</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {!analysisEventId && (
        <p>イベントを選択すると分析結果が表示されます。</p>
      )}

      {analysisEventId && analysisResponses.length === 0 && (
        <p>このイベントにはまだ回答がありません。</p>
      )}

      {analysisEventId && analysisQuestions.map((question) => {
        if (
          question.type !== 'single' &&
          question.type !== 'multiple' &&
          question.type !== 'rating'
        ) {
          return null
        }

        const counts = question.options.map((option) => {
          const count = analysisResponses.filter((response) => {
            const answer = response.answers[question.id]
            return Array.isArray(answer)
              ? answer.includes(option)
              : answer === option
          }).length

          return { option, count }
        })

        const total = analysisResponses.length

        return (
          <div className="analysis-card" key={question.id}>
            <h3>{question.title}</h3>

            {counts.map(({ option, count }) => {
              const percentage = total > 0
                ? Math.round((count / total) * 100)
                : 0

              return (
                <div className="chart-row" key={option}>
                  <div className="chart-label">
                    <span>{option}</span>
                    <strong>{count}件（{percentage}%）</strong>
                  </div>
                  <div className="chart-track">
                    <div
                      className="chart-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </section>
  </>
)}


        
{page === 'dashboard' && analysisEventId && (
  <section className="panel cross-panel">
    <h2>クロス集計</h2>
    <p>2つの質問を組み合わせて、回答傾向を比較できます。</p>
    <div className="cross-selectors">
      <div>
        <label>行に表示する質問</label>
        <select value={crossRowId} onChange={(e) => setCrossRowId(e.target.value)}>
          <option value="">質問を選択</option>
          {analysisQuestions.filter((q) => q.type === 'single' || q.type === 'rating').map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
      </div>
      <div>
        <label>列に表示する質問</label>
        <select value={crossColumnId} onChange={(e) => setCrossColumnId(e.target.value)}>
          <option value="">質問を選択</option>
          {analysisQuestions.filter((q) => q.type === 'single' || q.type === 'rating').map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
      </div>
    </div>
    {crossRowId && crossColumnId && crossRowId === crossColumnId && (
      <p>異なる2つの質問を選択してください。</p>
    )}
    {crossRowId && crossColumnId && crossRowId !== crossColumnId && (() => {
      const rowQuestion = analysisQuestions.find((q) => q.id === crossRowId)
      const columnQuestion = analysisQuestions.find((q) => q.id === crossColumnId)
      if (!rowQuestion || !columnQuestion) return null
      const validResponses = analysisResponses.filter((response) => {
        const row = response.answers[crossRowId]
        const column = response.answers[crossColumnId]
        return typeof row === 'string' && row !== '' && typeof column === 'string' && column !== ''
      })
      return (
        <div className="cross-table-wrapper">
          <p>集計対象：{validResponses.length}件（両方の質問に回答したデータ）</p>
          <table className="cross-table">
            <thead>
              <tr>
                <th>{rowQuestion.title}</th>
                {columnQuestion.options.map((option) => <th key={option}>{option}</th>)}
                <th>合計</th>
              </tr>
            </thead>
            <tbody>
              {rowQuestion.options.map((rowOption) => {
                const rowResponses = validResponses.filter((response) => response.answers[crossRowId] === rowOption)
                return (
                  <tr key={rowOption}>
                    <th>{rowOption}</th>
                    {columnQuestion.options.map((columnOption) => {
                      const count = rowResponses.filter((response) => response.answers[crossColumnId] === columnOption).length
                      const percentage = rowResponses.length > 0 ? Math.round(count / rowResponses.length * 100) : 0
                      return <td key={columnOption}><strong>{count}件</strong><small>{percentage}%</small></td>
                    })}
                    <td><strong>{rowResponses.length}件</strong></td>
                  </tr>
                )
              })}
              <tr>
                <th>合計</th>
                {columnQuestion.options.map((columnOption) => (
                  <td key={columnOption}>
                    <strong>{validResponses.filter((response) => response.answers[crossColumnId] === columnOption).length}件</strong>
                  </td>
                ))}
                <td><strong>{validResponses.length}件</strong></td>
              </tr>
            </tbody>
          </table>
          <p className="cross-note">※割合は各行の回答数を100%とした値です。両方の質問に回答したデータのみ集計しています。</p>
        </div>
      )
    })()}
  </section>
)}

{page === 'events' && (
  <section className="panel">
    <h2>イベント管理</h2>
    <p>イベントを登録して管理できます。</p>

    <div className="event-form">
      <input
        placeholder="イベント名"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
      />

      <input
        type="date"
        value={eventDate}
        onChange={(e) => setEventDate(e.target.value)}
      />

      <textarea
        placeholder="イベントの概要（任意）"
        value={eventDescription}
        onChange={(e) => setEventDescription(e.target.value)}
      />

      <button onClick={addEvent}>イベントを登録</button>
    </div>

    <h3>登録済みイベント（{events.length}件）</h3>

    {events.length === 0 ? (
      <p>まだイベントが登録されていません。</p>
    ) : (
      <div className="event-list">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <div>
              <h3>{event.name}</h3>
              <p>開催日：{event.date}</p>
              <p>{event.description}</p>
            </div>

            <button onClick={() => deleteEvent(event.id)}>
              削除
            </button>
          </div>
        ))}
      </div>
    )}
  </section>
)}


       
{page === 'survey' && (
  <section className="panel">
    <h2>アンケート作成</h2>
    <p>イベントごとに質問を自由に設定できます。</p>

    <div className="event-form">
      <label>対象イベント</label>
      <select
        value={selectedEventId}
        onChange={(e) => setSelectedEventId(e.target.value)}
      >
        <option value="">イベントを選択</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      <label>質問文</label>
      <input
        placeholder="例：SDGsへの理解は深まりましたか？"
        value={questionTitle}
        onChange={(e) => setQuestionTitle(e.target.value)}
      />

      <label>回答形式</label>
      <select
        value={questionType}
        onChange={(e) =>
          setQuestionType(e.target.value as QuestionType)
        }
      >
        <option value="single">単一選択</option>
        <option value="multiple">複数選択</option>
        <option value="rating">5段階評価</option>
        <option value="text">自由記述</option>
      </select>

      {(questionType === 'single' ||
        questionType === 'multiple') && (
        <>
          <label>選択肢（1行に1つ）</label>
          <textarea
            value={questionOptions}
            onChange={(e) =>
              setQuestionOptions(e.target.value)
            }
          />
        </>
      )}

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={questionRequired}
          onChange={(e) =>
            setQuestionRequired(e.target.checked)
          }
        />
        必須回答にする
      </label>

      <button onClick={addQuestion}>質問を追加</button>
    </div>

    <h3>登録済みの質問</h3>

    {questions
      .filter((q) => q.eventId === selectedEventId)
      .map((question, index) => (
        <div className="event-card" key={question.id}>
          <div>
            <h3>Q{index + 1}. {question.title}</h3>
            <p>
              {question.type === 'single' ? '単一選択' :
               question.type === 'multiple' ? '複数選択' :
               question.type === 'rating' ? '5段階評価' :
               '自由記述'}
              {question.required ? '・必須' : '・任意'}
            </p>
            {question.options.map((option, i) => (
              <p key={i}>・{option}</p>
            ))}
          </div>
          <button onClick={() => deleteQuestion(question.id)}>
            削除
          </button>
        </div>
      ))}
  </section>
)}

{page === 'responses' && (
  <section className="panel">
    
{responseEventId && (
  <div style={{ marginTop: '20px' }}>
    <button
      onClick={exportCSV}
      disabled={!responses.some(
        (r) => r.eventId === responseEventId
      )}
      style={{
        padding: '12px 20px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '9px',
        cursor: 'pointer',
      }}
    >
      CSVファイルをダウンロード
    </button>
  </div>
)}

    <h2>アンケート回答入力</h2>
    <p>イベントで回収した回答を入力できます。</p>

    <div className="event-form">
      <label>対象イベント</label>
      <select
        value={responseEventId}
        onChange={(e) => {
          setResponseEventId(e.target.value)
          setAnswers({})
          setEditingResponseId(null)
        }}
      >
        <option value="">イベントを選択</option>
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>

      {responseQuestions.map((question, index) => (
        <div className="response-question" key={question.id}>
          <h3>
            Q{index + 1}. {question.title}
            {question.required && (
              <span className="required-mark"> 必須</span>
            )}
          </h3>

          {question.type === 'single' &&
            question.options.map((option) => (
              <label key={option} className="answer-option">
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option}
                  onChange={() =>
                    setAnswers({
                      ...answers,
                      [question.id]: option,
                    })
                  }
                />
                {option}
              </label>
            ))}

          {question.type === 'multiple' &&
            question.options.map((option) => {
              const selected = Array.isArray(answers[question.id])
                ? answers[question.id] as string[]
                : []

              return (
                <label key={option} className="answer-option">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={(e) => {
                      const updated = e.target.checked
                        ? [...selected, option]
                        : selected.filter((v) => v !== option)

                      setAnswers({
                        ...answers,
                        [question.id]: updated,
                      })
                    }}
                  />
                  {option}
                </label>
              )
            })}

          {question.type === 'rating' && (
            <select
              value={typeof answers[question.id] === 'string' ? answers[question.id] : ''}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [question.id]: e.target.value,
                })
              }
            >
              <option value="">評価を選択</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}

          {question.type === 'text' && (
            <textarea
              placeholder="回答を入力してください"
              value={typeof answers[question.id] === 'string' ? answers[question.id] : ''}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [question.id]: e.target.value,
                })
              }
            />
          )}
        </div>
      ))}

      {responseEventId && responseQuestions.length === 0 && (
        <p>このイベントにはまだ質問がありません。</p>
      )}

      {responseQuestions.length > 0 && (
        <>
          <button onClick={saveResponse}>
            {editingResponseId ? '変更を保存' : '回答を保存'}
          </button>
          {editingResponseId && (
            <button type="button" onClick={cancelEdit} style={{ background: '#64748b' }}>
              編集をキャンセル
            </button>
          )}
        </>
      )}
    </div>

    {responseEventId && (
      <>
        <h3>保存済み回答一覧（{responses.filter((r) => r.eventId === responseEventId).length}件）</h3>
        {responses
          .filter((r) => r.eventId === responseEventId)
          .map((response, index) => (
            <div className="event-card" key={response.id} style={{ marginBottom: 12 }}>
              <div>
                <h3>回答 {index + 1}</h3>
                <p>登録日時：{new Date(response.createdAt).toLocaleString('ja-JP')}</p>
                {responseQuestions.map((question) => {
                  const value = response.answers[question.id]
                  return (
                    <p key={question.id}>
                      <strong>{question.title}：</strong>
                      {Array.isArray(value) ? value.join('、') : value || '未回答'}
                    </p>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => editResponse(response)}
                  style={{ background: '#dbeafe', color: '#1d4ed8' }}
                >
                  編集
                </button>
                <button type="button" onClick={() => deleteResponse(response.id)}>
                  削除
                </button>
              </div>
            </div>
          ))}
      </>
    )}
  </section>
)}

      </main>
    </div>
  )
}

export default App
