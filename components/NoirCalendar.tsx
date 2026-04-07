"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, isSameMonth, isSameDay, format,
  addMonths, subMonths
} from 'date-fns';
import styles from './NoirCalendar.module.css';

export interface NoirCalendarProps {
  defaultMonth?: { month: number; year: number };
  accentColor?: string;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  onNoteAdd?: (note: { date: string; note: string }) => void;
  persistNotes?: boolean;
  heroImages?: Record<number, string>;
}

interface Note {
  id: string;
  text: string;
  tag: string;
  ts: number;
  isDone: boolean;
  rangeEnd?: string;
}

const ORDINALS = ["FIRST", "SECOND", "THIRD", "FOURTH", "FIFTH", "SIXTH", "SEVENTH", "EIGHTH", "NINTH", "TENTH", "ELEVENTH", "TWELFTH"];

const UNSPLASH_IMAGES = [
  "https://picsum.photos/seed/jan/1200/800", // Jan
  "https://picsum.photos/seed/feb/1200/800", // Feb
  "https://picsum.photos/seed/mar/1200/800", // Mar
  "https://picsum.photos/seed/apr/1200/800", // Apr
  "https://picsum.photos/seed/may/1200/800", // May
  "https://picsum.photos/seed/jun/1200/800", // Jun
  "https://picsum.photos/seed/jul/1200/800", // Jul
  "https://picsum.photos/seed/aug/1200/800", // Aug
  "https://picsum.photos/seed/sep/1200/800", // Sep
  "https://picsum.photos/seed/oct/1200/800", // Oct
  "https://picsum.photos/seed/nov/1200/800", // Nov
  "https://picsum.photos/seed/dec/1200/800"  // Dec
];

function hexToRgb(hex: string) {
  let h = hex.replace(/^#/, '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  if (isNaN(num)) return '123, 154, 184';
  return `${num >> 16}, ${(num >> 8) & 255}, ${num & 255}`;
}

function autoTag(text: string) {
  const t = text.toLowerCase();
  if (t.includes("meet") || t.includes("call") || t.includes("appointment") || t.includes("schedule") || t.includes("gallery") || t.includes("exhibition") || t.includes("study") || t.includes("opening")) return "SCHEDULE";
  if (t.includes("remember") || t.includes("forget") || t.includes("must") || t.includes("submit") || t.includes("deadline")) return "REMINDER";
  return "REFLECTION";
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export default function NoirCalendar({
  defaultMonth,
  accentColor = "#7b9ab8",
  onRangeSelect,
  onNoteAdd,
  persistNotes = true,
  heroImages
}: NoirCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (defaultMonth) {
      return new Date(defaultMonth.year, defaultMonth.month, 1);
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [direction, setDirection] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthIdx = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  const [notes, setNotes] = useState<Record<string, Note[]>>({});
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    if (persistNotes && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("noir-cal-notes-v2");
        if (saved) setNotes(JSON.parse(saved));
      } catch (e) { }
    }
  }, [persistNotes]);

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handlePrevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };


  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const arr = [];
    let day = start;
    // Always render exactly 42 days (6 weeks) to lock the grid height and stop 
    // the layout from shifting up and down vertically between months
    for (let i = 0; i < 42; i++) {
      arr.push(day);
      day = addDays(day, 1);
    }
    return arr;
  }, [currentDate]);

  const recordMemo = () => {
    if (!inputText.trim()) return;

    let targetDateKey = `memo-${year}-${monthIdx}`;
    let endDateStr: string | undefined = undefined;

    if (rangeStart && rangeEnd && !isSameDay(rangeStart, rangeEnd)) {
      const actualStart = rangeStart < rangeEnd ? rangeStart : rangeEnd;
      const actualEnd = rangeStart < rangeEnd ? rangeEnd : rangeStart;
      targetDateKey = format(actualStart, 'yyyy-MM-dd');
      endDateStr = format(actualEnd, 'yyyy-MM-dd');
    } else if (rangeStart) {
      targetDateKey = format(rangeStart, 'yyyy-MM-dd');
    }
    const assignedTag = autoTag(inputText);

    const newNote: Note = {
      id: generateId(),
      text: inputText,
      tag: assignedTag,
      ts: Date.now(),
      isDone: false,
      rangeEnd: endDateStr
    };

    const newNotes = { ...notes };
    if (!newNotes[targetDateKey]) newNotes[targetDateKey] = [];
    newNotes[targetDateKey] = [...newNotes[targetDateKey], newNote];

    setNotes(newNotes);
    if (persistNotes && typeof window !== 'undefined') {
      localStorage.setItem("noir-cal-notes-v2", JSON.stringify(newNotes));
    }

    if (onNoteAdd) {
      onNoteAdd({ date: targetDateKey, note: inputText });
    }

    setInputText('');
  };

  const toggleNoteDone = (targetKey: string, noteId: string) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (updated[targetKey]) {
        updated[targetKey] = updated[targetKey].map(n =>
          n.id === noteId ? { ...n, isDone: !n.isDone } : n
        );
      }
      if (persistNotes && typeof window !== 'undefined') {
        localStorage.setItem("noir-cal-notes-v2", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteMemo = (targetKey: string, noteId: string) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (updated[targetKey]) {
        updated[targetKey] = updated[targetKey].filter(n => n.id !== noteId);
        if (updated[targetKey].length === 0) {
          delete updated[targetKey];
        }
      }
      if (persistNotes && typeof window !== 'undefined') {
        localStorage.setItem("noir-cal-notes-v2", JSON.stringify(updated));
      }
      return updated;
    });
    setRangeStart(null);
    setRangeEnd(null);
  };

  const displayNotes = useMemo(() => {
    const list: { dateLabel: string, note: Note, originalKey: string }[] = [];
    Object.keys(notes).forEach(k => {
      if (k.startsWith('memo-')) {
        const [, y, m] = k.split('-');
        if (parseInt(y) === year && parseInt(m) === monthIdx) {
          notes[k].forEach(n => list.push({ dateLabel: `${format(currentDate, 'MMM').toUpperCase()} MEMO`, note: n, originalKey: k }));
        }
      } else {
        const parsed = new Date(k + 'T00:00:00');
        notes[k].forEach(n => {
          let include = false;
          let endParsed = n.rangeEnd ? new Date(n.rangeEnd + 'T00:00:00') : null;

          if (!isNaN(parsed.getTime()) && parsed.getFullYear() === year && parsed.getMonth() === monthIdx) {
            include = true;
          } else if (endParsed && !isNaN(endParsed.getTime()) && endParsed.getFullYear() === year && endParsed.getMonth() === monthIdx) {
            include = true;
          }
          // Also include if the month falls right between the start and end month
          else if (endParsed && !isNaN(endParsed.getTime())) {
            const startCheck = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
            const endCheck = new Date(endParsed.getFullYear(), endParsed.getMonth(), 1);
            const currentCheck = new Date(year, monthIdx, 1);
            if (currentCheck > startCheck && currentCheck < endCheck) {
              include = true;
            }
          }

          if (include) {
            let label = format(parsed, 'MMM dd').toUpperCase();
            if (n.rangeEnd) {
              const eParsed = new Date(n.rangeEnd + 'T00:00:00');
              label += ` - ${format(eParsed, 'MMM dd').toUpperCase()}`;
            }
            list.push({ dateLabel: label, note: n, originalKey: k });
          }
        });
      }
    });
    list.sort((a, b) => a.note.ts - b.note.ts);
    return list;
  }, [notes, currentDate, year, monthIdx]);


  const flipVariants = {
    enter: (dir: number) => ({
      rotateX: isMobile ? 0 : (dir > 0 ? -120 : 120),
      y: isMobile ? `${100 * dir}%` : 0,
      opacity: 0,
      transformOrigin: "top center",
      zIndex: 1
    }),
    center: {
      rotateX: 0,
      y: 0,
      opacity: 1,
      transformOrigin: "top center",
      zIndex: 2
    },
    exit: (dir: number) => ({
      rotateX: isMobile ? 0 : (dir > 0 ? 120 : -120),
      y: isMobile ? `${-100 * dir}%` : 0,
      opacity: 0,
      transformOrigin: "top center",
      zIndex: 1
    }),
  };

  const cssVars = {
    '--accent-color': accentColor,
    '--accent-rgb': hexToRgb(accentColor),
    '--single-color': '#c25953',
    '--single-rgb': hexToRgb('#c25953'),
  } as React.CSSProperties;

  return (
    <div className={styles.wallCalendarWrapper} style={cssVars}>
      {/* Wall calendar top rings */}
      <div className={styles.ringsContainer}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={styles.ring} />
        ))}
      </div>

      <div className={styles.container}>
        <div className={styles.leftPanelWrapper}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={`${year}-${monthIdx}`}
              custom={direction}
              variants={flipVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className={styles.leftPanel}
              style={{
                backgroundImage: heroImages && heroImages[monthIdx]
                  ? `url(${heroImages[monthIdx]})`
                  : `url(${UNSPLASH_IMAGES[monthIdx]})`
              }}
            >
              <div className={styles.heroOverlay} />
              <div className={styles.calendarTexture} />

              <div className={styles.leftContent}>
                <div className={styles.heroArea}>
                  <h1 className={styles.monthTitle}>{format(currentDate, 'MMMM yyyy').toUpperCase()}</h1>
                </div>

                <div className={styles.calendarContainer}>
                  <div className={styles.gridHeader}>
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                      <div key={d} className={styles.dayHeader}>{d}</div>
                    ))}
                  </div>

                  <div className={styles.gridBody}>
                    {days.map((date, i) => {
                      const isCurrentMonth = isSameMonth(date, currentDate);
                      const isToday = isSameDay(date, new Date());

                      let visualStart = rangeStart;
                      let visualEnd = rangeEnd;
                      if (rangeStart && !rangeEnd) {
                        visualEnd = rangeStart;
                      } else if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
                        visualStart = rangeEnd;
                        visualEnd = rangeStart;
                      }

                      const hasRange = visualStart && visualEnd && !isSameDay(visualStart, visualEnd);
                      const isStart = visualStart && isSameDay(date, visualStart);
                      const isEnd = visualEnd && isSameDay(date, visualEnd);
                      const isSame = isStart && isEnd;
                      const isMid = visualStart && visualEnd && date > visualStart && date < visualEnd;

                      const classes = [styles.cell];
                      if (!isCurrentMonth) classes.push(styles.cellInactive);
                      if (isToday) classes.push(styles.todayCell);

                      const dateStr = format(date, 'yyyy-MM-dd');
                      let hasSingleNote = false;
                      let hasRangeNote = false;

                      Object.keys(notes).forEach(k => {
                        if (k.startsWith('memo-')) return;
                        notes[k].forEach(n => {
                          if (n.isDone) return;
                          if (!n.rangeEnd) {
                            if (k === dateStr) hasSingleNote = true;
                          } else {
                            const st = new Date(k + 'T00:00:00');
                            const ed = new Date(n.rangeEnd + 'T00:00:00');
                            if (date >= st && date <= ed) hasRangeNote = true;
                          }
                        });
                      });

                      return (
                        <div
                          key={i}
                          className={classes.join(' ')}
                        >
                          <div
                            className={`${styles.dateNumber} ${isToday ? styles.todayNumber : ''} ${(isSame && !hasRange) ? styles.selectedSingle : (isStart || isEnd ? styles.selectedEdge : '')}`}
                          >
                            {isCurrentMonth ? format(date, 'dd') : format(date, 'd')}
                          </div>

                          {isToday && <div className={styles.todayLabel}>TODAY</div>}
                          {hasSingleNote && !hasRangeNote && <div className={styles.noteDot} style={{ backgroundColor: accentColor }} />}
                          {hasRangeNote && <div className={styles.noteDot} style={{ backgroundColor: 'var(--single-color)' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.calendarTexture} />
          <div className={styles.navArrows}>
            <button className={styles.arrowBtn} onClick={handlePrevMonth}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <button className={styles.arrowBtn} onClick={handleNextMonth}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>

          <h2 className={styles.notesHeading}>Monthly Memos</h2>

          <div className={styles.notesList}>
            {displayNotes.map((item, idx) => (
              <div key={idx} className={`${styles.noteItem} ${item.note.isDone ? styles.done : ''}`}>
                <button
                  className={styles.checklistBtn}
                  onClick={() => toggleNoteDone(item.originalKey, item.note.id)}
                  aria-label="Toggle completed"
                >
                  <div className={`${styles.checkCircle} ${item.note.isDone ? styles.checkCircleDone : ''}`}>
                    <svg className={styles.checkIcon} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                </button>
                <div className={styles.noteContent}>
                  <div className={styles.noteMeta} style={{ color: item.note.isDone ? 'rgba(255,255,255,0.4)' : accentColor }}>
                    {item.dateLabel} &bull; {item.note.tag}
                  </div>
                  <div className={`${styles.noteBody} ${styles.strikethrough} ${item.note.isDone ? styles.strikethroughDone : ''}`}>
                    {item.note.text}
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteMemo(item.originalKey, item.note.id)}
                  aria-label="Delete memo"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </div>
            ))}
            {displayNotes.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontSize: '13px' }}>
                No memos for this month.
              </div>
            )}
          </div>

          <div className={styles.captureArea}>
            <div className={styles.captureLabel}>CAPTURE A THOUGHT</div>

            <div className={styles.datePickerGroup}>
              <input
                type="date"
                className={styles.dateInput}
                max={rangeEnd ? format(rangeEnd, 'yyyy-MM-dd') : undefined}
                value={rangeStart ? format(rangeStart, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value + 'T00:00:00');
                    setRangeStart(newDate);
                    setCurrentDate(newDate);
                  } else {
                    setRangeStart(null);
                  }
                }}
              />
              <span className={styles.datePickerTo}>to</span>
              <input
                type="date"
                className={styles.dateInput}
                min={rangeStart ? format(rangeStart, 'yyyy-MM-dd') : undefined}
                value={rangeEnd ? format(rangeEnd, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setRangeEnd(new Date(e.target.value + 'T00:00:00'));
                  } else {
                    setRangeEnd(null);
                  }
                }}
              />
            </div>

            <textarea
              className={styles.textarea}
              placeholder="Write a memo..."
              value={inputText}
              onFocus={() => {
                if (rangeStart) {
                  setCurrentDate(new Date(rangeStart.getTime()));
                }
              }}
              onChange={(e) => setInputText(e.target.value)}
            />



            <button
              className={styles.recordBtn}
              onClick={recordMemo}
              style={{
                backgroundColor: `rgba(var(--accent-rgb), 0.35)`,
                borderColor: `rgba(var(--accent-rgb), 0.5)`
              }}
            >
              RECORD MEMO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
