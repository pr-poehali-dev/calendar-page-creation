import { useState } from "react";
import Icon from "@/components/ui/icon";

const CATEGORIES = [
  { id: "all", label: "Все", color: "#1a1a1a" },
  { id: "work", label: "Работа", color: "#2563EB" },
  { id: "personal", label: "Личное", color: "#16A34A" },
  { id: "health", label: "Здоровье", color: "#DC2626" },
  { id: "travel", label: "Путешествия", color: "#D97706" },
];

interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  category: string;
  time?: string;
}

const SAMPLE_EVENTS: CalendarEvent[] = [
  { id: 1, date: "2026-05-05", title: "Встреча с командой", category: "work", time: "10:00" },
  { id: 2, date: "2026-05-07", title: "Йога", category: "health", time: "07:30" },
  { id: 3, date: "2026-05-12", title: "День рождения мамы", category: "personal" },
  { id: 4, date: "2026-05-14", title: "Квартальный отчёт", category: "work", time: "14:00" },
  { id: 5, date: "2026-05-17", title: "Вылет в Стамбул", category: "travel", time: "06:45" },
  { id: 6, date: "2026-05-19", title: "Врач-терапевт", category: "health", time: "11:00" },
  { id: 7, date: "2026-05-20", title: "Презентация проекта", category: "work", time: "15:00" },
  { id: 8, date: "2026-05-22", title: "Пробежка в парке", category: "health", time: "08:00" },
  { id: 9, date: "2026-05-24", title: "Встреча с друзьями", category: "personal", time: "19:00" },
  { id: 10, date: "2026-05-28", title: "Созвон с клиентом", category: "work", time: "12:00" },
  { id: 11, date: "2026-05-30", title: "Возвращение из Стамбула", category: "travel", time: "21:30" },
];

const MONTHS_RU = [
  "Январь","Февраль","Март","Апрель","Май","Июнь",
  "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
];

const DAYS_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export default function CalendarApp() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [animKey, setAnimKey] = useState(0);

  const { year, month } = currentDate;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const filteredEvents = SAMPLE_EVENTS.filter(e =>
    activeCategory === "all" ? true : e.category === activeCategory
  );

  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };

  const selectedDayEvents = selectedDay ? eventsForDay(selectedDay) : [];

  const navigate = (dir: "prev" | "next") => {
    setDirection(dir === "prev" ? "right" : "left");
    setAnimKey(k => k + 1);
    setSelectedDay(null);
    setCurrentDate(prev => {
      let m = prev.month + (dir === "next" ? 1 : -1);
      let y = prev.year;
      if (m > 11) { m = 0; y++; }
      if (m < 0) { m = 11; y--; }
      return { year: y, month: m };
    });
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const getCategoryColor = (catId: string) =>
    CATEGORIES.find(c => c.id === catId)?.color ?? "#1a1a1a";

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200 px-8 py-5 flex items-center justify-between">
        <h1 className="font-cormorant text-2xl font-light tracking-widest text-stone-800 uppercase">
          Календарь
        </h1>
        <span className="text-xs text-stone-400 tracking-widest font-golos uppercase">
          {today.getDate()} {MONTHS_RU[today.getMonth()].toLowerCase()} {today.getFullYear()}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 border-r border-stone-200 px-6 py-8 flex flex-col gap-1 shrink-0">
          <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-4">Категории</p>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-all duration-200 text-left ${
                activeCategory === cat.id
                  ? "bg-stone-100 text-stone-800"
                  : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
                style={{
                  backgroundColor: cat.color,
                  opacity: activeCategory === cat.id ? 1 : 0.4,
                }}
              />
              {cat.label}
            </button>
          ))}

          {/* Selected day events */}
          {selectedDay && (
            <div className="mt-8 animate-fade-in">
              <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase mb-3">
                {selectedDay} {MONTHS_RU[month].toLowerCase()}
              </p>
              {selectedDayEvents.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Нет событий</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {selectedDayEvents.map(event => (
                    <div key={event.id} className="group">
                      <div
                        className="w-full h-px mb-1"
                        style={{ backgroundColor: getCategoryColor(event.category) + "40" }}
                      />
                      <p className="text-xs text-stone-700 leading-snug">{event.title}</p>
                      {event.time && (
                        <p className="text-[11px] text-stone-400 mt-0.5">{event.time}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Main Calendar */}
        <main className="flex-1 px-8 py-8 overflow-auto">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate("prev")}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
            >
              <Icon name="ChevronLeft" size={16} />
            </button>
            <h2 className="font-cormorant text-3xl font-light text-stone-800 tracking-wide">
              {MONTHS_RU[month]}
              <span className="text-stone-400 ml-3 text-2xl font-light">{year}</span>
            </h2>
            <button
              onClick={() => navigate("next")}
              className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
            >
              <Icon name="ChevronRight" size={16} />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_RU.map(d => (
              <div key={d} className="text-center text-[10px] tracking-widest text-stone-400 uppercase py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div
            key={animKey}
            className={`grid grid-cols-7 border-t border-l border-stone-100 ${
              direction === "left" ? "animate-slide-left" : "animate-slide-right"
            }`}
          >
            {/* Empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-stone-100 min-h-[90px]" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayEvents = eventsForDay(day);
              const isSelected = selectedDay === day;
              const todayFlag = isToday(day);

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`border-r border-b border-stone-100 min-h-[90px] p-2 cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-stone-100"
                      : "hover:bg-stone-50"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-sm leading-none font-light ${
                        todayFlag
                          ? "text-stone-800 font-medium"
                          : "text-stone-500"
                      }`}
                    >
                      {todayFlag ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-800 text-white text-xs">
                          {day}
                        </span>
                      ) : day}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="mt-2 flex flex-col gap-0.5">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-1 group"
                        title={event.title}
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryColor(event.category) }}
                        />
                        <span className="text-[10px] text-stone-600 truncate leading-snug">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[10px] text-stone-400 pl-2">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 justify-end">
            {CATEGORIES.filter(c => c.id !== "all").map(cat => (
              <div key={cat.id} className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[10px] text-stone-400 tracking-wide">{cat.label}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
