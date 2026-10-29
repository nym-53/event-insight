
export const demoEvent = {
  id: 'demo-event-001',
  name: '地域イベント・SDGs啓発ブース（デモ）',
  date: '2026-10-01',
  description:
    '企業のサステナビリティ活動に関する架空のアンケートです。回答データはすべてデモ用であり、実際の調査結果ではありません。',
}

export const demoQuestions = [
  {
    id: 'demo-q1',
    eventId: 'demo-event-001',
    title: '年代を教えてください',
    type: 'single',
    options: [
      '10代', '20代', '30代',
      '40代', '50代', '60代以上'
    ],
    required: true,
  },
  {
    id: 'demo-q2',
    eventId: 'demo-event-001',
    title: '性別を教えてください',
    type: 'single',
    options: [
      '男性', '女性', 'その他', '回答しない'
    ],
    required: true,
  },
  {
    id: 'demo-q3',
    eventId: 'demo-event-001',
    title: 'ブースに来る前から、出展企業のサステナビリティへの取組を知っていましたか？',
    type: 'single',
    options: [
      '今回初めて知った',
      '聞いたことはあったが、内容はよく知らなかった',
      'ある程度知っていた',
      'よく知っていた'
    ],
    required: true,
  },
  {
    id: 'demo-q4',
    eventId: 'demo-event-001',
    title: '出展企業の食品ロス削減、資源循環、環境配慮への理解は深まりましたか？',
    type: 'single',
    options: [
      'とても深まった',
      'やや深まった',
      'どちらともいえない',
      'あまり深まらなかった',
      'まったく深まらなかった'
    ],
    required: true,
  },
  {
    id: 'demo-q5',
    eventId: 'demo-event-001',
    title: '「てまえどり」やリサイクルなどを自分も実践したいと思いましたか？',
    type: 'single',
    options: [
      'とてもそう思う',
      'ややそう思う',
      'どちらともいえない',
      'あまり思わない',
      'まったく思わない'
    ],
    required: true,
  },
  {
    id: 'demo-q6',
    eventId: 'demo-event-001',
    title: 'コンビニは、買い物の場所だけでなく、地域の人々がSDGsや環境について学ぶ場所にもなり得ると思いますか？',
    type: 'single',
    options: [
      'とてもそう思う',
      'ややそう思う',
      'どちらともいえない',
      'あまり思わない',
      'まったく思わない'
    ],
    required: true,
  },
  {
    id: 'demo-q7',
    eventId: 'demo-event-001',
    title: '地域イベントで、企業がSDGsを伝えるブースを出すことは有益だと思いますか？',
    type: 'single',
    options: [
      'とても有益だと思う',
      'やや有益だと思う',
      'どちらともいえない',
      'まったく有益ではない'
    ],
    required: true,
  },
]

const ageGroups = [
  '10代', '20代', '30代',
  '40代', '50代', '60代以上'
]

const awarenessOptions = [
  '今回初めて知った',
  '聞いたことはあったが、内容はよく知らなかった',
  'ある程度知っていた',
  'よく知っていた'
]

const understandingOptions = [
  'とても深まった',
  'やや深まった',
  'どちらともいえない',
  'あまり深まらなかった',
  'まったく深まらなかった'
]

const agreementOptions = [
  'とてもそう思う',
  'ややそう思う',
  'どちらともいえない',
  'あまり思わない',
  'まったく思わない'
]

const usefulnessOptions = [
  'とても有益だと思う',
  'やや有益だと思う',
  'どちらともいえない',
  'まったく有益ではない'
]

export const demoResponses = Array.from(
  { length: 30 },
  (_, index) => {
    const ageIndex = index % ageGroups.length

    return {
      id: `demo-response-${index + 1}`,
      eventId: 'demo-event-001',
      answers: {
        'demo-q1': ageGroups[ageIndex],
        'demo-q2':
          index % 2 === 0 ? '女性' : '男性',
        'demo-q3':
          awarenessOptions[(index * 3) % 4],
        'demo-q4':
          understandingOptions[
            index % 10 === 0 ? 2 : index % 3 === 0 ? 1 : 0
          ],
        'demo-q5':
          agreementOptions[
            index % 8 === 0 ? 2 : index % 3 === 0 ? 1 : 0
          ],
        'demo-q6':
          agreementOptions[
            index % 7 === 0 ? 2 : index % 4 === 0 ? 1 : 0
          ],
        'demo-q7':
          usefulnessOptions[
            index % 9 === 0 ? 2 : index % 3 === 0 ? 1 : 0
          ],
      },
      createdAt: new Date(
        2026, 9, 1, 10, index
      ).toISOString(),
    }
  }
)
