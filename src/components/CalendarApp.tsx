import { useState } from "react";
import Icon from "@/components/ui/icon";

const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

const MONTHS_RU_GEN = [
  "января","февраля","марта","апреля","мая","июня",
  "июля","августа","сентября","октября","ноября","декабря"
];

const WEEKDAYS_RU: Record<number, string> = {
  0: "Воскресенье",
  1: "Понедельник",
  2: "Вторник",
  3: "Среда",
  4: "Четверг",
  5: "Пятница",
  6: "Суббота",
};

type TabId = "all" | "today" | "mine";

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  address: string;
  timeStart: string;
  timeEnd: string;
  status: "registered" | "cancelled" | "none";
  mine: boolean;
}

const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const pad = (n: number) => String(n).padStart(2, "0");
const m = pad(today.getMonth() + 1);
const y = today.getFullYear();

const EVENTS: CalendarEvent[] = [
  { id: 1, date: `${y}-${m}-12`, title: "Ярмарка направлений", address: "ул. Павла Корчагина, 22 ДоброЦентр", timeStart: "17:00", timeEnd: "19:00", status: "registered", mine: true },
  { id: 2, date: `${y}-${m}-14`, title: "Ярмарка направлений", address: "ул. Павла Корчагина, 22 ДоброЦентр", timeStart: "17:00", timeEnd: "19:00", status: "cancelled", mine: false },
  { id: 3, date: `${y}-${m}-23`, title: "Ярмарка направлений", address: "ул. Павла Корчагина, 22 ДоброЦентр", timeStart: "17:00", timeEnd: "19:00", status: "registered", mine: true },
  { id: 4, date: todayStr, title: "Встреча волонтёров", address: "ул. Ленина, 5 Центр занятости", timeStart: "10:00", timeEnd: "12:00", status: "registered", mine: true },
];

function groupByDate(events: CalendarEvent[]) {
  const map: Record<string, CalendarEvent[]> = {};
  events.forEach(e => {
    if (!map[e.date]) map[e.date] = [];
    map[e.date].push(e);
  });
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
}

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return WEEKDAYS_RU[d.getDay()];
}

function formatDayNum(dateStr: string) {
  return parseInt(dateStr.split("-")[2], 10);
}

function formatMonthShort(dateStr: string) {
  const idx = parseInt(dateStr.split("-")[1], 10) - 1;
  return MONTHS_RU_GEN[idx].slice(0, 3);
}

export default function CalendarApp() {
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [tab, setTab] = useState<TabId>("all");
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState<Record<number, boolean>>(
    () => {
      const init: Record<number, boolean> = {};
      EVENTS.forEach(e => { init[e.id] = e.status === "registered"; });
      return init;
    }
  );

  const navigate = (dir: "prev" | "next") => {
    setCurrentMonth(prev => {
      let nm = prev + (dir === "next" ? 1 : -1);
      let ny = currentYear;
      if (nm > 11) { nm = 0; ny++; }
      if (nm < 0) { nm = 11; ny--; }
      setCurrentYear(ny);
      return nm;
    });
  };

  const filtered = EVENTS.filter(e => {
    const eMonth = parseInt(e.date.split("-")[1], 10) - 1;
    const eYear = parseInt(e.date.split("-")[0], 10);
    if (eMonth !== currentMonth || eYear !== currentYear) return false;
    if (tab === "today" && e.date !== todayStr) return false;
    if (tab === "mine" && !e.mine) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = groupByDate(filtered);

  const toggleRegistration = (id: number) => {
    setRegistrations(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const TABS: { id: TabId; label: string }[] = [
    { id: "all", label: "Все" },
    { id: "today", label: "Сегодня" },
    { id: "mine", label: "Мои мероприятия" },
  ];

  return (
    <div className="min-h-screen bg-[#EFEFF4] flex font-golos">
      {/* Sidebar */}
      <aside className="w-36 bg-white flex flex-col py-6 px-4 shrink-0 border-r border-gray-100">
        <div className="mb-10">
          <span className="font-cormorant text-xl font-bold tracking-wider text-gray-900 uppercase">Афиша</span>
        </div>
        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-50 transition-colors text-left">
            <Icon name="LayoutGrid" size={15} />
            Главная
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 bg-purple-50 transition-colors text-left">
            <Icon name="CalendarDays" size={15} />
            Календарь
          </button>
        </nav>
        <div className="mt-auto">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            <Icon name="LogOut" size={15} />
            Выход
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="px-8 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Icon name="Search" size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по событиям"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-transparent rounded-full pl-10 pr-4 py-2.5 text-sm text-gray-600 placeholder-gray-400 outline-none focus:border-purple-300 transition-colors shadow-sm"
              />
            </div>
            <div className="w-9 h-9 rounded-full bg-[#2D2D5E] flex items-center justify-center text-white text-xs font-semibold shrink-0">
              АБ
            </div>
          </div>

          {/* Month nav */}
          <div className="flex items-center justify-center gap-5 mt-5">
            <button onClick={() => navigate("prev")} className="text-gray-400 hover:text-gray-700 transition-colors">
              <Icon name="ChevronLeft" size={17} />
            </button>
            <span className="text-sm font-medium text-gray-700 w-28 text-center">
              {MONTHS_RU[currentMonth]} {currentYear}
            </span>
            <button onClick={() => navigate("next")} className="text-gray-400 hover:text-gray-700 transition-colors">
              <Icon name="ChevronRight" size={17} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center mt-3 border-b border-gray-200">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-6 pb-2 pt-1 text-sm transition-colors ${
                  tab === t.id
                    ? "text-purple-600 font-medium"
                    : "text-gray-400 hover:text-gray-500"
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-purple-600 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-6 overflow-auto">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              {tab === "today" && (
                <p className="text-sm text-gray-400 mb-5">
                  Сегодня, {today.getDate()} {MONTHS_RU_GEN[today.getMonth()]}
                </p>
              )}
              <p className="text-purple-400 text-base">У вас нет запланированных мероприятий</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-2xl">
              {grouped.map(([dateStr, events]) => (
                <div key={dateStr}>
                  <h3 className="text-purple-500 font-semibold text-base mb-3">
                    {formatDayHeader(dateStr)}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="bg-white rounded-2xl px-5 py-4 flex items-center gap-5 shadow-sm"
                      >
                        {/* Date */}
                        <div className="flex flex-col items-center w-10 shrink-0">
                          <span className="text-purple-600 text-3xl font-bold leading-none">
                            {formatDayNum(event.date)}
                          </span>
                          <span className="text-purple-400 text-xs mt-0.5 capitalize">
                            {formatMonthShort(event.date)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium text-sm">{event.title}</p>
                          <p className="text-gray-400 text-xs mt-0.5 truncate">{event.address}</p>
                          <p className="text-purple-500 text-xs mt-1.5 font-medium">
                            {event.timeStart} – {event.timeEnd}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          {event.status === "cancelled" ? (
                            <span className="text-xs text-red-400 bg-red-50 rounded-full px-3 py-1">
                              Отменено
                            </span>
                          ) : registrations[event.id] ? (
                            <span className="text-xs text-green-600 bg-green-50 rounded-full px-3 py-1">
                              Вы записаны
                            </span>
                          ) : null}
                          <button
                            onClick={() => toggleRegistration(event.id)}
                            disabled={event.status === "cancelled"}
                            className={`text-xs border rounded-full px-4 py-1.5 transition-colors ${
                              event.status === "cancelled"
                                ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                : "border-gray-300 text-gray-500 hover:border-purple-300 hover:text-purple-500"
                            }`}
                          >
                            {registrations[event.id] ? "Отменить запись" : "Записаться"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
