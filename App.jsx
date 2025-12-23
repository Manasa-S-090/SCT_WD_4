import { useEffect, useState } from 'react'

const STORAGE_KEY = 'todo_vite_task3_priority'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function App() {
  const [lists, setLists] = useState([
    { id: 'inbox', name: 'Inbox', tasks: [] }
  ])
  const [activeList, setActiveList] = useState('inbox')

  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [editingId, setEditingId] = useState(null)

  const [filter, setFilter] = useState('all')
  const [dark, setDark] = useState(false)

  /* Load from localStorage */
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (data) {
      setLists(data.lists)
      setActiveList(data.activeList)
      setDark(data.dark)
    }
  }, [])

  /* Save to localStorage */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ lists, activeList, dark })
    )
  }, [lists, activeList, dark])

  const current = lists.find(l => l.id === activeList)

  function addOrEditTask() {
    if (!title.trim()) return

    if (editingId) {
      setLists(lists.map(l =>
        l.id === activeList
          ? {
              ...l,
              tasks: l.tasks.map(t =>
                t.id === editingId
                  ? { ...t, title, due, priority }
                  : t
              )
            }
          : l
      ))
      setEditingId(null)
    } else {
      const newTask = {
        id: uid(),
        title,
        due,
        priority,
        completed: false
      }
      setLists(lists.map(l =>
        l.id === activeList
          ? { ...l, tasks: [newTask, ...l.tasks] }
          : l
      ))
    }

    setTitle('')
    setDue('')
    setPriority('Medium')
  }

  function editTask(task) {
    setTitle(task.title)
    setDue(task.due || '')
    setPriority(task.priority)
    setEditingId(task.id)
  }

  function toggleTask(id) {
    setLists(lists.map(l =>
      l.id === activeList
        ? {
            ...l,
            tasks: l.tasks.map(t =>
              t.id === id ? { ...t, completed: !t.completed } : t
            )
          }
        : l
    ))
  }

  function deleteTask(id) {
    setLists(lists.map(l =>
      l.id === activeList
        ? { ...l, tasks: l.tasks.filter(t => t.id !== id) }
        : l
    ))
  }

  function addList() {
    const name = prompt('New list name')
    if (!name) return
    const id = uid()
    setLists([...lists, { id, name, tasks: [] }])
    setActiveList(id)
  }

  const visibleTasks = current?.tasks.filter(t =>
    filter === 'all' ||
    (filter === 'active' && !t.completed) ||
    (filter === 'completed' && t.completed)
  )

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <aside className="sidebar">
        <h2>Lists</h2>
        {lists.map(l => (
          <div
            key={l.id}
            className={l.id === activeList ? 'list active' : 'list'}
            onClick={() => setActiveList(l.id)}
          >
            {l.name}
          </div>
        ))}
        <button onClick={addList}>+ Add List</button>
        <button className="toggle" onClick={() => setDark(!dark)}>
          {dark ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>
      </aside>

      <main className="main">
        <h1>{current?.name}</h1>

        <div className="controls">
          <input
            placeholder="Task title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <input
            type="datetime-local"
            value={due}
            onChange={e => setDue(e.target.value)}
          />

          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button onClick={addOrEditTask}>
            {editingId ? 'Save' : 'Add'}
          </button>
        </div>

        <div className="filters">
          <button onClick={() => setFilter('all')}>All</button>
          <button onClick={() => setFilter('active')}>Active</button>
          <button onClick={() => setFilter('completed')}>Completed</button>
        </div>

        <ul className="tasks">
          {visibleTasks?.map(t => (
            <li key={t.id} className={`task ${t.completed ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t.id)}
              />

              <span className="title">{t.title}</span>

              <span className={`priority ${t.priority.toLowerCase()}`}>
                {t.priority}
              </span>

              {t.due && (
                <small>{new Date(t.due).toLocaleString()}</small>
              )}

              <button onClick={() => editTask(t)}>✏️</button>
              <button onClick={() => deleteTask(t.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
